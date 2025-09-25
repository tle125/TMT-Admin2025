import type { RawEmployeeData, Employee, ShiftAssignmentsMap, AttendanceMap, MonthlyAttendanceData } from '../types';

const SHEET_ID = '1fCXrmMK7Y8OXVLqxKWsHIX8-xkRYVBKWm4o44ulVBH4';
const SHEET_NAME = 'ข้อมูลพนักงาน';
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvwzhMd5SEE8JwtlSYPXFDFMtN_AGOMo-nwBSb8yHZrD-Ml69FoHLWHB3E4y4Nbu2W/exec';

const parseCSV = (csvText: string): Record<string, string>[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines.shift()!;
  const headerRegex = /"([^"]*)"/g;
  const headers = Array.from(headerLine.matchAll(headerRegex)).map(match => match[1]);

  return lines.map(line => {
    const obj: Record<string, string> = {};
    const values = Array.from(line.matchAll(headerRegex)).map(match => match[1]);
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
};

const mapRawDataToEmployee = (rawData: RawEmployeeData): Employee => {
  return {
    id: rawData.id,
    employeeId: rawData['รหัสพนักงาน'],
    fullName: rawData['ชื่อ-สกุล'],
    position: rawData['ตำแหน่ง'],
    department: rawData['แผนก'],
    startDate: rawData['วันที่เริ่มงาน'],
    dob: rawData['วันเดือนปีเกิด'],
    section: rawData['ส่วนงาน'],
    nickname: rawData['ชื่อเล่น'],
    gender: rawData['เพศ'],
    religion: rawData['ศาสนา'],
    phone: rawData['เบอร์โทรศัพท์มือถือ'],
    emergencyContact: rawData['ชื่อ-เบอร์ติดต่อผู้อ้างอิงกรณีฉุกเฉิน'],
    referenceInfo: rawData['ข้อมูลบุคคลอ้างอิง'],
    photoId: rawData['ลิ้งค์รูปถ่าย'],
  };
};

/**
 * Formats a Date object into a "YYYY-MM-DD" string based on its local date parts,
 * ignoring time and timezone. This prevents timezone conversion errors.
 * @param date The date to format.
 * @returns The formatted date string.
 */
const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    
    if (csvText.includes('google.visualization.Query.setResponse')) {
        throw new Error("Could not retrieve data. The Google Sheet may not be public or the sheet name is incorrect. Please set sharing to 'Anyone with the link can view'.");
    }

    const jsonData = parseCSV(csvText);
    
    const rawData: RawEmployeeData[] = jsonData.map(item => ({
      ...item,
      id: parseInt(item.id, 10) || 0,
    })) as unknown as RawEmployeeData[];

    const validData = rawData.filter(item => item && item.id && item['รหัสพนักงาน']);

    return validData.map(mapRawDataToEmployee);
  } catch (error) {
    console.error("Failed to fetch employee data:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not retrieve employee data. Please check the network connection.");
  }
};

export const fetchScheduleForWeek = async (weekStartDate: Date): Promise<ShiftAssignmentsMap> => {
    const dateString = formatDateToYYYYMMDD(weekStartDate);
    const url = `${SCRIPT_URL}?action=getSchedule&weekStartDate=${dateString}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch schedule from server.');
        }
        return result.schedule;
    } catch (error) {
        console.error("Failed to fetch schedule data:", error);
        throw new Error("Could not retrieve schedule data. Please check the network connection.");
    }
};

export const saveScheduleForWeek = async (weekStartDate: Date, assignments: ShiftAssignmentsMap): Promise<void> => {
    const dateString = formatDateToYYYYMMDD(weekStartDate);
    const payload = {
        action: 'saveSchedule',
        weekStartDate: dateString,
        assignments: assignments,
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to save schedule due to a server error.');
        }
    } catch (error) {
        console.error("Failed to save schedule:", error);
        throw error;
    }
};

export const fetchAttendanceForDate = async (date: Date): Promise<AttendanceMap> => {
    const dateString = formatDateToYYYYMMDD(date);
    const url = `${SCRIPT_URL}?action=getAttendance&date=${dateString}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch attendance from server.');
        return result.attendance;
    } catch (error) {
        console.error("Failed to fetch attendance data:", error);
        throw new Error("Could not retrieve attendance data.");
    }
};

export const fetchAttendanceForMonth = async (date: Date): Promise<MonthlyAttendanceData> => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-indexed month
    const url = `${SCRIPT_URL}?action=getAttendanceForMonth&year=${year}&month=${month}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch monthly attendance from server.');
        return result.attendance;
    } catch (error) {
        console.error("Failed to fetch monthly attendance data:", error);
        throw new Error("Could not retrieve monthly attendance data.");
    }
}

export const saveAttendanceForDate = async (date: Date, attendance: AttendanceMap): Promise<void> => {
    const dateString = formatDateToYYYYMMDD(date);
    const payload = {
        action: 'saveAttendance',
        date: dateString,
        attendance,
    };
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to save attendance.');
    } catch (error) {
        console.error("Failed to save attendance:", error);
        throw error;
    }
};