// Fix: Declare Google Apps Script global variables to resolve TypeScript errors.
declare const Utilities: any;
declare const DriveApp: any;
declare const SpreadsheetApp: any;
declare const ContentService: any;
declare const Logger: any;

// Main Sheet Constants
const SPREADSHEET_ID = '1fCXrmMK7Y8OXVLqxKWsHIX8-xkRYVBKWm4o44ulVBH4';
const EMPLOYEE_SHEET_NAME = 'ข้อมูลพนักงาน';
const DRIVE_FOLDER_ID = '1_0Mt3Imhz0wg2-q8PaBXKWVwTe8Kxtjr';
const PHOTO_ID_COLUMN_NAME = 'ลิ้งค์รูปถ่าย';
const EMPLOYEE_ID_COLUMN_NAME = 'รหัสพนักงาน';

// Schedule Sheet Constants
const SCHEDULE_SHEET_NAME = 'ตารางกะ'; // "Shift Schedule"
const SCHEDULE_COL_EMPLOYEE_ID = 'รหัสพนักงาน';
const SCHEDULE_COL_FULL_NAME = 'ชื่อ-สกุล';
const SCHEDULE_COL_SECTION = 'ส่วนงาน';
const SCHEDULE_COL_WEEK = 'สัปดาห์ที่เข้ากะ';
const SCHEDULE_COL_SHIFT_TYPE = 'ประเภทกะ';
const SCHEDULE_COL_OT_END_TIME = 'เวลาสิ้นสุด OT';

// Attendance Sheet Constants
const ATTENDANCE_SHEET_NAME = 'บันทึกเวลาทำงาน'; // "Attendance Log"
const ATTENDANCE_COL_EMPLOYEE_ID = 'รหัสพนักงาน';
const ATTENDANCE_COL_FULL_NAME = 'ชื่อ-สกุล';
const ATTENDANCE_COL_DATE = 'วันที่';
const ATTENDANCE_COL_SHIFT_TYPE = 'กะที่เข้า';
const ATTENDANCE_COL_STATUS = 'สถานะ';
const ATTENDANCE_COL_REASON = 'เหตุผล'; // New column for leave reason

// Status mapping for translation between frontend keys and sheet values
const STATUS_KEY_TO_THAI = {
  present: 'มาทำงาน',
  absent: 'ขาด',
  sick_leave: 'ลาป่วย',
  personal_leave: 'ลากิจ',
  vacation_leave: 'ลาพักร้อน',
  ordination_leave: 'ลาอุปสมบท/บวช',
  marriage_leave: 'ลาแต่งงาน',
  hajj_leave: 'ลาไปประกอบพิธีฮัจย์',
  work_injury: 'เจ็บป่วยเนื่องจากการทำงาน',
  unpaid_leave: 'พักงานไม่ได้รับค่าจ้าง',
  funeral_leave: 'ลาฌาปนกิจ',
  birthday_leave: 'ลาวันคล้ายวันเกิด',
  holiday_leave: 'หยุดวันเสาร์',
  work_accident: 'อุบัติเหตุในงาน',
};

const THAI_TO_STATUS_KEY = Object.fromEntries(
  Object.entries(STATUS_KEY_TO_THAI).map(([key, value]) => [value, key])
);

// Helper to get a sheet and its headers
function getSheetAndHeaders(sheetName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet with name "${sheetName}" not found.`);
  }
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return { sheet, headers };
}

/**
 * Handles GET requests. Used to fetch schedules or attendance.
 */
function doGet(e) {
  try {
    const { action } = e.parameter;

    if (action === 'getSchedule') {
      return handleGetSchedule(e.parameter);
    }
    
    if (action === 'getAttendance') {
      return handleGetAttendance(e.parameter);
    }

    if (action === 'getAttendanceForMonth') {
      return handleGetAttendanceForMonth(e.parameter);
    }

    throw new Error("Invalid or missing 'action' parameter.");

  } catch (error) {
    Logger.log(`Error in doGet: ${error.toString()}`);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleGetSchedule({ weekStartDate }) {
  if (!weekStartDate) throw new Error("Missing 'weekStartDate' parameter.");
  
  const { sheet, headers } = getSheetAndHeaders(SCHEDULE_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const timezone = SpreadsheetApp.openById(SPREADSHEET_ID).getSpreadsheetTimeZone();
  
  const colIndices = {
    week: headers.indexOf(SCHEDULE_COL_WEEK),
    employeeId: headers.indexOf(SCHEDULE_COL_EMPLOYEE_ID),
    shiftType: headers.indexOf(SCHEDULE_COL_SHIFT_TYPE),
    otEndTime: headers.indexOf(SCHEDULE_COL_OT_END_TIME)
  };
  if (Object.values(colIndices).slice(0, 3).some(index => index === -1)) { // otEndTime can be missing
    throw new Error("One or more required columns are missing in the schedule sheet.");
  }

  const schedule = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowWeekValue = row[colIndices.week];
    if (!rowWeekValue) continue;

    const rowWeek = Utilities.formatDate(new Date(rowWeekValue), "UTC", "yyyy-MM-dd");
    
    if (rowWeek === weekStartDate) {
      const employeeId = row[colIndices.employeeId];
      const shiftTypeRaw = row[colIndices.shiftType];
      let shiftType = shiftTypeRaw === 'กะเช้า' ? 'morning' : (shiftTypeRaw === 'กะดึก' ? 'night' : 'unassigned');
      
      let otEndTime = null;
      const otValue = row[colIndices.otEndTime];
      if (colIndices.otEndTime !== -1 && otValue) {
          if (otValue instanceof Date) {
              otEndTime = Utilities.formatDate(otValue, timezone, "HH:mm");
          } else {
              otEndTime = String(otValue).trim();
          }
      }

      if (employeeId) {
        schedule[employeeId] = {
            shift: shiftType,
            otEndTime: otEndTime || null
        };
      }
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, schedule: schedule }))
    .setMimeType(ContentService.MimeType.JSON);
}


function handleGetAttendance({ date }) {
    if (!date) throw new Error("Missing 'date' parameter.");

    const { sheet, headers } = getSheetAndHeaders(ATTENDANCE_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const colIndices = {
        date: headers.indexOf(ATTENDANCE_COL_DATE),
        employeeId: headers.indexOf(ATTENDANCE_COL_EMPLOYEE_ID),
        status: headers.indexOf(ATTENDANCE_COL_STATUS),
        reason: headers.indexOf(ATTENDANCE_COL_REASON), // Get index for the new reason column
    };
    if (Object.values(colIndices).some((idx, i) => idx === -1 && i < 3)) { // reason can be missing
        throw new Error("One or more required columns are missing in the attendance sheet.");
    }
    
    const attendance = {};
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowDateValue = row[colIndices.date];
        if (!rowDateValue) continue;

        const rowDate = Utilities.formatDate(new Date(rowDateValue), "UTC", "yyyy-MM-dd");
        if (rowDate === date) {
            const employeeId = row[colIndices.employeeId];
            const statusRaw = row[colIndices.status];
            const status = THAI_TO_STATUS_KEY[statusRaw] || 'not_set';
            const reason = colIndices.reason > -1 ? row[colIndices.reason] || '' : '';
            
            if (employeeId) {
              attendance[employeeId] = { status, reason };
            }
        }
    }

    return ContentService
        .createTextOutput(JSON.stringify({ success: true, attendance }))
        .setMimeType(ContentService.MimeType.JSON);
}

function handleGetAttendanceForMonth({ year, month }) {
    if (!year || !month) throw new Error("Missing 'year' or 'month' parameters.");

    const targetYear = parseInt(year, 10);
    const targetMonth = parseInt(month, 10) - 1; // Month is 0-indexed in JS Date

    const { sheet, headers } = getSheetAndHeaders(ATTENDANCE_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const colIndices = {
        date: headers.indexOf(ATTENDANCE_COL_DATE),
        employeeId: headers.indexOf(ATTENDANCE_COL_EMPLOYEE_ID),
        fullName: headers.indexOf(ATTENDANCE_COL_FULL_NAME),
        status: headers.indexOf(ATTENDANCE_COL_STATUS),
        reason: headers.indexOf(ATTENDANCE_COL_REASON),
    };
    if (Object.values(colIndices).some((idx) => idx === -1)) {
        throw new Error("One or more required columns are missing in the attendance sheet.");
    }
    
    const monthlyAttendance = {};
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowDateValue = row[colIndices.date];
        if (!rowDateValue) continue;

        const recordDate = new Date(rowDateValue);
        
        if (recordDate.getUTCFullYear() === targetYear && recordDate.getUTCMonth() === targetMonth) {
            const dateStr = Utilities.formatDate(recordDate, "UTC", "yyyy-MM-dd");
            const statusRaw = row[colIndices.status];
            const status = THAI_TO_STATUS_KEY[statusRaw];
            
            // Only include non-present records for the calendar view
            if (status && status !== 'present' && status !== 'not_set') {
                if (!monthlyAttendance[dateStr]) {
                    monthlyAttendance[dateStr] = [];
                }
                monthlyAttendance[dateStr].push({
                    employeeId: row[colIndices.employeeId],
                    fullName: row[colIndices.fullName],
                    status: status,
                    reason: row[colIndices.reason] || ''
                });
            }
        }
    }

    return ContentService
        .createTextOutput(JSON.stringify({ success: true, attendance: monthlyAttendance }))
        .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Handles POST requests. Can save photos, schedules, or attendance.
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { action } = payload;

    if (action === 'savePhoto') {
      return handleSavePhoto(payload);
    } else if (action === 'saveSchedule') {
      return handleSaveSchedule(payload);
    } else if (action === 'saveAttendance') {
      return handleSaveAttendance(payload);
    } else {
      throw new Error("Invalid or missing 'action' in the request body.");
    }
  } catch (error) {
    Logger.log(`Error in doPost: ${error.toString()}`);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleSavePhoto({ employeeId, imageData }) {
  if (!employeeId || !imageData) {
    throw new Error("Missing 'employeeId' or 'imageData' for savePhoto action.");
  }
  
  const { sheet, headers } = getSheetAndHeaders(EMPLOYEE_SHEET_NAME);

  const employeeIdColumnIndex = headers.indexOf(EMPLOYEE_ID_COLUMN_NAME);
  const photoColumnIndex = headers.indexOf(PHOTO_ID_COLUMN_NAME);

  if (employeeIdColumnIndex === -1) {
    throw new Error(`Column "${EMPLOYEE_ID_COLUMN_NAME}" not found in the sheet.`);
  }
  if (photoColumnIndex === -1) {
    throw new Error(`Column "${PHOTO_ID_COLUMN_NAME}" not found in the sheet.`);
  }

  const employeeIdColumnValues = sheet.getRange(2, employeeIdColumnIndex + 1, sheet.getLastRow() - 1, 1).getValues();
  let employeeRow = -1;
  for (let i = 0; i < employeeIdColumnValues.length; i++) {
    if (String(employeeIdColumnValues[i][0]) === String(employeeId)) {
      employeeRow = i + 2;
      break;
    }
  }
  
  if (employeeRow === -1) {
    throw new Error(`Employee with ID "${employeeId}" not found.`);
  }
  
  const [meta, base64] = imageData.split(',');
  if (!meta || !base64) {
    throw new Error("Invalid image data format.");
  }
  const contentType = meta.split(';')[0].split(':')[1];
  const decodedImage = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(decodedImage, contentType, `employee_photo_${employeeId}_${new Date().getTime()}.png`);
  
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const newFile = folder.createFile(blob);
  const newPhotoId = newFile.getId();

  sheet.getRange(employeeRow, photoColumnIndex + 1).setValue(newPhotoId);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, photoId: newPhotoId }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSaveSchedule({ weekStartDate, assignments }) {
  if (!weekStartDate || !assignments) {
    throw new Error("Missing 'weekStartDate' or 'assignments' for saveSchedule action.");
  }

  const { sheet: employeeSheet, headers: employeeHeaders } = getSheetAndHeaders(EMPLOYEE_SHEET_NAME);
  const employeeData = employeeSheet.getDataRange().getValues();
  const employeeIdColIdx = employeeHeaders.indexOf(EMPLOYEE_ID_COLUMN_NAME);
  const fullNameColIdx = employeeHeaders.indexOf('ชื่อ-สกุล');
  const sectionColIdx = employeeHeaders.indexOf('ส่วนงาน');
  
  const employeeDetailsMap = {};
  for(let i = 1; i < employeeData.length; i++) {
    const row = employeeData[i];
    const id = row[employeeIdColIdx];
    if (id) {
        employeeDetailsMap[id] = {
            fullName: row[fullNameColIdx],
            section: row[sectionColIdx]
        };
    }
  }

  const { sheet: scheduleSheet, headers: scheduleHeaders } = getSheetAndHeaders(SCHEDULE_SHEET_NAME);
  const scheduleData = scheduleSheet.getDataRange().getValues();
  const weekColIdx = scheduleHeaders.indexOf(SCHEDULE_COL_WEEK);
  
  const rowsToDelete = [];
  for (let i = scheduleData.length - 1; i >= 1; i--) {
    const rowWeekValue = scheduleData[i][weekColIdx];
    if (rowWeekValue) {
        const rowWeek = Utilities.formatDate(new Date(rowWeekValue), "UTC", "yyyy-MM-dd");
        if (rowWeek === weekStartDate) {
            rowsToDelete.push(i + 1);
        }
    }
  }
  rowsToDelete.forEach(rowIndex => scheduleSheet.deleteRow(rowIndex));

  const newRowsData = [];
  const headersOrder = [
      SCHEDULE_COL_EMPLOYEE_ID,
      SCHEDULE_COL_FULL_NAME,
      SCHEDULE_COL_SECTION,
      SCHEDULE_COL_WEEK,
      SCHEDULE_COL_SHIFT_TYPE,
      SCHEDULE_COL_OT_END_TIME
  ];

  for (const employeeId in assignments) {
    const assignment = assignments[employeeId];
    const shiftType = assignment.shift;
    const otEndTime = assignment.otEndTime || ''; // Use empty string if null

    if (shiftType !== 'unassigned') {
      const details = employeeDetailsMap[employeeId];
      if (details) {
        const shiftTypeThai = shiftType === 'morning' ? 'กะเช้า' : 'กะดึก';
        const row = {};
        row[SCHEDULE_COL_EMPLOYEE_ID] = employeeId;
        row[SCHEDULE_COL_FULL_NAME] = details.fullName;
        row[SCHEDULE_COL_SECTION] = details.section;
        row[SCHEDULE_COL_WEEK] = new Date(weekStartDate);
        row[SCHEDULE_COL_SHIFT_TYPE] = shiftTypeThai;
        row[SCHEDULE_COL_OT_END_TIME] = otEndTime;
        
        newRowsData.push(headersOrder.map(h => row[h] || ''));
      }
    }
  }
  
  if (newRowsData.length > 0) {
    scheduleSheet.getRange(scheduleSheet.getLastRow() + 1, 1, newRowsData.length, headersOrder.length).setValues(newRowsData);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSaveAttendance({ date, attendance }) {
    if (!date || !attendance) {
        throw new Error("Missing 'date' or 'attendance' for saveAttendance action.");
    }

    const { sheet: attendanceSheet, headers: attendanceHeaders } = getSheetAndHeaders(ATTENDANCE_SHEET_NAME);
    const data = attendanceSheet.getDataRange().getValues();
    const dateColIdx = attendanceHeaders.indexOf(ATTENDANCE_COL_DATE);

    const rowsToDelete = [];
    for (let i = data.length - 1; i >= 1; i--) {
        const rowDateValue = data[i][dateColIdx];
        if (rowDateValue) {
            const rowDate = Utilities.formatDate(new Date(rowDateValue), "UTC", "yyyy-MM-dd");
            if (rowDate === date) {
                rowsToDelete.push(i + 1);
            }
        }
    }
    rowsToDelete.forEach(rowIndex => attendanceSheet.deleteRow(rowIndex));

    // Get fresh employee details and schedule for the week of the attendance date
    const { sheet: employeeSheet, headers: employeeHeaders } = getSheetAndHeaders(EMPLOYEE_SHEET_NAME);
    const employeeData = employeeSheet.getDataRange().getValues();
    const employeeIdColIdx = employeeHeaders.indexOf(EMPLOYEE_ID_COLUMN_NAME);
    const fullNameColIdx = employeeHeaders.indexOf('ชื่อ-สกุล');
    const employeeDetailsMap = {};
    for (let i = 1; i < employeeData.length; i++) {
        const row = employeeData[i];
        const id = row[employeeIdColIdx];
        if (id) employeeDetailsMap[id] = { fullName: row[fullNameColIdx] };
    }

    const { sheet: scheduleSheet, headers: scheduleHeaders } = getSheetAndHeaders(SCHEDULE_SHEET_NAME);
    const scheduleData = scheduleSheet.getDataRange().getValues();
    const weekStartColIdx = scheduleHeaders.indexOf(SCHEDULE_COL_WEEK);
    const scheduleEmpIdColIdx = scheduleHeaders.indexOf(SCHEDULE_COL_EMPLOYEE_ID);
    const shiftTypeColIdx = scheduleHeaders.indexOf(SCHEDULE_COL_SHIFT_TYPE);
    
    // Find the start of the week for the given date. `new Date('YYYY-MM-DD')` creates a UTC date.
    const attendanceDateObj = new Date(date);
    const day = attendanceDateObj.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
    const diff = day === 0 ? -6 : 1 - day; // Calculate offset to get to the previous Monday
    attendanceDateObj.setUTCDate(attendanceDateObj.getUTCDate() + diff);
    const weekStartDate = Utilities.formatDate(attendanceDateObj, "UTC", "yyyy-MM-dd");

    const weeklyShiftMap = {};
    for (let i = 1; i < scheduleData.length; i++) {
        const row = scheduleData[i];
        const rowWeekValue = row[weekStartColIdx];
        if (rowWeekValue) {
            const rowWeekStart = Utilities.formatDate(new Date(rowWeekValue), "UTC", "yyyy-MM-dd");
            if (rowWeekStart === weekStartDate) {
                weeklyShiftMap[row[scheduleEmpIdColIdx]] = row[shiftTypeColIdx];
            }
        }
    }

    const newRows = [];
    for (const employeeId in attendance) {
        const record = attendance[employeeId];
        const statusKey = record.status;
        const reason = record.reason || '';

        if (statusKey !== 'not_set') {
            const details = employeeDetailsMap[employeeId];
            const shiftType = weeklyShiftMap[employeeId];
            if (details && shiftType) {
                const statusThai = STATUS_KEY_TO_THAI[statusKey];
                
                if (statusThai) {
                    newRows.push([
                        employeeId,
                        details.fullName,
                        new Date(date),
                        shiftType,
                        statusThai,
                        reason // Add reason to the row
                    ]);
                }
            }
        }
    }

    if (newRows.length > 0) {
        attendanceSheet.getRange(attendanceSheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    }

    return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
}