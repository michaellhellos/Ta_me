import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";

type Page = "login" | "register" | "dashboard";

function App() {
  const [page, setPage] = useState<Page>("login");

  return (
    <>
      {page === "login" && (
        <Login
          goToRegister={() => setPage("register")}
          goToDashboard={() => setPage("dashboard")}
        />
      )}

      {page === "register" && (
        <Register goToLogin={() => setPage("login")} />
      )}

      {page === "dashboard" && (
        <Dashboard logout={() => setPage("login")} />
      )}
    </>
  );
}

export default App;
