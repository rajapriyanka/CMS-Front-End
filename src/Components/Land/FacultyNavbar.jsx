import React from "react";
import "./FacultyNavbar.css";
// import { Navigate } from "react-router-dom";

const FacultyNavbar = () => {
  return (
    <nav className="fac-navbar">
      <div className="fac-logo">DAYOFF DASHBOARD</div>
      <ul className="fac-nav-links">
        <li><a href="/fac-course-data">Courses</a></li>
        <li><a href="/fac-leave-data">Leave</a></li>
        <li><a href="/fac-time-data">Time Table</a></li>
        
      </ul>
      <button className="btn-get-started"><a href="/">Logout</a></button>
    </nav>
  );
};

export default FacultyNavbar;