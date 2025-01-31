import React, { useState, useEffect } from "react"
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
  // const [errors, setErrors] = useState({})
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCourse, setEditingCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")

  const courseTypes = ["ACADEMIC", "NON_ACADEMIC"]
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]
  const departments = [
    "Select Department",
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Aeronautical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
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
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log("Submitting form data:", formData)
      if (editingCourse) {
        await UserService.updateCourse(editingCourse.id, formData)
      } else {
        await UserService.registerCourse(formData)
      }
      setShowForm(false)
      fetchCourses()
    } catch (error) {
      console.error("Error saving course:", error)
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
      const departmentMatch = !selectedDepartment || course.department === selectedDepartment
      return semesterMatch && departmentMatch
    })
    setFilteredCourses(filtered)
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
                    required
                  />
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
                    required
                  />
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
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="semesterNo">Semester Number</label>
                  <input
                    type="number"
                    id="semesterNo"
                    name="semesterNo"
                    value={formData.semesterNo}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Course Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-input"
                    required
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
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
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

export default CourseData

