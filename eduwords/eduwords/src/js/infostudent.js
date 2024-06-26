import React, { useState, useEffect } from "react";
import axios from "axios";
import NavbarT from "../Component/NavbarT";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useNavigate } from "react-router-dom";
import "../css/infostudent.css";
import "../css/chart.css";

Chart.register(...registerables);

const Infostudent = () => {
  const [memId, setMemId] = useState(sessionStorage.getItem("mem_id"));
  const [name, setName] = useState(sessionStorage.getItem("mem_name"));
  const [address, setAddress] = useState(sessionStorage.getItem("mem_address"));
  const [number, setNumber] = useState(sessionStorage.getItem("mem_number"));
  const [email, setEmail] = useState(sessionStorage.getItem("mem_email"));

  const [chartData, setChartData] = useState([]);
  const [formattedData, setFormattedData] = useState([]);

  const studentId = sessionStorage.getItem("studentId");
  const studentName = sessionStorage.getItem("studentName");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("http://localhost:8081/getTests", {
          mem_id: studentId,
        });

        const calculateScore = (studentAnswer, answerKey) => {
          const studentAnswers = JSON.parse(studentAnswer);
          const answerKeys = JSON.parse(answerKey);

          let correctAnswers = 0;
          const totalQuestions = Object.keys(answerKeys).length;

          for (let key in studentAnswers) {
            if (studentAnswers[key] === answerKeys[key]) {
              correctAnswers++;
            }
          }

          const score = (correctAnswers / totalQuestions) * 100;
          return Math.round(score * 10) / 10; // 소수점 첫째 자리에서 반올림
        };

        const formattedData = response.data.map((item) => {
          const date = new Date(item.submitted_at);
          const formattedDate = date
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\./g, "")
            .replace(/\s/g, "");

          const score = calculateScore(item.answer, item.answerCheck);

          return {
            date: formattedDate,
            workbookName: item.workbookName,
            score: parseFloat(score), // 소수점 이하 2자리로 제한된 점수를 숫자로 변환
          };
        });

        setChartData(formattedData);
        setFormattedData(formattedData);
        console.log("응답", response.data);
      } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
      }
    };

    fetchData();
  }, [studentId]);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/teacher");
  };

  const averageScore =
    Math.round(
      (formattedData.reduce((sum, item) => sum + item.score, 0) /
        formattedData.length) *
        10
    ) / 10;

  const chartIn = {
    labels: formattedData.map((item) => item.date),
    datasets: [
      {
        label: "점수",
        data: formattedData.map((item) => item.score),
        backgroundColor: "#239aff",
        borderColor: "#239aff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 14,
          },
          color: "#239aff",
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
    maintainAspectRatio: true,
  };

  return (
    <div>
      <header>
        <NavbarT />
      </header>
      <br />
      <h2 className="titleText">· 내 학생관리</h2>
      <br />
      <br />
      <br />
      <br />
      <h3 className="stuName">{studentName}</h3>
      <div className="infoBody">
        <div className="doneHomework">
          <th>· 푼 문제집{"(100%)"}</th>
          <br />
          <br />
          {formattedData.map((item, index) => (
            <tr key={index}>
              <td>{`${item.date} - ${item.workbookName}`}</td>
            </tr>
          ))}
        </div>
        <div className="lookEasy">
          <h2 className="chart-title">학생 성적 보기</h2>
          <br></br>
          <div className="chart-box">
            <div className="chart">
              <Bar data={chartIn} options={options} />
              <h3 className="chart-h3">평균 점수: {averageScore.toFixed(1)}</h3>
            </div>
          </div>
        </div>
      </div>
      <br />
      <div className="infoEdit"></div>
      <br />
      <br />
      <button className="is-btn" onClick={handleBack}>
        확인
      </button>
      <br />
      <br />
    </div>
  );
};

export default Infostudent;
