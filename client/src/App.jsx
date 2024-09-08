import { Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { AuthProvider } from "./contextes/auth-context";
import Titlebar from "./components/titlebar";
import FileTable from "./pages/file-table";
import LoginPage from "./pages/login-user";
import RegisterPage from "./pages/register-user";

function App() {
  return (
    <AuthProvider>
      <Titlebar />
      <div>
        <Routes>
          <Route path="/" element={<FileTable />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
