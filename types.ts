export interface RawEmployeeData {
  id: number;
  'รหัสพนักงาน': string;
  'ชื่อ-สกุล': string;
  'ตำแหน่ง': string;
  'แผนก': string;
  'วันที่เริ่มงาน': string;
  'วันเดือนปีเกิด': string;
  'ส่วนงาน': string;
  'ชื่อเล่น': string;
  'เพศ': string;
  'ศาสนา':string;
  'เบอร์โทรศัพท์มือถือ': string;
  'ชื่อ-เบอร์ติดต่อผู้อ้างอิงกรณีฉุกเฉิน': string;
  'ข้อมูลบุคคลอ้างอิง': string;
  'ลิ้งค์รูปถ่าย': string;
}

export interface Employee {
  id: number;
  employeeId: string;
  fullName: string;
  position: string;
  department: string;
  startDate: string;
  dob: string;
  section: string;
  nickname: string;
  gender: string;
  religion: string;
  phone: string;
  emergencyContact: string;
  referenceInfo: string;
  photoId: string;
}

export type ShiftType = 'morning' | 'night' | 'unassigned';

export interface ShiftAssignment {
  shift: ShiftType;
  otEndTime: string | null;
}

export interface ShiftAssignmentsMap {
    [employeeId: string]: ShiftAssignment;
}

export type AttendanceStatus = 
  | 'present' 
  | 'absent' 
  | 'not_set'
  | 'sick_leave'
  | 'personal_leave'
  | 'vacation_leave'
  | 'ordination_leave'
  | 'marriage_leave'
  | 'hajj_leave'
  | 'work_injury'
  | 'unpaid_leave'
  | 'funeral_leave'
  | 'birthday_leave'
  | 'holiday_leave'
  | 'work_accident';

export interface AttendanceRecord {
  status: AttendanceStatus;
  reason: string;
}

export interface AttendanceRecordWithDetails extends AttendanceRecord {
    employeeId: string;
    fullName: string;
}

export interface MonthlyAttendanceData {
    [date: string]: AttendanceRecordWithDetails[]; // date is "YYYY-MM-DD"
}

export interface AttendanceMap {
    [employeeId: string]: AttendanceRecord;
}

export type Language = 'en' | 'th';

const ALL_LEAVE_TYPES: AttendanceStatus[] = [
    'sick_leave', 'personal_leave', 'vacation_leave', 'ordination_leave', 
    'marriage_leave', 'hajj_leave', 'work_injury', 'work_accident', 'unpaid_leave', 
    'funeral_leave', 'birthday_leave', 'holiday_leave'
];

export const isLeaveStatus = (status: AttendanceStatus): boolean => {
    return ALL_LEAVE_TYPES.includes(status);
};

export const isAbsentOrLeave = (status: AttendanceStatus): boolean => {
    return status === 'absent' || isLeaveStatus(status);
};