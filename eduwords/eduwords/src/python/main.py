from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, Text, String
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from typing import Optional
import requests
import json
import openai
from openai._client import OpenAI
from pydantic import Field
from fastapi.middleware.cors import CORSMiddleware
import logging

# PostgreSQL 연결 정보 설정
DATABASE_URL = ""

# SQLAlchemy 엔진 생성
engine = create_engine(DATABASE_URL)

# 세션 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLAlchemy Base 클래스 생성
Base = declarative_base()

# Questionqq 모델 정의
class Questionqq(Base):
    __tablename__ = "tb_question"
    qes_seq = Column(Integer, primary_key=True, index=True)
    qes_desc = Column(Text, nullable=False)
    qes_detail = Column(Text, nullable=True)
    ex1 = Column(String(2000), nullable=True)
    ex2 = Column(String(2000), nullable=True)
    ex3 = Column(String(2000), nullable=True)
    ex4 = Column(String(2000), nullable=True)
    ex5 = Column(String(2000), nullable=True)
    qes_answer = Column(String(2000), nullable=False)
    qes_level = Column(String(20), nullable=False)
    qes_type = Column(String(20), nullable=False)

# FastAPI 앱 설정
app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용 (보안상 모든 오리진을 허용하는 것은 좋지 않을 수 있습니다. 필요한 경우 실제 도메인을 지정하세요.)
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # 허용할 HTTP 메서드 지정
    allow_headers=["*"],  # 모든 헤더 허용
)

# OpenAI API 설정
api_key = ''
client = OpenAI(api_key=api_key)

class CreateGPTRequest(BaseModel):
    repeat_count: int
    question_type: str

@app.post("/runfastapi")
async def run_fastapi(request_data: CreateGPTRequest):
    try:
        file_md = "prompt.md"
        with open(file_md, "r", encoding="utf-8") as file:
            prompt_text = file.read()

        for _ in range(request_data.repeat_count): # 요청 반복 실행
            try:
                result = client.chat.completions.create(
                    model='gpt-3.5-turbo-0125',
                    max_tokens=200,
                    response_format={"type": "json_object"},
                    temperature=1.29,
                    messages=[
                        {'role': 'system', 'content': prompt_text},
                        {'role': 'user', 'content': f"12살에 맞는 subject를 골라서 {request_data.question_type} 영어문제를 만들어줘. 대신 난이도는 유치원생 수준의 난이도로 하고 문제의 구성을 간단하게 만들어줘."}
                    ]
                )
                inputGPT = result.choices[0].message.content.strip()
                print(f"Generated content from OpenAI: {inputGPT}")

                # JSON 데이터
                data = json.loads(inputGPT)

                # 데이터베이스에 결과 저장
                db = SessionLocal()
                try:
                    question = Questionqq(
                        qes_desc=data["question"],
                        qes_detail=data.get("example", None),
                        ex1=data.get("option1", None),
                        ex2=data.get("option2", None),
                        ex3=data.get("option3", None),
                        ex4=data.get("option4", None),
                        ex5=data.get("option5", None),
                        qes_answer=data["answer"],
                        qes_level="1",  # 예시 레벨
                        qes_type=request_data.question_type,  # 전달받은 문제 유형
                    )
                    db.add(question)
                    db.commit()
                except Exception as e:
                    db.rollback()
                    logging.error(f"Database error: {str(e)}")
                    # 한 요청에 대한 오류 발생해도 전체 요청이 중단되지 않도록 pass 처리
                finally:
                    db.close()
            except Exception as e:
                logging.error(f"Error in processing request: {str(e)}")
                continue  # 오류가 발생한 경우 반복문 계속 실행
    except Exception as e:
        logging.error(f"Server error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "데이터 저장 성공"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

