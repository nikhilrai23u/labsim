import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Experiments from "./pages/Experiments";
import ExperimentPage from "./pages/ExperimentPage";

const Protected = ({ children }) => {
  const { isAuthed } = useAuth();
  return isAuthed ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage onGetStarted={() => {}} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Experiments />
              </Protected>
            }
          />
          <Route
            path="/experiments/:slug"
            element={
              <Protected>
                <ExperimentPage />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
