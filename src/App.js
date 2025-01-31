import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Mainsection from "./Components/Land/Mainsection";
import AdminLogin from "./Components/Login/AdminLogin";
import AdminDashboard from "./Components/AdminData/AdminDashboard"; 
import FacultyData from "./Components/AdminData/FacultyData";
import StudentData from './Components/AdminData/StudentData';
import CourseData from './Components/AdminData/CourseData';
import BatchData from './Components/AdminData/BatchData';
import UserService from "./Service/UserService"; // Import UserService to handle role and authentication

const App = () => {
  const isAuthenticated = UserService.isAuthenticated();
  const isAdmin = UserService.isAdmin();

  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Mainsection />} />

        {/* Admin login route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin dashboard route - Protected */}
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && isAdmin ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route path="/faculty-data" element={<FacultyData />} />
        <Route path="/student-data" element={<StudentData />} />
        <Route path="/course-data" element={<CourseData />} />
        <Route path="/batch-data" element={<BatchData />} />
      </Routes>
    </Router>
  );
};

export default App;
