import React from "react";
import "./AdminNavbar.css";
// import { Navigate } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="admin-navbar">
      <div className="admin-logo">DAYOFF DASHBOARD</div>
      <ul className="admin-nav-links">
        <li><a href="/faculty-data">Faculty</a></li>
        <li><a href="/student-data">Student</a></li>
        <li><a href="/batch-data">Batch</a></li>
        <li><a href="/course-data">Course</a></li>
        <li><a href="/timetable-data">Timetable</a></li>
        
      </ul>
      <div class="admin-nav-right">
        <li><a href="/">Logout</a></li>
        <li><a href="/admin-profile">Profile</a></li>
    </div>
    </nav>
  );
};

export default Navbar;