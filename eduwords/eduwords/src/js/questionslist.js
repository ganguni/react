import React, { useState, useEffect } from "react";
import tb from "../img/tb.png";
import "../css/questionslist.css";
import NavbarT from "../Component/NavbarT";

import { useLocation, useNavigate } from "react-router-dom";

const type = sessionStorage.getItem("mem_type");
const mem_id = sessionStorage.getItem("mem_id");
const mem_name = sessionStorage.getItem("mem_name");
const mem_address = sessionStorage.getItem("mem_address");
const mem_number = sessionStorage.getItem("mem_number");
const mem_email = sessionStorage.getItem("mem_email");

const QuestionsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const examInfo = location.state?.examInfo || {};
  const { examName, startDate, endDate } = examInfo;

  const handleTableClick = () => {
    navigate("/namelist", {
      state: {
        selectedAnswers: location.state?.selectedAnswers,
        examInfo: examInfo,
      },
    });
  };

  return (
    <div>
      <NavbarT />
      <img src={tb} className="tbimg" alt="table"></img>
      <table className="t-listtable" onClick={handleTableClick}>
        <tbody>
          <tr className="t-listtable-tr1">
            <th colSpan={2}>
              {startDate} ~ {endDate}
            </th>
          </tr>
          <tr className="t-listtable-tr2">
            <td colSpan={2} className="exam-name">
              {examName}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default QuestionsList;
