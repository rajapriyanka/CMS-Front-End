import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { format } from "date-fns"
import axios from "axios"

const BASE_URL = "http://localhost:8080"

const FacultyStudentLeaves = () => {
  const navigate = useNavigate()
  const facultyId = localStorage.getItem("facultyId")
  
  const [activeTab, setActiveTab] = useState("pending")
  const [leaveRequests, setLeaveRequests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [comments, setComments] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState("")

  useEffect(() => {
    if (!facultyId) {
      toast.error("Please login to access this page")
      navigate("/login")
      return
    }

    fetchLeaveRequests()
  }, [facultyId, navigate, activeTab])

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      
      let endpoint = `/api/student-leave/faculty/${facultyId}`
      if (activeTab === "pending") {
        endpoint = `/api/student-leave/faculty/${facultyId}/pending`
      }
      
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { "Authorization": `Bearer ${token}` },
      })
      
      setLeaveRequests(response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch leave requests")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedLeave) return
    
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      
      await axios.put(
        `${BASE_URL}/api/student-leave/${selectedLeave.id}/action/${facultyId}`,
        {
          status: actionType === "approve" ? "APPROVED" : "REJECTED",
          comments: comments
        },
        {
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
        }
      )
      
      toast.success(`Leave request ${actionType === "approve" ? "approved" : "rejected"} successfully`)
      setIsDialogOpen(false)
      setComments("")
      fetchLeaveRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${actionType} leave request`)
    } finally {
      setIsLoading(false)
    }
  }

  const openActionDialog = (leave, action) => {
    setSelectedLeave(leave)
    setActionType(action)
    setComments("")
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-300">
          <span className="inline-block w-3 h-3 mr-1">⏱️</span> Pending
        </span>
      case "APPROVED":
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-300">
          <span className="inline-block w-3 h-3 mr-1">✅</span> Approved
        </span>
      case "REJECTED":
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 border border-red-300">
          <span className="inline-block w-3 h-3 mr-1">❌</span> Rejected
        </span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs border">{status}</span>
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return format(date, "PPP") // Format: Jan 1, 2021
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md w-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Student Leave Requests</h2>
          <p className="text-gray-500">Manage student leave requests</p>
        </div>
        
        <div className="p-4">
          <div className="mb-4 border-b">
            <div className="flex">
              <button 
                className={`px-4 py-2 ${activeTab === "pending" ? "border-b-2 border-blue-500 font-medium" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending Requests
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === "all" ? "border-b-2 border-blue-500 font-medium" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Requests
              </button>
            </div>
          </div>
          
          {renderLeaveTable()}
        </div>
        
        <div className="p-4 border-t flex justify-between">
          <button 
            className="px-4 py-2 border rounded hover:bg-gray-50"
            onClick={() => navigate("/faculty/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium">
                {actionType === "approve" ? "Approve" : "Reject"} Leave Request
              </h3>
              <p className="text-sm text-gray-500">
                {actionType === "approve" 
                  ? "Are you sure you want to approve this leave request?" 
                  : "Are you sure you want to reject this leave request?"}
              </p>
            </div>
            
            {selectedLeave && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">Student:</p>
                    <p className="text-sm">{selectedLeave.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Subject:</p>
                    <p className="text-sm">{selectedLeave.subject}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">From:</p>
                    <p className="text-sm">{formatDate(selectedLeave.fromDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">To:</p>
                    <p className="text-sm">{formatDate(selectedLeave.toDate)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm">{selectedLeave.reason}</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="comments" className="text-sm font-medium">
                    Comments (optional)
                  </label>
                  <textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add your comments here..."
                    rows={3}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-2">
              <button 
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                disabled={isLoading}
                className={`px-4 py-2 rounded text-white ${
                  actionType === "approve" 
                    ? "bg-blue-500 hover:bg-blue-600" 
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isLoading ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function renderLeaveTable() {
    if (isLoading) {
      return <div className="text-center py-8">Loading leave requests...</div>
    }
    
    if (leaveRequests.length === 0) {
      return (
        <div className="text-center py-8">
          No {activeTab === "pending" ? "pending " : ""}leave requests found.
        </div>
      )
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Subject</th>
              <th className="p-2 text-left">From</th>
              <th className="p-2 text-left">To</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((leave) => (
              <tr key={leave.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{leave.studentName}</td>
                <td className="p-2">{leave.subject}</td>
                <td className="p-2">{formatDate(leave.fromDate)}</td>
                <td className="p-2">{formatDate(leave.toDate)}</td>
                <td className="p-2">{getStatusBadge(leave.status)}</td>
                <td className="p-2">
                  {leave.status === "PENDING" && (
                    <div className="flex space-x-2">
                      <button 
                        className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => openActionDialog(leave, "approve")}
                      >
                        Approve
                      </button>
                      <button 
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => openActionDialog(leave, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {leave.status !== "PENDING" && (
                    <span className="text-sm text-gray-500">
                      {leave.comments || "No comments"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default FacultyStudentLeaves
