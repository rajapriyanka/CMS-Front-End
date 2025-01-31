import React, { useState, useEffect, useRef } from "react"
import UserService from "../../Service/UserService"
import AdminNavbar from "../Land/AdminNavbar"
import "./StudentData.css"

const StudentData = () => {
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    user: { email: "", password: "" },
    dno: "",
    department: "",
    batchName: "",
    mobileNumber: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [batchInput, setBatchInput] = useState("")
  const [filteredStudents, setFilteredStudents] = useState([])

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await UserService.getAllStudents()
      setStudents(data)
      setFilteredStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
      setError("Failed to fetch students. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === "email" || name === "password") {
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, [name]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const studentData = {
        ...formData,
        email: formData.user.email,
        password: formData.user.password,
      }
      if (isEditing) {
        await UserService.updateStudent(editingId, studentData)
        alert("Student updated successfully")
      } else {
        await UserService.registerStudent(studentData)
        alert("Student registered successfully")
      }
      fetchStudents()
      resetForm()
    } catch (error) {
      console.error("Error submitting form:", error)
      setError(error.response?.data?.message || "An error occurred. Please try again.")
    }
  }

  const handleEdit = (student) => {
    console.log(student); // Check the student object
    setIsEditing(true)
    setEditingId(student.id)
    setFormData({
      name: student.name,
      user: {
        email: student.email || "",
        password: "",
      },
      dno: student.dno || "",
      department: student.department || "",  // Log if department is correct here
      batchName: student.batchName || "",
      mobileNumber: student.mobileNumber || "",
    })
    console.log(formData.department); // Check if department value is set properly
    setActiveTab("register")
  }
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await UserService.deleteStudent(id)
        alert("Student deleted successfully")
        fetchStudents()
      } catch (error) {
        console.error("Error deleting student:", error)
        setError("Failed to delete student. Please try again.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      user: { email: "", password: "" },
      dno: "",
      department: "",
      batchName: "",
      mobileNumber: "",
    })
    setIsEditing(false)
    setEditingId(null)
    setError("")
  }

  const handleSearch = async (e) => {
    const searchTerm = e.target.value
    setSearchTerm(searchTerm)
    if (searchTerm.trim() === "") {
      fetchStudents()
    } else {
      try {
        const results = await UserService.searchStudentsByName(searchTerm)
        setStudents(results)
      } catch (error) {
        console.error("Error searching students:", error)
        setError("Error searching students. Please try again.")
      }
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleExcelUpload(file)
    }
  }

  const handleExcelUpload = async (file) => {
    setIsUploading(true)
    setError("")
    try {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        throw new Error("Please upload a valid Excel file (.xlsx or .xls)")
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await UserService.uploadStudentExcel(formData)
      alert(response.message || "Students uploaded successfully")
      fetchStudents()
    } catch (error) {
      console.error("Error uploading Excel file:", error)
      setError(
        error.response?.data?.message ||
          error.message ||
          "Error uploading students. Please check your file and try again.",
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleFilter = () => {
    const filtered = students.filter((student) => {
      // Check if the selected department matches or if no department is selected
      const departmentMatch = !selectedDepartment || student.department === selectedDepartment;
  
      // Check if the batch input matches or if no batch input is provided
      const batchMatch = !batchInput || student.batchName === batchInput;
  
      // Both conditions need to be true to include the student
      return departmentMatch && batchMatch;
    });
  
    // Update the filtered students state
    setFilteredStudents(filtered);
  }
  

  const handleRegisterClick = () => {
    setActiveTab("register")
    resetForm()
  }

  const handleListClick = () => {
    setActiveTab("list")
    setSelectedDepartment("")
    setBatchInput("")
    setFilteredStudents(students)
  }

  return (
    <div className="student-data-page">
      <AdminNavbar />
      <div className="student-data-container">
        <div className="student-sidebar">
          <h2>Admin Panel</h2>
          <button className="register-button" onClick={handleRegisterClick}>
            Register New Student
          </button>
          <button className="list-button" onClick={handleListClick}>
            List of Students
          </button>
        </div>

        <div className="student-main-content">
          {error && <div className="error-message">{error}</div>}
          {activeTab === "register" && (
            <div className="stud-register-form">
              <h2>{isEditing ? "Edit Student" : "Register New Student"}</h2>
              <form onSubmit={handleSubmit} className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={formData.user.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={formData.user.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Mobile Number"
                  required
                />
                <input
                  type="text"
                  name="dno"
                  value={formData.dno}
                  onChange={handleInputChange}
                  placeholder="D.No"
                  required
                />
                <select name="department" value={formData.department} onChange={handleInputChange} required>
                  <option value="">Select Department</option>
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                  <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                  <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
                <input
                  type="text"
                  name="batchName"
                  value={formData.batchName}
                  onChange={handleInputChange}
                  placeholder="Batch Name"
                  required
                />
                <div className="form-buttons">
                  <button type="submit" className="register-submit-button">
                    {isEditing ? "Update" : "Register"}
                  </button>
                  <button type="button" onClick={resetForm} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </form>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="upload-button">
                {isUploading ? "Uploading..." : "Upload Excel"}
              </button>
            </div>
          )}
          {activeTab === "list" && (
            <div className="student-list">
              <h2>Student List</h2>
              <div className="filter-controls">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="department-select"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                  <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                  <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
                <input
                  type="text"
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder="Filter by Batch Name"
                  className="batch-input"
                />
                <button onClick={handleFilter} className="filter-button">
                  Filter
                </button>
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile Number</th>
                    <th>D.No</th>
                    <th>Department</th>
                    <th>Batch Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.user?.email || "N/A"}</td>
                      <td>{student.mobileNumber || "N/A"}</td>
                      <td>{student.dno || "N/A"}</td>
                      <td>{student.department || "N/A"}</td>
                      <td>{student.batchName || "N/A"}</td>
                      <td>
                        <button onClick={() => handleEdit(student)} className="stud-edit-button">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="stud-delete-button">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentData

