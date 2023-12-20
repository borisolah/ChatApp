import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Login from "./components/Login";
import Chat from "./components/Chat";
import RequireAuth from "./components/RequireAuth";

const ROLES = {
  User: "user",
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="login" element={<Login />} />{" "}
        <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
          <Route path="/" element={<Chat />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
