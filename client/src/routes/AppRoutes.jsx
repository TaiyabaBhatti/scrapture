import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Create from "../pages/Create";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Every route inside this element gets the header */}
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <Create />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
