import React from "react";
import "../footer.css";
import lg2 from "../img/logo2.png";

const Footer = () => {
  return (
    <div id="footer" role="contentinfo">
      <div className="logo-box">
        <div className="logo-icon">
          <img src={lg2} className="footerimg" alt="" />
        </div>
        <div className="logo-box-1">
          <p className="footer-text1">대표번호</p>
          <p className="footer-text1">010-8945-1455</p>
        </div>

        <div className="logo-box-2">
          <div className="link-container">
            <a target="_blank" href="#" className="link_partner">
              홈
            </a>
            <a target="_blank" href="#" className="link_partner">
              이용약관
            </a>
            <a target="_blank" href="#" className="link_partner">
              개인정보방침
            </a>
          </div>
          <p className="footer-text3">
            평일 09:00 ~ 18:00 / 점심 12:50 ~ 02:00
          </p>
          <p className="footer-text3">휴무 : 토 / 일 / 공휴일 </p>
        </div>

        <div className="logo-box-3">
          <p className="footer-text3">스마트인재개발원 진수팀</p>
          <p className="footer-text3">광주광역시 남구 송암로 60</p>
        </div>

        <div className="logo-box-4">
          <p className="footer-text2">대표 : 김진수</p>
          <p className="footer-text3">E-mail : Jinsuzzing@naver.com</p>
          <p className="footer-text3">Fax : 062-000-0000</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;