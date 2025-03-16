"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useFaculty } from "../../Context/FacultyContext"
import SubstituteService from "../../Service/SubstituteService"
import TimetableService from "../../Service/TimetableService"
import FacultyService from "../../Service/FacultyService"

import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { format } from "date-fns"

const FacultySubstitute = () => {
  const { facultyData } = useFaculty()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [timetableEntries, setTimetableEntries] = useState([])
  const [batches, setBatches] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [reason, setReason] = useState("")
  const [availableFaculty, setAvailableFaculty] = useState([])
  const [selectedSubstitute, setSelectedSubstitute] = useState("")
  const [filterByAvailability, setFilterByAvailability] = useState(true)
  const [filterByBatch, setFilterByBatch] = useState(false)
  const [activeTab, setActiveTab] = useState("request")
  const [sentRequests, setSentRequests] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [debug, setDebug] = useState({
    facultyData: null,
    timetableLoaded: false,
    batchesLoaded: false,
    error: null,
  })

  // Debug effect to log state changes
  useEffect(() => {
    console.log("Faculty Data:", facultyData)
    console.log("Timetable Entries:", timetableEntries)
    console.log("Batches:", batches)
    setDebug((prev) => ({
      ...prev,
      facultyData: facultyData,
    }))
  }, [facultyData, timetableEntries, batches])

  useEffect(() => {
    console.log("Component mounted")

    if (!facultyData) {
      console.log("No faculty data, redirecting to login")
      navigate("/faculty/login")
      return
    }

    console.log("Faculty data available:", facultyData)

    // Only fetch data if facultyData exists and has an id
    if (facultyData && facultyData.facultyId) {
      console.log("Fetching initial data with faculty ID:", facultyData.facultyId)
      fetchInitialData()
    } else {
      console.error("Faculty data exists but ID is missing:", facultyData)
      setDebug((prev) => ({
        ...prev,
        error: "Faculty ID is missing",
      }))
    }
  }, [facultyData, navigate])

  useEffect(() => {
    // Only proceed if facultyData and facultyData.id exist
    if (!facultyData || !facultyData.facultyId) {
      console.log("Skipping tab-related data fetch due to missing faculty data")
      return
    }

    console.log("Tab changed to:", activeTab)

    if (activeTab === "sent") {
      console.log("Fetching sent requests for faculty ID:", facultyData.facultyId)
      fetchSentRequests()
    } else if (activeTab === "received") {
      console.log("Fetching received requests for faculty ID:", facultyData.facultyId)
      fetchReceivedRequests()
    }
  }, [activeTab, facultyData])

  const fetchInitialData = async () => {
    console.log("Starting fetchInitialData")
    setLoading(true)

    try {
      // Check if facultyData and facultyData.id exist before making API calls
      if (!facultyData || !facultyData.facultyId) {
        console.error("Faculty data is not available for fetchInitialData")
        toast.error("Faculty data is not available. Please log in again.")
        navigate("/faculty/login")
        return
      }

      console.log("Fetching timetable for faculty ID:", facultyData.facultyId)
      console.log("Fetching all batches")

      // Fetch timetable and batches separately to better identify which call might be failing
      try {
        const timetableData = await TimetableService.getFacultyTimetable(facultyData.facultyId)
        console.log("Timetable data received:", timetableData)
        setTimetableEntries(timetableData)
        setDebug((prev) => ({
          ...prev,
          timetableLoaded: true,
        }))
      } catch (timetableError) {
        console.error("Error fetching timetable:", timetableError)
        toast.error("Failed to load timetable: " + timetableError.message)
      }

      try {
        const batchesData = await FacultyService.getAllBatches()
        console.log("Batches data received:", batchesData)
        setBatches(batchesData)
        setDebug((prev) => ({
          ...prev,
          batchesLoaded: true,
        }))
      } catch (batchesError) {
        console.error("Error fetching batches:", batchesError)
        toast.error("Failed to load batches: " + batchesError.message)
      }
    } catch (error) {
      console.error("General error in fetchInitialData:", error)
      toast.error("Failed to load initial data: " + error.message)
      setDebug((prev) => ({
        ...prev,
        error: error.message,
      }))
    } finally {
      setLoading(false)
      console.log("Completed fetchInitialData")
    }
  }

  const fetchSentRequests = async () => {
    console.log("Starting fetchSentRequests")
    setLoading(true)
    try {
      // Check if facultyData and facultyData.id exist before making API calls
      if (!facultyData || !facultyData.facultyId) {
        console.error("Faculty data is not available for fetchSentRequests")
        toast.error("Faculty data is not available. Please log in again.")
        navigate("/faculty/login")
        return
      }

      console.log("Fetching sent requests for faculty ID:", facultyData.facultyId)
      const requests = await SubstituteService.getRequestsByRequester(facultyData.facultyId)
      console.log("Sent requests received:", requests)
      setSentRequests(requests)
    } catch (error) {
      console.error("Error in fetchSentRequests:", error)
      toast.error("Failed to load sent requests: " + error.message)
    } finally {
      setLoading(false)
      console.log("Completed fetchSentRequests")
    }
  }

  const fetchReceivedRequests = async () => {
    console.log("Starting fetchReceivedRequests")
    setLoading(true)
    try {
      // Check if facultyData and facultyData.id exist before making API calls
      if (!facultyData || !facultyData.facultyId) {
        console.error("Faculty data is not available for fetchReceivedRequests")
        toast.error("Faculty data is not available. Please log in again.")
        navigate("/faculty/login")
        return
      }

      console.log("Fetching received requests for faculty ID:", facultyData.facultyId)
      const requests = await SubstituteService.getRequestsBySubstitute(facultyData.facultyId)
      console.log("Received requests received:", requests)
      setReceivedRequests(requests)
    } catch (error) {
      console.error("Error in fetchReceivedRequests:", error)
      toast.error("Failed to load received requests: " + error.message)
    } finally {
      setLoading(false)
      console.log("Completed fetchReceivedRequests")
    }
  }

  const handleEntrySelect = (entry) => {
    console.log("Selected entry:", entry)
    setSelectedEntry(entry)
    setSelectedSubstitute("")
    setAvailableFaculty([])
  }

  const handleDateChange = (e) => {
    console.log("Selected date:", e.target.value)
    setSelectedDate(e.target.value)
    setSelectedSubstitute("")
    setAvailableFaculty([])
  }

  const handleFilterFaculty = async () => {
    if (!selectedEntry || !selectedDate) {
      toast.warning("Please select a timetable entry and date")
      return
    }

    console.log("Starting handleFilterFaculty")
    console.log("Selected entry:", selectedEntry)
    console.log("Selected date:", selectedDate)

    setLoading(true)
    try {
      // Check if facultyData and facultyData.id exist before making API calls
      if (!facultyData || !facultyData.facultyId) {
        console.error("Faculty data is not available for handleFilterFaculty")
        toast.error("Faculty data is not available. Please log in again.")
        navigate("/faculty/login")
        return
      }

      const filterData = {
        requestingFacultyId: facultyData.facultyId,
        requestDate: selectedDate,
        periodNumber: selectedEntry.periodNumber,
        day: selectedEntry.day, // Add the day parameter
        batchId: selectedEntry.batchId || null,
        filterByAvailability,
        filterByBatch,
      }

      console.log("Filter data:", filterData)
      const faculty = await SubstituteService.filterFaculty(filterData)
      console.log("Available faculty received:", faculty)
      setAvailableFaculty(faculty)

      if (faculty.length === 0) {
        toast.info("No faculty members match your filter criteria")
      }
    } catch (error) {
      console.error("Error in handleFilterFaculty:", error)
      toast.error("Failed to filter faculty: " + error.message)
    } finally {
      setLoading(false)
      console.log("Completed handleFilterFaculty")
    }
  }

  const handleSubmitRequest = async () => {
    if (!selectedEntry || !selectedDate || !selectedSubstitute || !reason) {
      toast.warning("Please fill all required fields")
      return
    }

    console.log("Starting handleSubmitRequest")
    console.log("Selected entry:", selectedEntry)
    console.log("Selected date:", selectedDate)
    console.log("Selected substitute:", selectedSubstitute)
    console.log("Reason:", reason)
    console.log("Faculty data being used:", facultyData)

    setLoading(true)
    try {
      // Check if facultyData and facultyData.id exist before making API calls
      if (!facultyData || !facultyData.facultyId) {
        console.error("Faculty data is not available for handleSubmitRequest")
        toast.error("Faculty data is not available. Please log in again.")
        navigate("/faculty/login")
        return
      }

      console.log("Selected entry details:", {
        id: selectedEntry.id,
        day: selectedEntry.day,
        periodNumber: selectedEntry.periodNumber,
        batchId: selectedEntry.batchId,
      })

      // Create a more detailed request object with all necessary information
      const requestData = {
        requesterId: Number(facultyData.facultyId),
        substituteId: Number(selectedSubstitute),
        timetableEntryId: Number(selectedEntry.id),
        requestDate: selectedDate,
        day: selectedEntry.day, // Add the day parameter
        reason,
      }

      console.log("Request data being sent:", requestData)

      try {
        const response = await SubstituteService.createSubstituteRequest(requestData)
        console.log("Response from create request:", response)
        toast.success("Substitute request sent successfully")

        // Reset form
        setSelectedEntry(null)
        setSelectedDate("")
        setReason("")
        setSelectedSubstitute("")
        setAvailableFaculty([])

        // Switch to sent requests tab
        setActiveTab("sent")
        fetchSentRequests()
      } catch (error) {
        // Handle the specific error about secret key
        if (error.message && error.message.includes("secret key byte array cannot be null or empty")) {
          toast.error(
            "Email service is currently unavailable. Your request has been recorded but email notifications could not be sent.",
          )

          // Still reset the form and switch tabs as the request might have been created
          setSelectedEntry(null)
          setSelectedDate("")
          setReason("")
          setSelectedSubstitute("")
          setAvailableFaculty([])
          setActiveTab("sent")
          fetchSentRequests()
        } else {
          throw error // Re-throw other errors to be caught by the outer catch block
        }
      }
    } catch (error) {
      console.error("Error in handleSubmitRequest:", error)
      console.error("Error details:", error.message, error.stack)
      toast.error("Failed to send request: " + error.message)
    } finally {
      setLoading(false)
      console.log("Completed handleSubmitRequest")
    }
  }

  const handleUpdateRequestStatus = async (requestId, status, responseMessage = "") => {
    console.log("Starting handleUpdateRequestStatus")
    console.log("Request ID:", requestId)
    console.log("Status:", status)
    console.log("Response message:", responseMessage)

    setLoading(true)
    try {
      try {
        await SubstituteService.updateRequestStatus(requestId, status, responseMessage)
        toast.success(`Request ${status.toLowerCase()} successfully`)
      } catch (error) {
        // Handle the specific error about secret key
        if (error.message && error.message.includes("secret key byte array cannot be null or empty")) {
          toast.warning(`Request ${status.toLowerCase()}, but email notification could not be sent.`)
        } else {
          throw error // Re-throw other errors to be caught by the outer catch block
        }
      }
      fetchReceivedRequests()
    } catch (error) {
      console.error("Error in handleUpdateRequestStatus:", error)
      toast.error(`Failed to ${status.toLowerCase()} request: ` + error.message)
    } finally {
      setLoading(false)
      console.log("Completed handleUpdateRequestStatus")
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-badge pending"
      case "APPROVED":
        return "status-badge approved"
      case "REJECTED":
        return "status-badge rejected"
      default:
        return "status-badge"
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Debug panel
  const renderDebugPanel = () => {
    return (
      <div
        style={{
          margin: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>Debug Information</h3>
        <p>
          <strong>Faculty Data:</strong>{" "}
          {facultyData ? `ID: ${facultyData.facultyId}, Name: ${facultyData.name || "N/A"}` : "Not loaded"}
        </p>
        <p>
          <strong>Faculty Data Raw:</strong> {facultyData ? JSON.stringify(facultyData) : "Not loaded"}
        </p>
        <p>
          <strong>Selected Substitute:</strong> {selectedSubstitute || "None"}
        </p>
        <p>
          <strong>Timetable Loaded:</strong> {debug.timetableLoaded ? "Yes" : "No"}
        </p>
        <p>
          <strong>Batches Loaded:</strong> {debug.batchesLoaded ? "Yes" : "No"}
        </p>
        <p>
          <strong>Timetable Entries:</strong> {timetableEntries.length}
        </p>
        <p>
          <strong>Batches:</strong> {batches.length}
        </p>
        <p>
          <strong>Error:</strong> {debug.error || "None"}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Render debug panel in development */}
      {process.env.NODE_ENV !== "production" && renderDebugPanel()}

      <div className="faculty-substitute-content">
        <h2>Faculty Substitution Management</h2>

        <div className="tabs">
          <button className={activeTab === "request" ? "active" : ""} onClick={() => setActiveTab("request")}>
            Request Substitute
          </button>
          <button className={activeTab === "sent" ? "active" : ""} onClick={() => setActiveTab("sent")}>
            Sent Requests
          </button>
          <button className={activeTab === "received" ? "active" : ""} onClick={() => setActiveTab("received")}>
            Received Requests
          </button>
        </div>

        {activeTab === "request" && (
          <div className="request-form">
            <div className="form-section">
              <h3>Step 1: Select Class Details</h3>
              <div className="form-group">
                <label>Select Timetable Entry:</label>
                <select
                  value={selectedEntry ? selectedEntry.id : ""}
                  onChange={(e) => {
                    const entry = timetableEntries.find((entry) => entry.id.toString() === e.target.value)
                    handleEntrySelect(entry)
                  }}
                >
                  <option value="">-- Select Class --</option>
                  {timetableEntries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.courseName} ({entry.courseCode}) - {entry.batchName} - {entry.day} Period{" "}
                      {entry.periodNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Date for Substitution:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label>Reason for Substitution:</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason for your substitution request"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Step 2: Find Available Faculty</h3>
              <div className="filter-options">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="filterAvailability"
                    checked={filterByAvailability}
                    onChange={() => setFilterByAvailability(!filterByAvailability)}
                  />
                  <label htmlFor="filterAvailability">Filter by Availability</label>
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="filterBatch"
                    checked={filterByBatch}
                    onChange={() => setFilterByBatch(!filterByBatch)}
                  />
                  <label htmlFor="filterBatch">Filter by Batch Handling</label>
                </div>
              </div>
              <button
                className="filter-button"
                onClick={handleFilterFaculty}
                disabled={!selectedEntry || !selectedDate}
              >
                Find Available Faculty
              </button>

              {availableFaculty.length > 0 && (
                <div className="faculty-list">
                  <h4>Available Faculty Members</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Available</th>
                        <th>Handles Batch</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableFaculty.map((faculty) => (
                        <tr key={faculty.facultyId}>
                          <td>{faculty.name}</td>
                          <td>{faculty.department}</td>
                          <td>{faculty.designation}</td>
                          <td>
                            <span className={faculty.available ? "status-available" : "status-unavailable"}>
                              {faculty.available ? "Yes" : "No"}
                            </span>
                          </td>
                          <td>
                            <span className={faculty.handlesBatch ? "status-available" : "status-unavailable"}>
                              {faculty.handlesBatch ? "Yes" : "No"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="select-button"
                              onClick={() => {
                                console.log("Selected faculty:", faculty)
                                setSelectedSubstitute(faculty.facultyId)
                              }}
                              disabled={!faculty.available}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Step 3: Submit Request</h3>
              <button
                className="submit-button"
                onClick={handleSubmitRequest}
                disabled={!selectedEntry || !selectedDate || !selectedSubstitute || !reason || loading}
              >
                {loading ? "Submitting..." : "Submit Substitute Request"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "sent" && (
          <div className="requests-list">
            <h3>Sent Substitute Requests</h3>
            {loading ? (
              <p>Loading requests...</p>
            ) : sentRequests.length === 0 ? (
              <p>No substitute requests sent.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Date</th>
                    <th>Period</th>
                    <th>Substitute</th>
                    <th>Status</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  {sentRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        {request.courseTitle} ({request.courseCode})
                      </td>
                      <td>
                        {request.batchName} {request.section}
                      </td>
                      <td>{formatDate(request.requestDate)}</td>
                      <td>
                        Period {request.periodNumber} ({request.startTime} - {request.endTime})
                      </td>
                      <td>{request.substituteName}</td>
                      <td>
                        <span className={getStatusBadgeClass(request.status)}>{request.status}</span>
                      </td>
                      <td>{request.responseMessage || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "received" && (
          <div className="requests-list">
            <h3>Received Substitute Requests</h3>
            {loading ? (
              <p>Loading requests...</p>
            ) : receivedRequests.length === 0 ? (
              <p>No substitute requests received.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Requester</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Date</th>
                    <th>Period</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.requesterName}</td>
                      <td>
                        {request.courseTitle} ({request.courseCode})
                      </td>
                      <td>
                        {request.batchName} {request.section}
                      </td>
                      <td>{formatDate(request.requestDate)}</td>
                      <td>
                        Period {request.periodNumber} ({request.startTime} - {request.endTime})
                      </td>
                      <td>{request.reason}</td>
                      <td>
                        <span className={getStatusBadgeClass(request.status)}>{request.status}</span>
                      </td>
                      <td>
                        {request.status === "PENDING" && (
                          <div className="action-buttons">
                            <button
                              className="approve-button"
                              onClick={() =>
                                handleUpdateRequestStatus(request.id, "APPROVED", "I can substitute for this class.")
                              }
                              disabled={loading}
                            >
                              Approve
                            </button>
                            <button
                              className="reject-button"
                              onClick={() =>
                                handleUpdateRequestStatus(
                                  request.id,
                                  "REJECTED",
                                  "I'm not available for this substitution.",
                                )
                              }
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default FacultySubstitute

