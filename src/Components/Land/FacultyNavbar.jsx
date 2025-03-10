import React from "react";
import "./FacultyNavbar.css";
// import { Navigate } from "react-router-dom";

const FacultyNavbar = () => {
  return (
    <nav className="fac-navbar">
      <div className="fac-logo">DAYOFF DASHBOARD</div>
      <ul className="fac-nav-links">
        <li><a href="/fac-course-data">Courses</a></li>        
        <li><a href="/fac-time-data">Time Table</a></li>
        <li><a href="/fac-leave-data">Leave</a></li>
        <li><a href="/fac-student-leave">Student Leave</a></li>
        <li><a href="/fac-attendance-data">Attendance</a></li>
        
      </ul>
      <div class="fac-nav-right">
        <li><a href="/">Logout</a></li>
        <li><a href="/fac-profile">Profile</a></li>
    </div>
    </nav>
  );
};

export default FacultyNavbar;