import React from "react";
import "./AdminNavbar.css";
// import { Navigate } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">DAYOFF DASHBOARD</div>
      <ul className="nav-links">
        <li><a href="/faculty-data">Faculty</a></li>
        <li><a href="/student-data">Student</a></li>
        <li><a href="/batch-data">Batch</a></li>
        <li><a href="/course-data">Course</a></li>
        <li><a href="/timetable-data">Timetable</a></li>
        
      </ul>
      <button className="btn-get-started"><a href="/">Logout</a></button>
    </nav>
  );
};

export default Navbar;