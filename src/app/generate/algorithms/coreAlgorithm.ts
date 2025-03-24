/*

Hello there! Below is the algorithm used to select 1 of each activity for each unit
Note - The output does need to be returned in the format shown underneath the printed timetable:

{ 
  IFB104: { 
    unitName: "IFB104 Building IT Systems",
    courses: {
        "id": "fb51748f-709c-4d45-b7ec-2d9023460118",
        "unitCode": "IFB104",
        "unitName": "IFB104 Building IT Systems",
        "classType": "Lecture (Week 1-13) - On Campus Class (Internal Mode)",
        "activity": "LEC",
        "day": "MON",
        "time": "02:00pm - 04:00pm",
        "room": "GP Z411",
        "teachingStaff": "Laurianne Sitbon"
    }
  },
  IFB105: { 
    unitName: "IFB105 Database Management",
    courses: {
    ...
  },

*/

import { filterByAvailability, groupActivitiesByUnit } from "./helperFunctions";
import scheduleUnits from "./recursiveFunctions";
import { CourseList, CourseTimes, FilteredCourseList, UnitDomain } from "./interfaces";



/// ----------------------------------------------------------------------------------------------------- ///
/// 
///                                      CORE FUNCTIONS
///                  these are used to directly run the filtering algorithm
///
/// ----------------------------------------------------------------------------------------------------- ///


  export default function generateSchedule(
    courseList: CourseList,
    availableTimes: { [day: string]: string[] },
  ): FilteredCourseList | null {
    ///
    /// This function generates a schedule based on selected courses and user availability.
    /// It returns a filtered list containing one timeslot per activity for each course,
    /// ensuring that selected times do not conflict with user unavailability.
    ///
    /// Inputs:
    ///   courseList - A mapping of unit codes to their corresponding course details and timeslots.
    ///   unavailableTimes - A mapping of days to arrays of times when the user is unavailable.
    /// Output:
    ///   filteredCourseList - A mapping similar to courseList but containing only the selected timeslots.
    ///
    console.log("User courseList courseList:", courseList);

    console.log("User available times:", availableTimes);
  
    // STAGE 1 --- APPLY AVAILABILITY FILTER
    const availableCourses = filterByAvailability(courseList, availableTimes);
    console.log("Here are the available timeslots", availableCourses);
  
    if (!availableCourses){
      console.warn("Unable to create a schedule within the given timeframe.");
      return null;
    }

    // STAGE 2 --- GROUP ACTIVITIES WITHIN UNITS
    const unitDomains: UnitDomain[] = groupActivitiesByUnit(availableCourses);
  
    // Debugging: Validate unitDomains
    console.log("unitDomains:", unitDomains);
    console.log("Is unitDomains an array:", Array.isArray(unitDomains));
  
    if (!Array.isArray(unitDomains)) {
      console.error("unitDomains is not an array!");
      return null;
    }
  
    // STAGE 3 --- INITIALIZE SCHEDULE DATA STRUCTURES
    const scheduledTimesPerDay: CourseTimes = {
      MON: [],
      TUE: [],
      WED: [],
      THU: [],
      FRI: [],
    };
    const finalSchedule: FilteredCourseList = {};
  
    // STAGE 4 --- RECURSIVELY SCHEDULE UNITS
    const schedulingSuccess = scheduleUnits(
      unitDomains,
      scheduledTimesPerDay,
      finalSchedule
    );
  
    // STAGE 5 --- RETURN FINAL SCHEDULE
    if (schedulingSuccess) {
      console.log("Final timetable generated:", finalSchedule);
      return finalSchedule;
    } else {
      console.warn("Unable to create a conflict-free schedule.");
      return null;
    }
  }
  


