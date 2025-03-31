"use client";

import { useState, useEffect } from "react";
import { preconnect } from "react-dom";
import checkUnit from "../download_data/checkUnits";
import uploadUnit from "../download_data/uploadUnit";
import downloadUnit from "../download_data/downloadUnits";
import { timeslots } from "@/db/schema";

// Define the structure for an individual course
interface Course {
  id: string;
  unitCode: string;     // Unit code (e.g., "CAB202")
  unitName: string;     // Full name of the unit
  classType: string;    // Type of class (e.g., "Lecture", "Tutorial")
  activity: string;     // Specific activity code (e.g., "LEC", "TUT")
  day: string;          // Day of the week (e.g., "MON", "TUE")
  time: string;         // Time slot (e.g., "9AM - 11AM")
  room: string;         // Room number or location
  teachingStaff: string;// Name of the teaching staff
}

// Define the structure for course data, including the unit name and its courses
interface CourseData {
  unitName: string;     // Full name of the unit
  courses: Course[];    // Array of courses associated with the unit
}

// Define the props for the Units component
interface UnitsProps {
  courseList: { [key: string]: CourseData };                        // List of added courses
  setCourseList: React.Dispatch<React.SetStateAction<{ [key: string]: CourseData }>>; // Function to update courseList
  setTab: React.Dispatch<React.SetStateAction<"units" | "preferences" | "timetable">>; // Function to change the current tab
  setError: React.Dispatch<React.SetStateAction<string | null>>;    // Function to set error messages
  error: string | null;                                             // Current error message
  unitColors: { [unitCode: string]: string };                       // Mapping of unit codes to their assigned colors
}

// Units component allows users to add units and manage the course list
const Units: React.FC<UnitsProps> = ({
  courseList,
  setCourseList,
  setTab,
  setError,
  error,
  unitColors,
}) => {
  // State variables for managing user input and component behavior
  const [unitCode, setUnitCode] = useState("");                  // User-inputted unit code
  const [selectedPeriod, setSelectedPeriod] = useState("");      // User-selected teaching period
  const [loading, setLoading] = useState(false);                 // Loading state for asynchronous operations
  const [validPeriods, setValidPeriods] = useState<any[]>([]);   // Valid teaching periods for the entered unit code
  const [showDialog, setShowDialog] = useState(false);           // Controls the visibility of the teaching period selection dialog


  // Function to handle the search action when the user adds a unit code
  const handleSearch = async () => {
    if (!unitCode) {
      setError("Please enter a unit code");                      // Prompt user to enter a unit code
      return;
    }

    if (courseList[unitCode.toUpperCase()]) {
      setError("Unit already added");                            // Prevent adding the same unit twice
      return;
    }

    setLoading(true);        // Set loading state to true during fetch
    setError(null);          // Clear any previous errors
    setValidPeriods([]);     // Reset valid periods

    try {
      const formattedUnitCode = unitCode.toUpperCase();          // Format unit code to uppercase for consistency
      
      const response = await fetch(
        `/api/unit-data?unitCode=${formattedUnitCode}`
      );

      const data = await response.json();                      // Parse JSON response

      if (data.length === 0) {
        setError("No valid periods found for this unit.");       // Inform user if no valid periods are found
      } else {
        setShowDialog(true);                                     // Show dialog to select a teaching period
      }
      setValidPeriods(data.teachingPeriods);                                 // Set teaching periods for the selected unit code
    } catch (error) {
      setError("Failed to fetch courses");                       // Set error if fetch fails
    } finally {
      setLoading(false);                                         // Reset loading state
    };
  };
  

  // Function to handle adding the unit to the course list after selecting a period
  const handleAddUnit = async () => {
  if (selectedPeriod) {
    const formattedUnitCode = unitCode.toUpperCase();          // Ensure unit code is uppercase

    // Fetch course data for the selected unit and period from the API
    try {
      // Check if the unit exists in the database
      const dbResponse = await checkUnit(formattedUnitCode);
      // if (dbResponse.exists) {
        
        // Fetch course data from database
        // const courseResponse = await downloadUnit(formattedUnitCode);

        // if(courseResponse.success) {
        //   const unitData = {
        //     unitName: courseResponse.unitName,
        //     courses: courseResponse.courseData,
        //   };
          
        //   if (unitData.unitName && unitData.courses) {
        //     setCourseList((prevCourses) => ({
        //       ...prevCourses,
        //       [formattedUnitCode]: unitData as CourseData,
        //     }));
        //   } else {
        //     setError("Invalid unit data received.");
        //   }
        // }
        
      //   setShowDialog(false);         // Close the dialog
      //   setUnitCode("");              // Reset unit code input
      //   setSelectedPeriod("");        // Reset selected period
      // } 
      // else {
      console.log(selectedPeriod);
        const response = await fetch(
          `/api/course-data?unitCode=${formattedUnitCode}&teachingPeriod=${selectedPeriod}`
        );
        
        const data = await response.json();
        const unitData = data[formattedUnitCode];                // Extract unit data

        // Update the course list with the new unit data
        setCourseList((prevCourses) => ({
          ...prevCourses,
          [formattedUnitCode]: unitData,
        }));

        // Add the new unit data to the SQL database in the background
        uploadUnit(formattedUnitCode, unitData.courses, selectedPeriod, unitData.unitName).catch((error) => {
          console.error("Failed to add unit to the database:", error);
        });

        setShowDialog(false);         // Close the dialog
        setUnitCode("");              // Reset unit code input
        setSelectedPeriod("");        // Reset selected period
      // }
    } catch {
      setError("Failed to add the unit.");                     // Set error if fetch fails
    }
  } else {
    setError("Please select a valid teaching period.");       // Prompt user to select a period
  }
};

// Function to handle removing a unit from the course list
const handleRemoveUnit = (unitCodeToRemove: string) => {
  setCourseList((prevCourses) => {
    const updatedCourses = { ...prevCourses };
    delete updatedCourses[unitCodeToRemove];                   // Remove the unit from the list
    return updatedCourses;
  });
};

return (
  <div className="bg-white border border-blue-1400 w-full min-h-fit ml-2 mr-2 my-4 px-12 rounded-lg">
    {/* Units Tab Content */}
    <div className="mt-12 mb-4 w-full flex items-center relative">
      {/* Page Title */}
      <h1 className="text-4xl absolute left-1/2 transform -translate-x-1/2 text-blue-1300 font-semibold">
        Add your Units
      </h1>
      {/* Next Button to proceed to Preferences tab */}
      <button
        onClick={() => {
          if (Object.keys(courseList).length === 0) {
            setError("Add Unit to generate timetable"); // Prompt user to add units before proceeding
          } else {
            setTab("preferences"); // Navigate to Preferences tab
          }
        }}
        className={`ml-auto px-6 py-2 text-white rounded-full ${
          Object.keys(courseList).length === 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-1000 hover:bg-blue-1100"
        }`}
        disabled={Object.keys(courseList).length === 0} // Disable if no units added
      >
        Next
      </button>
    </div>

    {/* Search Feature */}
    <div className="mt-10 mb-16 flex items-center justify-center">
      {loading ? (
        // Show "Searching..." when loading
        <p className="text-xl text-blue-1000 font-semibold">Searching...</p>
      ) : (
        // Show input form and search button when not loading
        <div className="flex items-center justify-center space-x-4">
          <input
            type="text"
            className="w-48 px-6 py-2 rounded-lg bg-blue-1500 border border-blue-1400 text-blue-1400"
            placeholder="Enter unit code"
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-1000 text-white hover:bg-blue-1100 rounded-full"
            disabled={loading}
          >
            Add
          </button>
        </div>
      )}
    </div>

    {/* Display Error Message if any */}
    {error && <p className="text-red-500 mb-6">{error}</p>}

    {/* Display Added Units */}
    <div className="flex items-center justify-center space-x-4 mb-6 flex-wrap">
      {Object.keys(courseList)
        .sort((a, b) => a.localeCompare(b))
        .map((unit) => (
          <div key={unit} className="flex flex-col items-center group">
            <div
              className={`relative px-6 py-10 rounded-full flex items-center justify-center text-white bg-blue-1000`}
            >
              <span className="text-lg">{unit.toUpperCase()}</span>
              <span
                className="absolute bottom-2 text-gray-300 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveUnit(unit);
                }}
              >
                ✖
              </span>
            </div>
          </div>
        ))}
    </div>

    {/* Dialog for Selecting Teaching Period */}
    {showDialog && (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        onClick={() => {
          setShowDialog(false);
          setLoading(false); // Reset loading when popup is closed
        }}
      >
        <div
          className="bg-white border border-blue-1400 p-6 rounded-lg relative"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the dialog
        >
          <button
            onClick={() => setShowDialog(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          >
            ✖
          </button>
          <h2 className="text-xl mb-4 font-semibold text-blue-1300">Select a Teaching Period</h2>
          <select
            className="mb-4 px-6 py-2 rounded-lg bg-blue-1500 text-black"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="">Select period</option>
            {validPeriods.map((teachingPeriods: any) => (
              <option key={teachingPeriods.id} value={teachingPeriods.id}>
                {teachingPeriods.name}
              </option>
            ))}
          </select>
          <div>
            <button
              onClick={handleAddUnit}
              className="px-6 py-2 bg-blue-1000 text-white hover:bg-blue-1100 rounded-full"
            >
              Add Unit
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);  
};

export default Units;
