import React from "react";
import "./StudentNavbar.css";
// import { Navigate } from "react-router-dom";

const StudentNavbar = () => {
  return (
    <nav className="student-navbar">
      <div className="student-logo">DAYOFF DASHBOARD</div>
      <ul className="student-nav-links">
        <li><a href="/stud-attendance-data">Attendance</a></li>        
        <li><a href="/stud-time-data">Time Table</a></li>
        <li><a href="/stud-leave-data">Leave</a></li>
    
      </ul>
      <div class="stud-nav-right">
        <li><a href="/">Logout</a></li>
        <li><a href="/stud-profile">Profile</a></li>
    </div>
    </nav>
  );
};

export default StudentNavbar;