import React, { createContext, useContext, useState, useEffect } from "react";

// Create Faculty Context
const FacultyContext = createContext();

export const FacultyProvider = ({ children }) => {
  const [facultyData, setFacultyData] = useState(null);

  useEffect(() => {
    // Load faculty data from localStorage
    const storedFacultyId = localStorage.getItem("facultyId");
    if (storedFacultyId) {
      setFacultyData({ facultyId: parseInt(storedFacultyId, 10) }); // Parse facultyId as integer
    }
  }, []);

  // Set faculty information after login
  const setFacultyInfo = (facultyInfo) => {
    if (facultyInfo && facultyInfo.facultyId) {
      setFacultyData(facultyInfo);
      localStorage.setItem("facultyId", facultyInfo.facultyId);
    }
  };

  // Clear faculty information during logout
  const clearFacultyInfo = () => {
    setFacultyData(null);
    localStorage.removeItem("facultyId");
  };

  return (
    <FacultyContext.Provider value={{ facultyData, setFacultyInfo, clearFacultyInfo }}>
      {children}
    </FacultyContext.Provider>
  );
};

// Custom hook to use the FacultyContext
export const useFaculty = () => useContext(FacultyContext);
