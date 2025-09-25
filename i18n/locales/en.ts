export const en = {
  // General
  searchPlaceholder: "Search by name, ID...",
  searchPlaceholderScheduling: "Search to filter employees for scheduling...",
  all: "All",
  uncategorized: "Uncategorized",
  loadingEmployeeData: "Loading Employee Data...",
  error: "Error",
  noEmployeesFound: "No employees found.",
  viewDetails: "View Details",
  saving: "Saving...",
  save: "Save",
  cancel: "Cancel",
  close: "Close",
  remove: "Remove",

  // Header & Sidebar
  employeeDashboard: "Employee Dashboard",
  menu: "Menu",
  shiftScheduler: "Shift Scheduler",
  employeeInformation: "Employee Information",

  // Employee Info View
  employeeInformationTitle: "Employee Information",
  employeeInformationDescription: "Search and browse employee details.",
  
  // Scheduler View
  saveSchedule: "Save Schedule",
  scheduleSavedSuccessfully: "Schedule saved successfully!",
  loadingSchedule: "Loading schedule...",
  weekNavigator: {
    previousWeek: "Previous week",
    nextWeek: "Next week",
  },
  
  // Overtime
  overtime: {
    addOt: "Add OT",
    modalTitle: "Manage Overtime for {employeeName}",
    shift: "Shift",
    otStartTime: "OT Start Time",
    otEndTime: "OT End Time",
    selectTime: "Select Time...",
    noOt: "No Overtime",
  },

  // Attendance View
  attendance: {
    title: "Check Attendance",
    save: "Save Attendance",
    loading: "Loading attendance data...",
    noEmployeesScheduled: "No employees scheduled for this day.",
    statusHeader: "Status",
    reasonHeader: "Reason",
    reasonPlaceholder: "Enter reason for leave...",
    status: {
      present: "Present",
      absent: "Absent",
      not_set: "Not Set",
      leaveHeader: "Leave Types",
      sick_leave: "Sick Leave",
      personal_leave: "Personal Leave",
      vacation_leave: "Vacation",
      ordination_leave: "Ordination Leave",
      marriage_leave: "Marriage Leave",
      hajj_leave: "Hajj Leave",
      work_injury: "Work Injury",
      unpaid_leave: "Unpaid Leave",
      funeral_leave: "Funeral Leave",
      birthday_leave: "Birthday Leave",
      holiday_leave: "Saturday Off",
      work_accident: "Work Accident",
    },
    statusLegend: "Attendance status for {employeeId}",
    savedSuccess: "Attendance saved successfully!",
  },

  // Attendance Calendar View
  attendanceCalendar: {
    title: "Leave Calendar",
    loading: "Loading calendar data...",
    modalTitle: "Leave Details: {date}",
    noLeave: "No employees on leave this day.",
    leaveStatus: "Status",
    reason: "Reason",
    employee: "Employee",
    monthNavigator: {
        previousMonth: "Previous month",
        nextMonth: "Next month",
    }
  },

  // Employee Table Headers
  tableHeaderName: "Name",
  tableHeaderPosition: "Position",
  tableHeaderDepartment: "Department",
  tableHeaderSection: "Section",
  tableHeaderShiftAssignment: "Shift Assignment",
  tableHeaderActions: "Actions",

  // Shift Selector
  shiftSelector: {
    unassigned: "Unassigned",
    morning: "Morning",
    night: "Night",
    legend: "Shift for {employeeId}",
  },

  // Employee Details Modal
  employeeDetailsTitle: "Employee Details",
  updatePhotoTitle: "Update Photo",
  capture: "Capture",
  takePhoto: "Take Photo",
  uploadPhoto: "Upload Photo",
  modalLabels: {
    employeeId: "Employee ID",
    nickname: "Nickname",
    department: "Department",
    section: "Section",
    startDate: "Start Date",
    dob: "Date of Birth",
    gender: "Gender",
    religion: "Religion",
    phone: "Phone",
    emergencyContact: "Emergency Contact",
    referenceInfo: "Reference Info",
  },
  cameraErrors: {
    notSupported: "Camera API is not supported on this browser.",
    notFound: "No camera found. Please ensure a camera is connected.",
    notAllowed: "Camera access denied. Please grant permission in browser settings.",
    notReadable: "The camera is currently in use by another application.",
    generic: "Could not access camera: {message}. Please check permissions.",
    unknown: "An unknown camera error occurred.",
    saveFailed: "Could not save the new photo. Please check your connection and try again.",
    uploadFailed: "Could not save the uploaded photo. Please try again.",
    fileReadFailed: "Failed to read the selected file.",
    invalidFileType: "Please select a valid image file.",
  },
  
  // Confirmation
  unsavedChangesConfirmation: "You have unsaved changes that will be lost. Continue?",
};