"use client"

import { useState, useEffect, useRef } from "react"
import AdminNavbar from "../Land/AdminNavbar"
import UserService from "../../Service/UserService"
import "./CourseData.css"

const CourseData = () => {
  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    contactPeriods: "",
    semesterNo: "",
    type: "ACADEMIC",
    department: "",
  })
  const [errors, setErrors] = useState({})
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCourse, setEditingCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [message, setMessage] = useState("")

  const courseTypes = ["ACADEMIC", "NON_ACADEMIC", "LAB"]
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]
  const departments = [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "Aeronautical Engineering",
  ]

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await UserService.getAllCourses()
      if (Array.isArray(response) && response.length > 0) {
        setCourses(response)
        setFilteredCourses(response)
      } else {
        setCourses([])
        setFilteredCourses([])
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      setCourses([])
      setFilteredCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterClick = () => {
    setShowForm(true)
    setShowList(false)
    setEditingCourse(null)
    setFormData({
      title: "",
      code: "",
      contactPeriods: "",
      semesterNo: "",
      type: "ACADEMIC",
      department: "",
    })
    setErrors({})
  }

  const handleListClick = () => {
    setShowForm(false)
    setShowList(true)
    setSelectedSemester("")
    setSelectedDepartment("")
    setFilteredCourses(courses)
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      code: course.code,
      contactPeriods: course.contactPeriods,
      semesterNo: course.semesterNo,
      type: course.type,
      department: course.department,
    })
    setShowForm(true)
    setShowList(false)
    setErrors({})
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await UserService.deleteCourse(id)
        fetchCourses()
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // For title field: prevent numeric and special characters
    if (name === "title") {
      // Only allow letters and spaces
      if (!/^[A-Za-z\s]*$/.test(value)) {
        return // Don't update state if input contains numbers or special characters
      }
    }

    // For code field: prevent special characters but allow alphanumeric
    if (name === "code") {
      // Only allow alphanumeric characters
      if (!/^[A-Za-z0-9]*$/.test(value)) {
        return // Don't update state if input contains special characters
      }
    }

    // Prevent negative values for contactPeriods field
    if (name === "contactPeriods" && value.includes("-")) {
      return // Don't update state if the value contains a negative sign
    }

    setFormData((prevState) => ({ ...prevState, [name]: value }))
    // Clear the error for this field when the user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Title should have at least 5 characters"
    } else if (/[^A-Za-z\s]/.test(formData.title)) {
      newErrors.title = "Title should only contain letters and spaces"
    }

    if (!formData.code.trim()) {
      newErrors.code = "Code is required"
    } else if (formData.code.trim().length < 5) {
      newErrors.code = "Code should have at least 5 characters"
    } else if (/[^A-Za-z0-9]/.test(formData.code)) {
      newErrors.code = "Code should only contain alphanumeric characters"
    }

    if (!formData.contactPeriods.trim()) {
      newErrors.contactPeriods = "Contact Periods is required"
    } else if (Number.parseInt(formData.contactPeriods) < 0) {
      newErrors.contactPeriods = "Contact Periods should not be negative"
    }
    if (!formData.semesterNo.trim()) {
      newErrors.semesterNo = "Semester Number is required"
    } else if (!semesters.includes(formData.semesterNo)) {
      newErrors.semesterNo = "Invalid Semester Number"
    }
    if (!formData.department) {
      newErrors.department = "Department is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        if (editingCourse) {
          await UserService.updateCourse(editingCourse.id, formData)
        } else {
          await UserService.registerCourse(formData)
        }
        setShowForm(false)
        fetchCourses()
        setMessage(editingCourse ? "Course updated successfully" : "Course registered successfully")
      } catch (error) {
        console.error("Error saving course:", error)
        setMessage("Error saving course. Please try again.")
      }
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.trim() === "") {
      setFilteredCourses(courses)
    } else {
      try {
        const results = await UserService.searchCourses(value)
        setFilteredCourses(results)
      } catch (error) {
        console.error("Error searching courses:", error)
      }
    }
  }

  const handleFilter = () => {
    const filtered = courses.filter((course) => {
      const semesterMatch = !selectedSemester || course.semesterNo.toString() === selectedSemester
      const departmentMatch =
        !selectedDepartment || course.department.toLowerCase() === selectedDepartment.toLowerCase()
      return semesterMatch && departmentMatch
    })
    setFilteredCourses(filtered)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleExcelUpload(file)
    }
  }

  const handleExcelUpload = async (file) => {
    setIsUploading(true)
    try {
      await UserService.uploadCourseExcel(file)
      setMessage("Courses uploaded successfully")
      fetchCourses()
    } catch (error) {
      console.error("Error uploading Excel file:", error)
      setMessage(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="course-data-page">
      <AdminNavbar />
      <div className="course-data-container">
        <div className="course-sidebar">
          <h2>Admin Panel</h2>
          <button className="register-button" onClick={handleRegisterClick}>
            Register New Course
          </button>
          <button className="list-button" onClick={handleListClick}>
            List of Courses
          </button>
        </div>

        <div className="course-main-content">
          {message && <div className="message">{message}</div>}
          {showForm && (
            <div className="register-form">
              <h2>{editingCourse ? "Edit Course" : "Register New Course"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  {errors.title && <span className="error-message">{errors.title}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="code">Code</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  {errors.code && <span className="error-message">{errors.code}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="contactPeriods">Contact Periods</label>
                  <input
                    type="number"
                    id="contactPeriods"
                    name="contactPeriods"
                    value={formData.contactPeriods}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                  />
                  {errors.contactPeriods && <span className="error-message">{errors.contactPeriods}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="semesterNo">Semester Number</label>
                  <select
                    id="semesterNo"
                    name="semesterNo"
                    value={formData.semesterNo}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                  {errors.semesterNo && <span className="error-message">{errors.semesterNo}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="type">Course Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {courseTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && <span className="error-message">{errors.department}</span>}
                </div>
                <div className="form-actions">
                  <button type="submit" className="register-submit-button">
                    {editingCourse ? "Update" : "Register"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {showList && (
            <div className="course-list">
              <div className="filter-controls">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="semester-select"
                >
                  <option value="">All Semesters</option>
                  {semesters.map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="department-select"
                >
                  <option value="">All Departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <button onClick={handleFilter} className="filter-button">
                  Filter
                </button>
              </div>
              <div className="course-search-bar">
                <input
                  type="text"
                  placeholder="Search course by title or code"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="course-search-input"
                />
              </div>
              {isLoading ? (
                <p>Loading course data...</p>
              ) : filteredCourses.length === 0 ? (
                <p>No course data available.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Code</th>
                      <th>Contact Periods</th>
                      <th>Semester No</th>
                      <th>Type</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id}>
                        <td>{course.title}</td>
                        <td>{course.code}</td>
                        <td>{course.contactPeriods}</td>
                        <td>{course.semesterNo}</td>
                        <td>{course.type}</td>
                        <td>{course.department || "N/A"}</td>
                        <td>
                          <button className="edit-button" onClick={() => handleEdit(course)}>
                            Edit
                          </button>
                          <button className="delete-button" onClick={() => handleDelete(course.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseData;

