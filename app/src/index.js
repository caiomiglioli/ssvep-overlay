import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

import Main from "./pages/main/Main";
import Targets from "./pages/targets/Targets";
import "./index.css";

const Location = () => {
  const location = useLocation();
  console.log(location.pathname); // Isso vai logar a rota atual

  return <p>{location.pathname}</p>;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    {/* <HashRouter> */}
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/targets" element={<Targets />} />
    </Routes>
    {/* <Location/> */}
    {/* </HashRouter> */}
  </BrowserRouter>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
