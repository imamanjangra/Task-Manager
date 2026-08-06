import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/Pages/Login.tsx";
import Signup from "./Pages/Signup";

// import Login from "@/pages/Login"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
