"use client";

import React, { useState, useEffect } from "react";
import TimetableView from "./timetableView"; // Adjust the import path as needed
import { groupActivitiesByUnit, getSelectedUnits } from "./manageTimeslots"
import { fetchAvailablePeriods, fetchCourseData, saveTimetable, importTimetable, loadSavedTimetables } from "./fetchData"

// Define a color palette to assign colors to units dynamically
const colorPalette = [
  "bg-blue-1000",
  "bg-red-1000",
  "bg-green-1000",
  "bg-yellow-1000",
  "bg-purple-1000",
  "bg-orange-1000",
  "bg-pink-1000",
];


const Details = ({ userId }: { userId: string }) => {
  const [courseList, setCourseList] = useState({});
  const [unitCode, setUnitCode] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [validPeriods, setValidPeriods] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState({});
  const [unitColors, setUnitColors] = useState({});
  const [dropdownShow, setDropdownShow] = useState({});

  // New state variables for timetable actions
  const [saveTimetableDialogOpen, setSaveTimetableDialogOpen] = useState(false);
  const [importTimetableDialogOpen, setImportTimetableDialogOpen] = useState(false);
  const [timetableName, setTimetableName] = useState("");
  const [savedTimetables, setSavedTimetables] = useState([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleSearch = async (forceNew: string = "true") => {  /*
  Description:
    - Asynchronously searches for valid teaching periods for a given unit code.
    - It first validates user input and then calls the consolidated function to fetch available periods.
    - Based on the fetched data, it updates the application state to either display an error or show a dialog for further action.
  Inputs:
    - Uses 'unitCode' from state (string) representing the unit code entered by the user.
    - Uses 'courseList' state to check if a unit is already added.
  State Updates / Outputs:
    - Updates 'loading', 'error', 'validPeriods', and 'showDialog' state.
    - Does not return a value, but mutates state accordingly.
  */
    setShowDialog(false);

    if (!unitCode) {
      setError("Please enter a unit code");
      return;
    }
    if (courseList[unitCode.toUpperCase()]) {
      setError("Unit already added");
      return;
    }
  
    setLoading(true);
    setError(null);
    setValidPeriods([]);
  
    try {
      const formattedUnitCode = unitCode.toUpperCase();
      // Use the optional parameter in the call to fetchAvailablePeriods.
      const { validPeriods } = await fetchAvailablePeriods(formattedUnitCode, forceNew);
      setValidPeriods(validPeriods);
  
      if (validPeriods.length === 0) {
        setError("No valid periods found for this unit.");
      } else {
        setShowDialog(true);
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch courses or teaching periods");
    } finally {
      setLoading(false);
    }
  };


const handleAddUnit = async () => {
  /*
  Description:
    - Asynchronously adds a unit to the course list using the selected teaching period.
    - It fetches the unit data via 'fetchCourseData' and then updates various states including course list, unit colors, and dropdown visibility.
    - It ensures that each unit gets a unique color from the defined palette.
  Inputs:
    - Uses 'selectedPeriod' from state (string) that represents the chosen teaching period.
    - Uses 'unitCode' from state (string) representing the current unit code.
  State Updates / Outputs:
    - Updates 'courseList', 'unitColors', 'dropdownShow', and resets 'showDialog', 'unitCode', and 'selectedPeriod'.
    - Does not have a return value; it triggers updates via React setState functions.
  */
  if (selectedPeriod) {
    const formattedUnitCode = unitCode.toUpperCase();
    try {

      // Use fetchCourseData to retrieve and process unit data.
      const unitData = await fetchCourseData(formattedUnitCode, selectedPeriod);

      console.log("Here is the course list", unitData)

      setCourseList((prev) => ({
        ...prev,
        [formattedUnitCode]: unitData,
      }));

      // Assign a unique color from the palette if not already used.
      setUnitColors((prev) => {
        const usedColors = Object.values(prev);
        const availableColor =
          colorPalette.find((color) => !usedColors.includes(color)) || colorPalette[0];
        return {
          ...prev,
          [formattedUnitCode]: availableColor,
        };
      });

      // Set the unit's timeslots to be visible by default.
      setDropdownShow((prev) => ({
        ...prev,
        [formattedUnitCode]: true,
      }));

      // Close the dialog and reset input fields.
      setShowDialog(false);
      setUnitCode("");
      setSelectedPeriod("");
    } catch (err) {
      setError("Failed to add the unit.");
    }
  } else {
    setError("Please select a valid teaching period.");
  }
};


const handleRemoveUnit = (unitCodeToRemove: string) => {
    /*
  Description:
    - Removes a specified unit from various state objects including course list, selected courses, unit colors, and dropdown visibility.
    - It ensures that all traces of the unit are deleted from the state.
  Inputs:
    - 'unitCodeToRemove' (string): The unit code for the unit that needs to be removed.
  State Updates / Outputs:
    - Updates 'courseList', 'selectedCourses', 'unitColors', and 'dropdownShow'.
    - There is no return value; it relies entirely on React setState functions.
  */
    setCourseList((prev) => {
      const updated = { ...prev };
      delete updated[unitCodeToRemove];
      return updated;
    });
    setSelectedCourses((prev) => {
      const updated = { ...prev };
      delete updated[unitCodeToRemove];
      return updated;
    });
    setUnitColors((prev) => {
      const updated = { ...prev };
      delete updated[unitCodeToRemove];
      return updated;
    });
    setDropdownShow((prev) => {
      const updated = { ...prev };
      delete updated[unitCodeToRemove];
      return updated;
    });
  };

 
  const toggleUnitDropdown = (unitCode: string) => {
     /*
    Description:
      - Toggles the dropdown visibility state for a specific unit.
      - This function switches the current boolean state of dropdown visibility to its opposite value.
    Inputs:
      - 'unitCode' (string): The unit code for which the dropdown visibility should be toggled.
    State Updates / Outputs:
      - Updates the 'dropdownShow' state.
      - Does not return any value; the update is made through React's setState functionality.
    */
    setDropdownShow((prev) => ({
      ...prev,
      [unitCode]: !prev[unitCode],
    }));
  };


// New handler: Save Timetable.
const handleSaveTimetable = async () => {
  if (!timetableName) {
    setError("Please provide a timetable name.");
    return;
  }
  // Gather all timeslot IDs from your selectedCourses.
  let timeslotIds = [];
  Object.values(selectedCourses).forEach((unitCourses) => {
    // Instead of obtaining keys (which are course types), extract the actual course objects and get their id.
    timeslotIds.push(...Object.values(unitCourses).map((course) => course.id));
  });
  
  try {
    // Call our direct-SQL helper using the proper parameters:
    // Pass in the user.id, timetableName, and the gathered timeslotIds.
    console.log("Here is the userId:", userId, "and timetable name", timetableName, "and IDs", timeslotIds);


    await saveTimetable(userId, timetableName, timeslotIds);
   
    setSaveTimetableDialogOpen(false);

  } catch (err) {
    setError(err.message);
  }
};


const handleImportTimetable = async () => {
  if (!selectedTimetableId) {
    setError("Please select a timetable to import.");
    return;
  }

  try {
    console.log("Importing timetable with ID:", selectedTimetableId);
    // Directly call our helper function (imported from your server module)
    const { coursesWithUnits, formatted } = await importTimetable(selectedTimetableId);

    console.log("coursesWithUnits received:", coursesWithUnits);
    console.log("formatted", formatted);



    // SECTION FOR COURSE WITH UNITS

    setCourseList({});
    setUnitColors({});
    Object.keys(coursesWithUnits).forEach((unitCode) => {
      const unitData = coursesWithUnits[unitCode];
      const formattedUnitCode = unitCode; // Assuming unitCode is already formatted
    
      // Update course list for the unit
      setCourseList((prev) => ({
        ...prev,
        [formattedUnitCode]: unitData,
      }));
    
      // Assign a unique color from the palette if not already used
      setUnitColors((prev) => {
        const usedColors = Object.values(prev);
        const availableColor =
          colorPalette.find((color) => !usedColors.includes(color)) || colorPalette[0];
        return {
          ...prev,
          [formattedUnitCode]: availableColor,
        };
      });
    
      // Set the unit's timeslots to be visible by default
      setDropdownShow((prev) => ({
        ...prev,
        [formattedUnitCode]: true,
      }));
    });

    // Transform the imported data to match the `selectedCourses` structure
    setSelectedCourses({});
    const formattedCourses = Object.keys(formatted).reduce((acc, unitCode) => {
      const unitData = formatted[unitCode];
      const unitCourses = unitData.courses;

      // If `unitCourses` is an array, process it. Otherwise, handle as object.
      if (Array.isArray(unitCourses)) {
        const activityGroups = unitCourses.reduce((activityAcc, course) => {
          if (!activityAcc[course.activity]) {
            activityAcc[course.activity] = course; // Add the course by its activity
          }
          return activityAcc;
        }, {});

        acc[unitCode] = activityGroups;
      } else {
        // Handle case where `unitCourses` might already be an object
        acc[unitCode] = unitCourses;
      }

      return acc;
    }, {});

    // Update your state with the transformed data
    setSelectedCourses((prev) => ({ ...prev, ...formattedCourses }));

    setImportTimetableDialogOpen(false);
    setSelectedTimetableId("");
  } catch (err) {
    setError(err.message);
  }
};




useEffect(() => {
  if (importTimetableDialogOpen) {
    (async () => {
      try {
        const timetablesFound = await loadSavedTimetables(userId);
        setSavedTimetables(timetablesFound);

      } catch (err) {
        setError(err.message);
      }
    })();
  }
}, [importTimetableDialogOpen]);



const handleButtonClick = (action) => {
  if (!userId) {
    setShowLoginPopup(true);
    setTimeout(() => setShowLoginPopup(false), 3000); // Hides the popup after 3 seconds
  } else {
    if (action === "save") {
      setSaveTimetableDialogOpen(true);
    } else if (action === "import") {
      setImportTimetableDialogOpen(true);
    }
  }
};


  
  // Group courses by unit and activity
  const sidebarData = groupActivitiesByUnit(courseList);
  console.log("sidebarData:", sidebarData)

  // Get selected units
  const selectedCourseList = getSelectedUnits(selectedCourses, courseList);
  // console.log("selectedCourseList:", selectedCourseList)
  // console.log("courseList:", courseList);


  // Render the unit/timeslot selection UI
  return (
    <div className="flex flex-col md:flex-row bg-white">

      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            setShowDialog(false);
            setLoading(false); // Reset loading when popup is closed
          }}
        >
          <div
            className="bg-white border border-blue-1400 p-6 rounded-lg relative z-60"
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
              className="mb-4 px-6 py-2 w-full rounded-lg bg-blue-1500 text-black"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="">Select period</option>
              {validPeriods.map((period: any) => (
                <option key={period.value} value={period.value}>
                  {period.text}
                </option>
              ))}
            </select>
             {/* "SEMESTER NOT FOUND" button */}
             <div className="flex flex-col">
              <button
                onClick={handleAddUnit}
                className="px-4 py-2 bg-blue-1000 text-white hover:bg-blue-1100 rounded-full"
              >
                Add Unit
              </button>
              <button
                onClick={() => handleSearch("true")}
                className="mt-8 mx-10 px-4 py-2 text-sm bg-gray-600 text-white hover:bg-gray-700 rounded-full"
              >
                Period not found
              </button>
            </div>

          </div>
        </div>
      )}


    {saveTimetableDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSaveTimetableDialogOpen(false)}
        >
          <div
            className="bg-white border border-blue-1400 p-6 rounded-lg relative z-60"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSaveTimetableDialogOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <h2 className="text-xl mb-4 font-semibold text-blue-1300">
              Save
            </h2>
            <input
              type="text"
              placeholder="Enter timetable name"
              value={timetableName}
              onChange={(e) => setTimetableName(e.target.value)}
              className="mb-4 px-6 py-2 w-full rounded-lg border bg-gray-100 text-gray-600"
            />
            <button
              onClick={handleSaveTimetable}
              className="px-4 py-2 bg-blue-1300 text-white rounded-full"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {importTimetableDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setImportTimetableDialogOpen(false)}
        >
          <div
            className="bg-white border border-blue-1400 p-6 rounded-lg relative z-60"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImportTimetableDialogOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <h2 className="text-xl mb-4 font-semibold text-blue-1300">
              Import
            </h2>
            <select
              className="mb-4 px-6 py-2 w-full rounded-lg bg-gray-200 text-gray-600"
              value={selectedTimetableId}
              onChange={(e) => setSelectedTimetableId(e.target.value)}
            >
              <option value="">Select Timetable</option>
              {savedTimetables.map((tt) => (
                <option key={tt.id} value={tt.id}>
                  {tt.timetableName}
                </option>
              ))}
            </select>
            <button
              onClick={handleImportTimetable}
              className="px-4 py-2 bg-blue-1300 text-white rounded-full"
            >
              Confirm
            </button>
          </div>
        </div>
      )}




      <section className="w-full md:w-1/4 p-6 bg-blue-1500 border-r border-gray-300">
      <div className="flex items-center justify-center w-full h-10 mb-6">
        {loading ? (
          <div className="text-blue-1300 font-bold text-xl">Searching...</div>
        ) : (
          <>
            <input
              type="text"
              className="px-6 py-2 mr-2 border text-gray-700 rounded-full bg-white border-blue-1400 w-full"
              placeholder="Enter unit code"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-1300 text-white rounded-full"
              disabled={loading}
            >
              Search
            </button>
          </>
        )}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
        <div className="flex mt-4 mb-8 inline-block space-x-4">
          <button
            onClick={() => handleButtonClick("save")}
            className="px-4 py-2 bg-blue-1300 hover:bg-blue-1100 text-white rounded-full"
          >
            Save Timetable
          </button>
          <button
            onClick={() => handleButtonClick("import")}
            className="px-4 py-2 bg-blue-1300 hover:bg-blue-1100 text-white rounded-full"
          >
            Import Timetable
          </button>

          {/* Popup message */}
          {showLoginPopup && (
            <div className="absolute top-52 bg-red-400 text-white px-4 py-2 rounded shadow-lg">
              Please <a href="/login" className="underline text-white">login</a> to continue.
            </div>
          )}
        </div>

        <div>
          {Object.keys(sidebarData)
            .sort()
            .map((unit) => (
              <div key={unit} className="mb-3">
                <h3
                  className="text-lg text-white px-4 py-2 font-semibold bg-blue-1400 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleUnitDropdown(unit)} // Toggle on click
                >
                  <div className="flex items-center">
                    {/* Arrow that flips depending on visibility */}
                    <div
                      className={`mr-4 transform transition-transform ${
                        dropdownShow[unit] ? "rotate-180" : "mb-2"
                      }`}
                    >
                      <div className="w-2 h-2 border-solid border-r-2 border-b-2 border-white transform rotate-45"></div>
                    </div>
                    {unit}
                  </div>
                  <div className="flex items-center">
                    {/* Circle with the unit color */}
                    <div
                      className="unit-circle"
                      style={{ backgroundColor: unitColors[unit] || "white" }}
                    ></div>
                    <span
                      className="cursor-pointer text-white"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent toggle when clicking "✖"
                        handleRemoveUnit(unit);
                      }}
                    >
                      ✖
                    </span>
                  </div>
                </h3>
                {dropdownShow[unit] && (
                  <div className="max-h-[40vh] overflow-y-auto bg-white text-gray-600">
                  {Object.keys(sidebarData[unit]).map((activity) => (
                    <div key={activity} className="mb-4">
                      <p className="bg-gray-500 px-4 py-2 text-white">{activity.toUpperCase()}</p>
                      <ul className="list-none"> {/* Replaced list-disc with list-none */}
                        {sidebarData[unit][activity].map((course) => {
                          const isSelected =
                            selectedCourses[unit] &&
                            selectedCourses[unit][activity] &&
                            selectedCourses[unit][activity].id === course.id;
                          return (
                            <li
                              key={course.id}
                              onClick={() => {
                                setSelectedCourses((prev) => ({
                                  ...prev,
                                  [unit]: {
                                    ...prev[unit],
                                    [activity]: course,
                                  },
                                }));
                              }}
                              className={`px-4 py-2 cursor-pointer ${isSelected ? "bg-gray-300" : ""}`}
                            >
                              {course.day} {course.time}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>                
                )}
              </div>
            ))}
        </div>
      </section>

      <section className="w-full md:w-3/4 pr-6 pb-6">
        <TimetableView
          courseList={selectedCourseList}
          unitColors={unitColors}
          preferences={{ studyTimes: [] }} // Pass any preference settings here
        />
      </section>
    </div>
  );
};



export default Details;