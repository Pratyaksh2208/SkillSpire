import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "./pages/Login.jsx";
import Navbar from "./components/common/Navbar";

function App() {
  return (
      <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/> }/>
          <Route path="/login" element={<Login/> }/>
        </Routes>
      </div>
  );
}

export default App;
