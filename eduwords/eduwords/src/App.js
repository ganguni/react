import "./App.css";
import { Route, Routes } from "react-router-dom";
import Join from "./js/join";
import Main from "./main";
import CreateAI from "./js/createai"; // 경로에 맞게 import 경로를 수정하세요
import Loading from "./js/loading"; // 경로에 맞게 import 경로를 수정하세요

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/join" element={<Join />} />
        <Route path="/createai" element={<CreateAI />} /> {/* 추가된 라우트 */}
        <Route path="/loading" element={<Loading />} /> {/* 추가된 라우트 */}
      </Routes>
    </div>
  );
}

export default App;
