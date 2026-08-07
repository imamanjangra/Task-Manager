import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/Pages/Login.tsx";
import Signup from "./Pages/Signup";
import Layout from "./Layout/Layout";
import Dashboard from "./Pages/Dashboard";
import { useAppSelector } from "@/Hooks/Redux.ts";
import { useEffect } from "react";
import Workspace from "./Pages/Worksapce";

// import Login from "@/pages/Login"

export default function App() {

const theme = useAppSelector((state) => state.mode.theme);

 useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );
  }, [theme]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

          <Route
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
          path="/"
        />

          <Route
          element={
            <Layout>
              <Workspace/>
            </Layout>
          }
          path="/Workspaces"
        />
      </Routes>
    </BrowserRouter>
  );
}
