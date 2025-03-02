"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import FacultyNavbar from "../Land/FacultyNavbar"
import { useFaculty } from "../../Context/FacultyContext"
import "./FacultyDashboard.css"

const FacultyDashboard = () => {
  const { facultyData } = useFaculty()
  const [facultyName, setFacultyName] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Set faculty name from context or localStorage fallback
    if (facultyData && facultyData.fullName) {
      setFacultyName(facultyData.fullName)
    } else {
      const storedName = localStorage.getItem("facultyName")
      setFacultyName(storedName || "Faculty Member")
    }
  }, [facultyData])

  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <div className="faculty-dash-page">
      <FacultyNavbar />
      <div className="faculty-dash-container">
        <h1>Welcome, {facultyName}!</h1>
        <p>Select an option below to proceed:</p>

        <div className="faculty-dash-cards">
          <div className="card">
            <h3>View Courses</h3>
            <button className="action-button" onClick={() => handleNavigation("/view-courses")}>
              Go
            </button>
          </div>
          <div className="card">
            <h3>Manage Batches</h3>
            <button className="action-button" onClick={() => handleNavigation("/manage-batches")}>
              Go
            </button>
          </div>
          <div className="card">
            <h3>Assign Courses</h3>
            <button className="action-button" onClick={() => handleNavigation("/assign-courses")}>
              Go
            </button>
          </div>
          <div className="card">
            <h3>Generate Timetable</h3>
            <button className="action-button" onClick={() => handleNavigation("/generate-timetable")}>
              Go
            </button>
          </div>
          <div className="card">
            <h3>View Timetable</h3>
            <button className="action-button" onClick={() => handleNavigation("/view-timetable")}>
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacultyDashboard;

