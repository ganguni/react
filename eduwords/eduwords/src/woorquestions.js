import React, { useState, useEffect } from "react";
import axios from "axios";
import NavbarT from "../src/Component/NavbarT";
import Navbar from "../src/Component/Navbar";
import "../src/woorquestions.css";
import { useNavigate } from "react-router-dom";

const QuestionItem = ({ question, isSelected, onSelect, onDelete }) => {
  return (
    <div
      className={`wq-question ${isSelected ? "wq-selected" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(question);
      }}
    >
      <p>
        <strong>문제:</strong> {question.qes_desc}
      </p>
      <p>
        <strong>지문:</strong> {question.qes_detail}
      </p>
      <p>
        <strong>①</strong> {question.ex1}
      </p>
      <p>
        <strong>②</strong> {question.ex2}
      </p>
      <p>
        <strong>③</strong> {question.ex3}
      </p>
      <p>
        <strong>④</strong> {question.ex4}
      </p>
      <p>
        <strong>⑤</strong> {question.ex5}
      </p>
      <p>
        <strong>정답:</strong> {question.qes_answer}
      </p>
      <div className="wq-btn-container">
        <button
          className="wq-btn1"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(question);
          }}
        >
          선택
        </button>
        <button
          className="wq-btn2"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(question.qes_seq);
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

const type = sessionStorage.getItem("mem_type");

const WoorQuestions = () => {
  const navigate = useNavigate();
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const savedQuestions =
      JSON.parse(localStorage.getItem("selectedQuestions")) || [];
    setSelectedQuestions(savedQuestions);
    setSelectedQuestionIds(savedQuestions.map((question) => question.qes_seq));
    setSelectedCount(savedQuestions.length);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "selectedQuestions",
      JSON.stringify(selectedQuestions)
    );
  }, [selectedQuestions]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.post("http://localhost:8081/questions", {
          filter: "exampleFilter", // 필요한 경우 필터를 추가합니다.
        });
        setQuestions(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const divideIntoColumns = (arr, columns) => {
    const divided = [];
    const chunkSize = Math.ceil(arr.length / columns);
    for (let i = 0; i < columns; i++) {
      divided.push(arr.slice(i * chunkSize, (i + 1) * chunkSize));
    }
    return divided;
  };

  const handleSelect = (question) => {
    if (!selectedQuestionIds.includes(question.qes_seq)) {
      setSelectedQuestions((prevQuestions) => [...prevQuestions, question]);
      setSelectedCount((prevCount) => prevCount + 1);
      setSelectedQuestionIds((prevIds) => [...prevIds, question.qes_seq]);
    } else {
      setSelectedQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q.qes_seq !== question.qes_seq)
      );
      setSelectedCount((prevCount) => prevCount - 1);
      setSelectedQuestionIds((prevIds) =>
        prevIds.filter((id) => id !== question.qes_seq)
      );
    }
  };

  const deleteQ = async (id) => {
    try {
      await axios.delete(`http://localhost:8081/questions/${id}`);
      setSelectedQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question.qes_seq !== id)
      );
      setSelectedQuestionIds((prevIds) =>
        prevIds.filter((questionId) => questionId !== id)
      );
      setSelectedCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const columns = divideIntoColumns(questions, 2);

  const handleBack = () => {
    navigate(-2);
  };

  const handleGenerate = () => {
    navigate("/allpreview", {
      state: {
        selectedQuestions: selectedQuestions,
      },
    });
  };

  return (
    <div>
      {type === "1" ? <NavbarT /> : <Navbar />}
      <h2 className="wq-title">· 출제 문제 선택</h2>
      <div className="wq-container">
        <div className="wq-box">
          {columns.map((column, index) => (
            <div key={index} className="wq-column">
              {column.map((question) => (
                <QuestionItem
                  key={question.qes_seq} // 여기 key prop 추가
                  question={question}
                  isSelected={selectedQuestionIds.includes(question.qes_seq)}
                  onSelect={handleSelect}
                  onDelete={deleteQ}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="wq-p">현재 선택된 문제 수: {selectedCount}</p>
      <div className="wq-btnbox">
        <button className="wq-back" onClick={handleBack}>
          뒤로가기
        </button>
        <button className="wq-btn" onClick={handleGenerate}>
          문제생성
        </button>
      </div>
      <br />
      <br />
    </div>
  );
};

export default WoorQuestions;
