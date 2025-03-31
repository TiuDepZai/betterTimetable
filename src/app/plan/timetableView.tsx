"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";

// TimetableView Component: Generates and displays the timetable based on courses and preferences
const TimetableView: React.FC<TimetableViewProps> = ({
  courseList,
  unitColors,
  preferences,
}) => {
  console.log("HI! here is the courselist:", courseList);

  return (
    <>
        <Timetable courses={courseList} unitColors={unitColors} />
    </>
  );
};

// Timetable Component: Renders the timetable grid with courses placed appropriately
interface TimetableProps {
  courses: Record<string, { unitName: string; courses: Course[] }>;
  unitColors: { [unitCode: string]: string };
}

// Constants for day names
const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI"];
const daysFullNames: { [key: string]: string } = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
};

// Format 24-hour to 12-hour time
const format12Hour = (hour: number) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${formattedHour} ${suffix}`;
};

// Parse a time string like "9AM - 11AM" into numeric start and end times
const parseTime = (timeStr: string) => {
  const [start, end] = timeStr.split(" - ").map((t) => t.trim());
  const to24Hour = (t: string) => {
    let [hourStr, modifier] = [t.slice(0, -2), t.slice(-2)];
    let [hour, min] = hourStr.split(":").map(Number);
    if (isNaN(min)) min = 0;
    hour = hour % 12;
    if (modifier.toLowerCase() === "pm") hour += 12;
    return hour + min / 60;
  };
  return { start: to24Hour(start), end: to24Hour(end) };
};

// Group courses by day and start time
const groupClassesByDay = (courses: Course[]) => {
  const timetable: { [day: string]: { [hour: number]: Course[] } } = {};
  daysOfWeek.forEach((day) => {
    timetable[day] = {};
  });
  if (!courses || courses.length === 0) {
    return timetable;
  }
  courses.forEach((course) => {
    const { start } = parseTime(course.time);
    if (!timetable[course.day][start]) {
      timetable[course.day][start] = [];
    }
    timetable[course.day][start].push(course);
  });
  return timetable;
};

const Timetable: React.FC<TimetableProps> = ({ courses, unitColors }) => {
  const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<
    { top: number; left: number } | null
  >(null);

  // Combine courses into one flat array and group them
  const allCourses = Object.values(courses).flatMap(
    (courseUnit) => courseUnit.courses
  );
  const timetable = groupClassesByDay(allCourses);

  // Time slots from 8 AM to 9 PM in half-hour increments (27 slots)
  const timeSlots = Array.from({ length: (21 - 8) * 2 + 1 }, (_, i) => 8 + i * 0.5);

  return (
    <div className="w-full overflow-x-auto">
      {/* Header row with day names */}
      <div className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_2fr] gap-2 text-white bg-blue-1400 p-4">
        <div></div>
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-bold">
            {daysFullNames[day]}
          </div>
        ))}
      </div>

      {/* Timetable grid */}
      <div className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_2fr] relative bg-white">
        {/* Time Column */}
        <div className="flex flex-col text-white relative">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="relative h-6 border-b border-blue-1400 text-white bg-blue-1400"
            >
              {Number.isInteger(time) && (
                <div className="absolute top-0 left-0 w-full text-center">
                  {format12Hour(time)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Columns for each day */}
        {daysOfWeek.map((day) => (
          <div key={day} className="relative border-l border-gray-300 overflow-visible">
            {timeSlots.map((time) => (
              <div key={time} className="relative h-6 border-b border-blue-1400">
                {timetable[day][time]?.map((course, index, arr) => {
                  const { start, end } = parseTime(course.time);
                  const duration = end - start; // Duration in hours
                  const height = duration * 3; // 1 hour = 3rem
                  const width = 100 / arr.length;
                  const leftPosition = index * width;
                  const courseColor = unitColors[course.unitCode];

                  return (
                    <div
                      key={course.id}
                      className={`absolute text-xs p-1 text-white rounded-md shadow-md cursor-pointer ${courseColor}`}
                      style={{
                        top: 0,
                        left: `${leftPosition}%`,
                        width: `${width}%`,
                        height: `${height}rem`,
                        backgroundColor: courseColor,
                        zIndex: 10,
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCourse(course);
                        setTooltipStyle({
                          top: rect.bottom + window.scrollY,
                          left: rect.left + window.scrollX,
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredCourse(null);
                        setTooltipStyle(null);
                      }}
                    >
                      {/* Always-visible summary details */}
                      <div>
                        <div>
                          <strong>{course.unitCode}</strong> - {course.activity}
                        </div>
                        <div>
                          {course.room}
                          <br />
                          {course.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Overlay grid lines */}
            <div className="absolute inset-0 grid grid-rows-[repeat(26,_1fr)] z-0">
              {timeSlots.map((_, idx) => (
                <div key={idx} className="border-b border-gray-200 h-6"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Render the tooltip via a portal so it appears on top of everything else */}
      {hoveredCourse && tooltipStyle &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: tooltipStyle.top,
              left: tooltipStyle.left,
              whiteSpace: "nowrap",
              zIndex: 9999,
            }}
            className="bg-white text-black text-xs p-2 rounded-md border border-blue-1400 shadow-lg"
          >
            <div>
              <strong>Unit:</strong> {hoveredCourse.unitName || hoveredCourse.unitCode}
            </div>
            <div>
              <strong>Class Type:</strong> {hoveredCourse.classType || "N/A"}
            </div>
            <div>
              <strong>Activity:</strong> {hoveredCourse.activity}
            </div>
            <div>
              <strong>Location:</strong> {hoveredCourse.room}
            </div>
            <div>
              <strong>Time:</strong> {hoveredCourse.time}
            </div>
            <div>
              <strong>Staff:</strong> {hoveredCourse.staff || "TBA"}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TimetableView;
