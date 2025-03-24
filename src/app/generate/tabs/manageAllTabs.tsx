// manageTabs.tsx

"use client";

import { useState } from "react";
import Units from "./unitsTab";
import Preferences from "./preferencesTab";
import TimetableView from "./timetableTab";
import { UnitData, PreferencesData } from '../algorithms/interfaces';

// Main component that manages the application tabs and state
export default function ManageTabs() {

  const [courseList, setCourseList] = useState<{ [key: string]: UnitData }>({});
  const [preferences, setPreferences] = useState<PreferencesData>({ studyTimes: {} });
  const [tab, setTab] = useState<"units" | "preferences" | "timetable">("units");
  const [error, setError] = useState<string | null>(null);

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

  // Object to map each unit code to a specific color for consistency
  const unitColors: { [unitCode: string]: string } = {};
  let colorIndex = 0;

  // Assign colors to each unit code
  Object.keys(courseList).forEach((unit) => {
    if (unit.toUpperCase() === "CAB202") {
      // Special case: Assign "bg-brown-1000" to "CAB202"
      unitColors[unit] = "bg-brown-1000";
    } else {
      // Assign colors from the palette in order
      if (!unitColors[unit]) {
        unitColors[unit] = colorPalette[colorIndex % colorPalette.length];
        colorIndex++;
      }
    }
  });

  return (
    // Main container div with styling
    <div className="min-h-screen flex flex-col items-center p-12 text-white">
      {/* Render the Units component when on the "units" tab */}
      {tab === "units" && (
        <Units
          courseList={courseList}
          setCourseList={setCourseList}
          setTab={setTab}
          setError={setError}
          error={error}
          unitColors={unitColors}
        />
      )}

      {/* Render the Preferences component when on the "preferences" tab */}
      {tab === "preferences" && (
        <Preferences
          courseList={courseList}      // Passed as part of TimetableViewProps
          preferences={preferences}     // Pass the entire preferences object
          setPreferences={setPreferences} // Pass the setter function
          setTab={setTab}
          unitColors={unitColors}       // Passed as part of TimetableViewProps
        />
      )}

      {/* Render the TimetableView component when on the "timetable" tab */}
      {tab === "timetable" && (
        <TimetableView
          courseList={courseList}
          preferences={preferences}
          setTab={setTab}
          unitColors={unitColors}
        />
      )}
    </div>
  );
}