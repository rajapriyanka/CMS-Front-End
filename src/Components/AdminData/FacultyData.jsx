import React, { useState, useEffect, useRef } from "react"
import AdminNavbar from "../Land/AdminNavbar"
import UserService from "../../Service/UserService"
import "./FacultyData.css"

const FacultyData = () => {
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    mobileNo: "",
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const [faculties, setFaculties] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingFaculty, setEditingFaculty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedDesignation, setSelectedDesignation] = useState("All Designations")
  const [filteredFaculties, setFilteredFaculties] = useState([])

  const departments = [
    "Select Department",
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
  ]

  const designations = ["All Designations", "Professor", "Assistant Professor", "Associate Professor"]

  useEffect(() => {
    fetchFaculties()
  }, [])

  const fetchFaculties = async () => {
    setIsLoading(true)
    try {
      const response = await UserService.getAllFaculty()
      setFaculties(response || [])
      setFilteredFaculties(response || [])
    } catch (error) {
      setMessage("Error fetching faculties: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterClick = () => {
    setShowForm(true)
    setActiveTab("register")
    setEditingFaculty(null)
    setFormData({
      name: "",
      email: "",
      department: "",
      designation: "",
      mobileNo: "",
    })
  }

  const handleCancelClick = () => {
    setShowForm(false)
    setEditingFaculty(null)
    setFormData({
      name: "",
      email: "",
      department: "",
      designation: "",
      mobileNo: "",
    })
    setErrors({})
    setMessage("")
    setActiveTab(null)
  }

  const validateForm = () => {
    let valid = true
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required."
      valid = false
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required."
      valid = false
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Enter a valid email address."
      valid = false
    }
    if (!formData.department || formData.department === "Select Department") {
      newErrors.department = "Please select a valid department."
      valid = false
    }
    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required."
      valid = false
    }
    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required."
      valid = false
    } else if (!/^\d{10}$/.test(formData.mobileNo)) {
      newErrors.mobileNo = "Mobile number must be exactly 10 digits."
      valid = false
    }

    setErrors(newErrors)
    console.log("Form validation result:", valid, newErrors)
    return valid
  }

  const handleListClick = () => {
    setActiveTab("list")
    setSelectedDepartment("")
    setSelectedDesignation("All Designations")
    setFilteredFaculties(faculties)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        let response
        if (editingFaculty) {
          console.log("Updating faculty:", editingFaculty.id, formData)
          response = await UserService.updateFaculty(editingFaculty.id, formData)
          console.log("Update response:", response)
          setMessage("Faculty updated successfully")
        } else {
          console.log("Registering new faculty:", formData)
          response = await UserService.registerFaculty(formData)
          console.log("Registration response:", response)
          setMessage("Faculty registered successfully")
        }
        setShowForm(false)
        setFormData({
          name: "",
          email: "",
          department: "",
          designation: "",
          mobileNo: "",
        })
        setErrors({})
        await fetchFaculties()
        setActiveTab("list")
        setEditingFaculty(null)
      } catch (error) {
        console.error("Error in handleRegister:", error)
        setMessage(error.message || "An error occurred during registration/update")
      }
    } else {
      console.log("Form validation failed")
      setMessage("Please correct the errors in the form")
    }
  }

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty)
    setFormData({
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
      designation: faculty.designation,
      mobileNo: faculty.mobileNo,
    })
    setShowForm(true)
    setActiveTab("register")
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this faculty?")) {
      try {
        await UserService.deleteFaculty(id)
        setMessage("Faculty deleted successfully")
        fetchFaculties()
      } catch (error) {
        setMessage("Error deleting faculty: " + error.message)
      }
    }
  }

  const handleSearch = async (e) => {
    const searchTerm = e.target.value
    setSearchTerm(searchTerm)

    if (searchTerm.trim() === "") {
      fetchFaculties()
    } else {
      try {
        const searchResults = await UserService.searchFacultyByName(searchTerm)
        setFaculties(searchResults)
      } catch (error) {
        console.error("Error searching faculties:", error)
        setMessage("Error searching faculties: " + error.message)
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
    try {
      await UserService.uploadFacultyExcel(file)
      setMessage("Faculty members uploaded successfully")
      fetchFaculties()
    } catch (error) {
      console.error("Error uploading Excel file:", error)
      setMessage(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFilter = () => {
    const filtered = faculties.filter((faculty) => {
      const departmentMatch = !selectedDepartment || faculty.department === selectedDepartment
      const designationMatch = selectedDesignation === "All Designations" || faculty.designation === selectedDesignation
      return departmentMatch && designationMatch
    })
    setFilteredFaculties(filtered)
  }

  return (
    <div className="fac-data-page">
      <AdminNavbar />
      <div className="fac-data-container">
        <div className="fac-sidebar">
          <h2>Admin Panel</h2>
          <button className="register-button" onClick={handleRegisterClick}>
            Register New Faculty
          </button>
          <div className="list-faculty-container">
            <button className="list-button" onClick={handleListClick}>
              List of Faculty
            </button>
           
              
          </div>
        </div>

        <div className="fac-main-content">
          {activeTab === "register" && (
            <div className="fac-register-form">
              <h2>{editingFaculty ? "Edit Faculty" : "Register New Faculty"}</h2>
              <form onSubmit={handleRegister} className="fac-form-group">
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" />
                {errors.name && <span className="error-message">{errors.name}</span>}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
                <select name="department" value={formData.department} onChange={handleInputChange}>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && <span className="error-message">{errors.department}</span>}
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Designation"
                />
                {errors.designation && <span className="error-message">{errors.designation}</span>}
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  placeholder="Mobile No"
                />
                {errors.mobileNo && <span className="error-message">{errors.mobileNo}</span>}
                <div className="form-buttons">
                  <button type="submit" className="register-submit-button">
                    {editingFaculty ? "Update" : "Register"}
                  </button>
                  <button type="button" onClick={handleCancelClick} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </form>
              {message && <div className="message">{message}</div>}
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
            <div className="faculty-list">
              <h2>Faculty List</h2>
              <div className="fac-filter-controls">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="department-select"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                  className="designation-select"
                >
                  {designations.map((designation, index) => (
                    <option key={index} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
                <button onClick={handleFilter} className="filter-button">
                  Filter
                </button>
              </div>
              {isLoading ? (
                <p>Loading faculty data...</p>
              ) : filteredFaculties.length === 0 ? (
                <p>No faculty data available.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Mobile No</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaculties.map((faculty) => (
                      <tr key={faculty.id}>
                        <td>{faculty.name}</td>
                        <td>{faculty.email}</td>
                        <td>{faculty.department}</td>
                        <td>{faculty.designation}</td>
                        <td>{faculty.mobileNo}</td>
                        <td>
                          <button onClick={() => handleEdit(faculty)} className="fac-edit-button">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(faculty.id)} className="fac-delete-button">
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

export default FacultyData

