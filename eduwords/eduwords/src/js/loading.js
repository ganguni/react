import React, { useEffect, useState } from "react";
import "../css/loading.css";
import NavbarT from "../Component/NavbarT";
import Navbar from "../Component/Navbar";
import LoadingImg from "../img/loading.png";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const type = sessionStorage.getItem("mem_type");

const Loading = () => {
  const [loadingText, setLoadingText] = useState("Loading");
  const navigate = useNavigate();
  const location = useLocation();
  const { problemCount, questionType } = location.state || {};

  useEffect(() => {
    const textArray = ["Loading", "Loading .", "Loading ..", "Loading ..."];
    let index = 0;

    const intervalId = setInterval(() => {
      setLoadingText(textArray[index]);
      index = (index + 1) % textArray.length;
    }, 500); // 0.5초마다 변경

    const source = axios.CancelToken.source(); // CancelToken 생성

    const sendDataToFastAPI = async () => {
      try {
        const response = await axios.post("http://localhost:8000/runfastapi", {
          repeat_count: problemCount,
          question_type: questionType,
        }, {
          cancelToken: source.token // 요청 객체에 CancelToken 설정
        });
        if (response.status === 200) {
          console.log("FastAPI response:", response.data);
          navigate("/wq"); // FastAPI와의 통신이 성공하면 다음 페이지로 이동
        } else {
          console.error("FastAPI error:", response.statusText);
          // 에러 처리
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.error("Error sending data to FastAPI:", error);
          // 에러 처리
        }
      }
    };

    sendDataToFastAPI();

    return () => {
      clearInterval(intervalId);
      // 요청 취소
      source.cancel("Component unmounted");
    }; // 컴포넌트 언마운트 시 타이머 클리어
  }, [navigate, problemCount, questionType]);

  return (
    <div>
      {type === 1 ? <NavbarT /> : <Navbar />}
      <br />
      <br />
      <br />
      <div className="loadingdiv">
        <img src={LoadingImg} className="loadingImg" alt="Loading" />
        <br />
        <br />
        <b id="LoadingText">{loadingText}</b>
        <br />
        <br />
        <table id="LoadingNow">
          <tr id="Load1">문제 생성중입니다.</tr>
          <br />
          <tr id="Load2">잠시만 기다려주세요.</tr>
        </table>
      </div>
    </div>
  );
};

export default Loading;
