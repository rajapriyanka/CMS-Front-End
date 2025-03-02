import React, { useEffect, useState } from 'react';
import FacultyService from '../../Service/FacultyService';
import './FacultyCourse.css';

const FacultyCourse = () => {
  const [showForm, setShowForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  useEffect(() => {
    if (showForm) {
      fetchCoursesAndBatches();
    }
  }, [showForm]);

  const fetchCoursesAndBatches = async () => {
    try {
      const courses = await FacultyService.getAllCourses();
      const batches = await FacultyService.getAllBatches();
      setCourses(courses);
      setBatches(batches);
    } catch (error) {
      console.error("Error fetching courses and batches:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedCourseId || !selectedBatchId) {
        alert("Please select both a course and batch.");
        return;
      }

      const facultyId = localStorage.getItem("facultyId");
      if (!facultyId) {
        alert("Faculty ID not found. Please log in again.");
        return;
      }

      await FacultyService.addCourseToBatch(facultyId, selectedCourseId, selectedBatchId);
      alert("Course assigned to batch successfully!");
      resetForm();
    } catch (error) {
      console.error("Error submitting course data:", error);
      alert(error.message || "An unexpected error occurred. Please try again later.");
    }
  };

  const resetForm = () => {
    setSelectedCourseId("");
    setSelectedBatchId("");
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>Faculty Dashboard</h2>
      </div>

      <div className="main-content">
        <div className="card">
          <button onClick={() => setShowForm(!showForm)} className="button">
            Add Course
          </button>

          {showForm && (
            <div className="form-section">
              {/* Course Selection */}
              <label>Select Course:</label>
              <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="dropdown">
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title} ({course.code})</option>
                ))}
              </select>

            
            {/* Batch Selection */}
            <label>Select Batch:</label>
            <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)} className="dropdown">
            <option value="">-- Select Batch --</option>
            {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
            {batch.batchName} - {batch.department} ({batch.section})
              </option>
                 ))}
              </select>

              <button onClick={handleSubmit} className="submit-button">
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyCourse;
