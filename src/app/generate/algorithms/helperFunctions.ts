import { Course, CourseList, CourseTimes, FilteredCourseList } from "./interfaces";




/// ----------------------------------------------------------------------------------------------------- ///
/// 
///                              STAGE 1 - FILTER BY UNAVAILABLE TIMES
///                       will remove all timeslots outside of available times
///
/// ----------------------------------------------------------------------------------------------------- ///
export function filterByAvailability(
  courseList: CourseList,
  studyTimes: { [key: string]: string[] }
): FilteredCourseList | null {
  const filteredCourseList: FilteredCourseList = {};

  // Process each unit in the course list.
  for (const unitCode in courseList) {
    const unit = courseList[unitCode];
    console.log("Processing unit:", unit);

    // 1. Collect every distinct activity type from the original courses.
    const originalActivities: string[] = [];
    for (const course of unit.courses) {
      if (!originalActivities.includes(course.activity)) {
        originalActivities.push(course.activity);
      }
    }

    // 2. Filter courses by availability and group into their activity.
    const coursesByActivity: { [activity: string]: Course[] } = {};

    for (const course of unit.courses) {
      // Convert day abbreviation to full day name (e.g. TUE -> Tuesday)
      const fullDayName = dayMap[course.day];
      if (!fullDayName) {
        console.warn(`Unrecognized day abbreviation: ${course.day}`);
        continue;
      }

      // Get available timeslots for that day.
      const availableSlots = studyTimes[fullDayName] || [];
      if (availableSlots.length === 0) {
        continue;
      }

      // Parse the course's time range and generate its 30-minute time slots.
      const { start, end } = parseCourseTimeRangeInMinutes(course.time);
      const courseSlots = generateCourseTimeSlots(start, end);

      // Include the course if every generated timeslot exists within the available times.
      const slotsOk = courseSlots.every(slot => availableSlots.includes(slot));
      if (slotsOk) {
        if (!coursesByActivity[course.activity]) {
          coursesByActivity[course.activity] = [];
        }
        coursesByActivity[course.activity].push(course);
      }
    }

    // 3. For any activity missing a physical timeslot, try to find a virtual alternative.
    for (const activity of originalActivities) {
      if (!coursesByActivity[activity] || coursesByActivity[activity].length === 0) {
        // Look for a virtual course for this activity.
        const virtualCourses = unit.courses.filter(course =>
          course.activity === activity &&
          (course.room.startsWith("GP VIRTOLT") || course.room.startsWith("KG VIRTOLT"))
        );
        if (virtualCourses.length > 0) {
          coursesByActivity[activity] = virtualCourses;
        } else {
          // If no timeslot or fallback is available for this activity, return null.
          return null;
        }
      }
    }

    // 4. Flatten all courses (timeslots) from all activity groups into one array.
    const flattenedTimeslots: Course[] = [];
    for (const activity in coursesByActivity) {
      flattenedTimeslots.push(...coursesByActivity[activity]);
    }

    // 5. Populate the filtered course list with the unit's unitName and consolidated courses.
    filteredCourseList[unitCode] = {
      unitName: unit.unitName,
      courses: flattenedTimeslots, // Courses now represent distinct timeslots.
    };
  }

  // Return the complete filtered course list structured per unit.
  return filteredCourseList;
}



  
/// ----------------------------------------------------------------------------------------------------- ///
/// 
///                              STAGE 2 - GROUP ACTIVITIES BY UNIT
///                       will group timeslots by activity for each unit
///
/// ----------------------------------------------------------------------------------------------------- ///

export function groupActivitiesByUnit(courseList: Record<string, 
  { unitName: string; 
    courses: Course[] 
  }>): Array<{ 
    unitCode: string; 
    unitName: string; 
    activities: Array<{ 
      activityType: string; 
      courses: Course[] }> 
  }> {
  //// Function to transform the course list into an array of units with their activities and courses
  ///
  /// inputs:
  ///   courseList: Record<string, { unitName: string; courses: Course[] }>
  /// outputs:
  ///   Array<{ unitCode: string; unitName: string; activities: Array<{ activityType: string; courses: Course[] }> }>
  ///

  return Object.entries(courseList).map(([unitCode, unitData]) => {
    // Group courses by activity type (e.g., group all lectures together)
    const activityGroups = unitData.courses.reduce((groups, course) => {
      // Initialize the group if it doesn't exist, then add the course to it
      (groups[course.activity] ||= []).push(course);
      return groups;
    }, {} as Record<string, Course[]>);

    // Return the unit with its activities and corresponding courses
    return {
      unitCode,
      unitName: unitData.unitName,
      activities: Object.entries(activityGroups).map(
        ([activityType, courses]) => ({
          activityType,
          courses,
        })
      ),
    };
  });
}





/// ----------------------------------------------------------------------------------------------------- ///
/// 
///                              STAGE 3 - INITIALISE SCHEDULE DATA STRUCTYRES
///                 will initialise data structured for each day of the week along with a 
//                                 new dictionary for the final schedule
///
/// ----------------------------------------------------------------------------------------------------- ///

export function initializeScheduleData(): { 
  scheduledTimesPerDay: CourseTimes; 
  finalSchedule: FilteredCourseList } {
  ///
  /// Inputs:
  ///   None
  /// Outputs:
  ///   An object containing:
  ///     - scheduledTimesPerDay: A record of arrays representing scheduled times for each weekday.
  ///     - finalSchedule: An object to store the final schedule.
  ///

  return {
    scheduledTimesPerDay: {
      MON: [],
      TUE: [],
      WED: [],
      THU: [],
      FRI: [],
    },
    finalSchedule: {},
  };
}












  /// ----------------------------------------------------------------------------------------------------- ///
  /// 
  ///                                     OTHER HELPER FUNCTIONS
  ///                  these are used to support the main functions of our algorithm
  ///
  /// ----------------------------------------------------------------------------------------------------- ///
  
  
  export function convertTo24Hour(time12h: string): string {
      //// Helper function to convert 12-hour time to 24-hour time format
      ///
      /// inputs:
      ///   time12h: string - A string representing the time in 12-hour format (e.g., "2:30pm")
      /// outputs:
      ///   string - The corresponding time in 24-hour format (e.g., "14:30:00")
      ///
  
      const match = time12h.trim().match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
      if (!match) {
        throw new Error(`Invalid time format: ${time12h}`);
      }
  
      let [, hourStr, minuteStr, modifier] = match;
      let hours = parseInt(hourStr, 10);
      const minutes = parseInt(minuteStr, 10);
  
      if (modifier.toLowerCase() === "pm" && hours !== 12) {
        hours += 12;
      } else if (modifier.toLowerCase() === "am" && hours === 12) {
        hours = 0;
      }
  
      const hoursStr = hours.toString().padStart(2, "0");
      const minutesStr = minutes.toString().padStart(2, "0");
  
      return `${hoursStr}:${minutesStr}:00`;
  }
  
  export function parseCourseTime(timeStr: string): Date {
    //// Function to parse course time strings into Date objects
    ///
    /// inputs:
    ///   timeStr: string - A string representing the time in 12-hour format (e.g., "2:30pm")
    /// outputs:
    ///   Date - A Date object corresponding to the time on a fixed date (e.g., January 1, 1970)
    ///
  
    return new Date(`1970-01-01T${convertTo24Hour(timeStr)}`);
  }
  
  

  const dayMap: { [key: string]: string } = {
    'MON': 'Monday',
    'TUE': 'Tuesday',
    'WED': 'Wednesday',
    'THU': 'Thursday',
    'FRI': 'Friday',
    'SAT': 'Saturday',
    'SUN': 'Sunday',
  };
  
  


function parseTimeStringToMinutes(timeStr: string): number {
  // Helper function to parse time strings into minutes since midnight
  ////
  //// Function to parse time strings into minutes since midnight
  ////
  //// inputs:
  ////   timeStr: string - Time string in format "HH:MM" or "HH:MMam/pm"
  //// outputs:
  ////   number - Time in minutes since midnight
  ////

  let time = timeStr.trim();
  let isAmPm = false;
  let ampm = "";

  if (time.toLowerCase().endsWith("am") || time.toLowerCase().endsWith("pm")) {
    isAmPm = true;
    ampm = time.slice(-2).toLowerCase();
    time = time.slice(0, -2).trim();
  }

  const [hourStr, minuteStr = "0"] = time.split(":");
  let hour = parseInt(hourStr, 10);
  let minute = parseInt(minuteStr, 10);

  if (isAmPm) {
    if (ampm === "pm" && hour !== 12) {
      hour += 12;
    } else if (ampm === "am" && hour === 12) {
      hour = 0;
    }
  }

  return hour * 60 + minute;
}


function parseCourseTimeRangeInMinutes(timeRange: string): { start: number; end: number } {
  //// Function to parse course time ranges into start and end times in minutes
  ////
  //// inputs:
  ////   timeRange: string - Time range string in format "HH:MMam/pm - HH:MMam/pm"
  //// outputs:
  ////   { start: number; end: number } - Start and end times in minutes since midnight
  ////
  const [startStr, endStr] = timeRange.split("-").map((t) => t.trim());
  const start = parseTimeStringToMinutes(startStr);
  const end = parseTimeStringToMinutes(endStr);
  return { start, end };
}


function generateCourseTimeSlots(startTime: number, endTime: number): string[] {
  //// Function to generate 30-minute time slots between start and end times
  ////
  //// inputs:
  ////   startTime: number - Start time in minutes since midnight
  ////   endTime: number - End time in minutes since midnight
  //// outputs:
  ////   string[] - Array of time strings in "HH:MM" format representing 30-minute increments
  ////
  const times: string[] = [];

  // Ensure that we start from the exact start time
  let currentTime = startTime;

  while (currentTime < endTime) {
    const timeStr = formatTimeMinutesToString(currentTime);
    times.push(timeStr);
    currentTime += 30; // Increment by 30 minutes
  }

  return times;
}

function formatTimeMinutesToString(timeInMinutes: number): string {
  
  //// Function to format time in minutes to a string "HH:MM" with leading zeros
  ////
  //// inputs:
  ////   timeInMinutes: number - Time in minutes since midnight
  //// outputs:
  ////   string - Time string in "HH:MM" format
  ////
  const hour = Math.floor(timeInMinutes / 60);
  const minute = timeInMinutes % 60;
  const hourStr = hour.toString(); // Removed padStart for hours
  const minuteStr = minute.toString().padStart(2, "0"); // Keep leading zero for minutes
  return `${hourStr}:${minuteStr}`;
}
