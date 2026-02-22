import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import Chat from "./pages/Chat";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem("user");

  if (!user) return <Navigate to="/" />;

  const parsedUser = JSON.parse(user);

  return parsedUser.role === "admin"
    ? children
    : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <DashboardAdmin />
            </AdminRoute>
          }
        />

        {/* MENTOR DASHBOARD */}
        <Route
          path="/mentor/dashboard"
          element={
            <PrivateRoute>
              <MentorDashboard />
            </PrivateRoute>
          }
        />

        {/* CHAT ROUTE (PINDAHKAN KE SINI) */}
        <Route
          path="/chat/:conversationId"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;