import React, { useState, useEffect } from "react";
import { useStudent } from "./../../Context/StudentContext";

import AttendanceService from "./../../Service/AttendanceService"
import "./StudentAttendanceData.css";

const StudentAttendanceData = () => {
  const { studentInfo } = useStudent();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semester, setSemester] = useState("all");
  const [semesters, setSemesters] = useState([]);
  const [courseStats, setCourseStats] = useState({
    total: 0,
    good: 0,
    low: 0,
    average: 0,
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!studentInfo.studentId) {
        setError("Student ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await AttendanceService.getStudentAttendancePercentage(
          studentInfo.studentId,
          semester !== "all" ? semester : null
        );

        setAttendanceData(response);

        // Extract unique semesters
        const uniqueSemesters = [
          ...new Set(response.map((item) => item.semesterNo)),
        ].sort((a, b) => a - b);
        setSemesters(uniqueSemesters);

        // Calculate statistics
        const goodCourses = response.filter(
          (item) => item.attendancePercentage >= 75
        ).length;
        const lowCourses = response.filter(
          (item) => item.attendancePercentage < 75
        ).length;
        const avgAttendance =
          response.length > 0
            ? response.reduce(
                (sum, item) => sum + item.attendancePercentage,
                0
              ) / response.length
            : 0;

        setCourseStats({
          total: response.length,
          good: goodCourses,
          low: lowCourses,
          average: avgAttendance,
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching attendance data:", err);
        setError(
          err.message || "Failed to load attendance data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [studentInfo.studentId, semester]);

  const handleSemesterChange = (e) => {
    setSemester(e.target.value);
  };

  const getStatusClass = (percentage) => {
    if (percentage >= 75) return "status-good";
    if (percentage >= 65) return "status-warning";
    return "status-danger";
  };

  const getStatusText = (percentage) => {
    if (percentage >= 75) return "Good";
    if (percentage >= 65) return "Warning";
    return "Low";
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h2>Attendance Dashboard</h2>
        <div className="semester-filter">
          <label htmlFor="semester-select">Semester:</label>
          <select
            id="semester-select"
            value={semester}
            onChange={handleSemesterChange}
          >
            <option value="all">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading attendance data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="error-icon">⚠️</i>
          <p>{error}</p>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="no-data-message">
          <i className="info-icon">ℹ️</i>
          <p>No attendance records found for the selected semester.</p>
        </div>
      ) : (
        <>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon good-icon">✓</div>
              <div className="stat-content">
                <h3>Good Standing</h3>
                <p className="stat-value">{courseStats.good} Courses</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon low-icon">!</div>
              <div className="stat-content">
                <h3>Low Attendance</h3>
                <p className="stat-value">{courseStats.low} Courses</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon avg-icon">%</div>
              <div className="stat-content">
                <h3>Average Attendance</h3>
                <p className="stat-value">{courseStats.average.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Faculty</th>
                  <th>Semester</th>
                  <th>Attendance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((item, index) => (
                  <tr key={index} className={item.isBelowThreshold ? "low-attendance-row" : ""}>
                    <td>{item.courseCode}</td>
                    <td>{item.courseTitle}</td>
                    <td>{item.facultyName}</td>
                    <td>{item.semesterNo}</td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${getStatusClass(
                              item.attendancePercentage
                            )}`}
                            style={{
                              width: `${Math.min(
                                100,
                                item.attendancePercentage
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {item.attendancePercentage.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          item.attendancePercentage
                        )}`}
                      >
                        {getStatusText(item.attendancePercentage)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="attendance-info">
            <div className="info-item">
              <div className="info-icon">ℹ️</div>
              <p>
                Attendance below 75% may result in academic penalties. Please
                improve your attendance in courses marked as "Low".
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAttendanceData;