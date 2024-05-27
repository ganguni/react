from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, Text, String
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from typing import Optional
import json
import openai
from openai._client import OpenAI
from fastapi.middleware.cors import CORSMiddleware

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

api_key = ''
client = OpenAI(api_key=api_key)

class CreateGPTRequest(BaseModel):
    repeat_count: int

# 상태 저장을 위한 전역 변수
status = {"completed": False}

@app.post("/runfastapi")
async def run_fastapi(request_data: CreateGPTRequest):
    try:
        file_md = "prompt.md"
        with open(file_md, "r", encoding="utf-8") as file:
            prompt_text = file.read()

        for _ in range(request_data.repeat_count):
            result = client.chat.completions.create(
                model='gpt-3.5-turbo-0125',
                max_tokens=200,
                response_format={"type": "json_object"},
                temperature=1.1,
                messages=[
                    {'role': 'system', 'content': prompt_text},
                    {'role': 'user', 'content': f"age : 12 나에게 맞는 객관식 영어문제를 랜덤한 subject들을 사용해 심플고 유치원생 수준의 난이도로 만들어줘."}
                ]
            )
            inputGPT = result.choices[0].message.content.strip()
            print(inputGPT)  # 결과를 터미널에 출력

            # 데이터베이스에 결과 저장
            db = SessionLocal()
            try:
                data = json.loads(inputGPT)
                question = Questionqq(
                    qes_desc=data["question"],
                    qes_detail=data.get("example", None),  # example이 없을 수 있음
                    ex1=data["option1"],
                    ex2=data["option2"],
                    ex3=data["option3"],
                    ex4=data["option4"],
                    ex5=data["option5"],
                    qes_answer=data["answer"],
                    qes_level="1",
                    qes_type="객관식"
                )
                db.add(question)
                db.commit()
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail=str(e))
            finally:
                db.close()

        status["completed"] = True  # 상태 업데이트
        return {"message": "데이터 저장 성공"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/checkstatus")
def check_status(count: int):
    return {"completed": status["completed"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
