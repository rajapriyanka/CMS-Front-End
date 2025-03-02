import axios from "axios"

class FacultyService {
  static BASE_URL = "http://localhost:8080"

  // Utility to get the token
  static getToken() {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No token found. Please log in.")
    }
    return token
  }

  static async login(email, password) {
    try {
      const response = await axios.post(`${this.BASE_URL}/api/faculty/login`, { email, password })

      if (response?.data?.jwt) {
        // Save essential data
        localStorage.setItem("token", response.data.jwt)
        localStorage.setItem("role", response.data.role)
        localStorage.setItem("facultyId", response.data.id || "")

        return response.data
      } else {
        throw new Error("Invalid response from server.")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed. Please try again."
      throw new Error(errorMessage)
    }
  }

  // Logout function
  static logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("facultyId")
    window.location.href = "/"
  }

  // Check if the user is authenticated
  static isFacultyAuthenticated() {
    return Boolean(localStorage.getItem("token"))
  }

  // Check if the user has a Faculty role
  static isFaculty() {
    const userRole = localStorage.getItem("role")
    return userRole?.toUpperCase() === "FACULTY"
  }

  // Fetch all faculties (for admin use)
  static async getAllFaculties() {
    try {
      const token = this.getToken()
      const response = await axios.get(`${this.BASE_URL}/api/admin/faculties`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch faculties. Please try again later.")
    }
  }

  // Fetch all courses
  static async getAllCourses() {
    try {
      const token = this.getToken()
      const response = await axios.get(`${this.BASE_URL}/api/faculties/dashboard/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch courses. Please try again later.")
    }
  }

  // Fetch all batches
  static async getAllBatches() {
    try {
      const token = this.getToken()
      const response = await axios.get(`${this.BASE_URL}/api/faculties/dashboard/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch batches. Please try again later.")
    }
  }

  // Assign a course to a batch for a faculty member
  static async addCourseToBatch(facultyId, courseId, batchId) {
    try {
      const token = this.getToken()

      const response = await axios.post(
        `${this.BASE_URL}/api/faculties/dashboard/faculty/${facultyId}/courses/${courseId}/batches/${batchId}`,
        {}, // Send empty body if no additional data is needed
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      console.log("Course assigned successfully:", response.data)
      return response.data
    } catch (error) {
      console.error("Error assigning course:", error.response?.data?.message || error.message)
      throw new Error(error.response?.data?.message || "Failed to assign course. Please try again.")
    }
  }
}

export default FacultyService;

