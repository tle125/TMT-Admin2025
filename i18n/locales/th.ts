export const th = {
  // General
  searchPlaceholder: "ค้นหาด้วยชื่อ, รหัส...",
  searchPlaceholderScheduling: "ค้นหาเพื่อกรองพนักงานสำหรับจัดตารางกะ...",
  all: "ทั้งหมด",
  uncategorized: "ไม่มีหมวดหมู่",
  loadingEmployeeData: "กำลังโหลดข้อมูลพนักงาน...",
  error: "ข้อผิดพลาด",
  noEmployeesFound: "ไม่พบข้อมูลพนักงาน",
  viewDetails: "ดูรายละเอียด",
  saving: "กำลังบันทึก...",
  save: "บันทึก",
  cancel: "ยกเลิก",
  close: "ปิด",
  remove: "ลบ",

  // Header & Sidebar
  employeeDashboard: "แดชบอร์ดพนักงาน",
  menu: "เมนู",
  shiftScheduler: "ตารางกะ",
  employeeInformation: "ข้อมูลพนักงาน",

  // Employee Info View
  employeeInformationTitle: "ข้อมูลพนักงาน",
  employeeInformationDescription: "ค้นหาและดูรายละเอียดพนักงาน",

  // Scheduler View
  saveSchedule: "บันทึกตารางกะ",
  scheduleSavedSuccessfully: "บันทึกตารางกะเรียบร้อยแล้ว!",
  loadingSchedule: "กำลังโหลดตารางกะ...",
  weekNavigator: {
    previousWeek: "สัปดาห์ก่อนหน้า",
    nextWeek: "สัปดาห์ถัดไป",
  },

  // Overtime
  overtime: {
    addOt: "เพิ่ม OT",
    modalTitle: "จัดการโอทีสำหรับ {employeeName}",
    shift: "กะ",
    otStartTime: "เวลาเริ่ม OT",
    otEndTime: "เวลาสิ้นสุด OT",
    selectTime: "เลือกเวลา...",
    noOt: "ไม่มีโอที",
  },

  // Attendance View
  attendance: {
    title: "เช็คชื่อพนักงาน",
    save: "บันทึกการเข้างาน",
    loading: "กำลังโหลดข้อมูลการเข้างาน...",
    noEmployeesScheduled: "ไม่มีพนักงานที่จัดกะในวันนี้",
    statusHeader: "สถานะ",
    reasonHeader: "เหตุผล",
    reasonPlaceholder: "กรอกเหตุผลการลา...",
    status: {
      present: "มาทำงาน",
      absent: "ขาด",
      not_set: "ยังไม่ระบุ",
      leaveHeader: "ประเภทการลา",
      sick_leave: "ลาป่วย",
      personal_leave: "ลากิจ",
      vacation_leave: "ลาพักร้อน",
      ordination_leave: "ลาอุปสมบท/บวช",
      marriage_leave: "ลาแต่งงาน",
      hajj_leave: "ลาไปประกอบพิธีฮัจย์",
      work_injury: "เจ็บป่วยเนื่องจากการทำงาน",
      unpaid_leave: "พักงานไม่ได้รับค่าจ้าง",
      funeral_leave: "ลาฌาปนกิจ",
      birthday_leave: "ลาวันคล้ายวันเกิด",
      holiday_leave: "หยุดวันเสาร์",
      work_accident: "อุบัติเหตุในงาน",
    },
    statusLegend: "สถานะการเข้างานสำหรับ {employeeId}",
    savedSuccess: "บันทึกการเข้างานเรียบร้อยแล้ว!",
  },

  // Attendance Calendar View
  attendanceCalendar: {
    title: "ปฏิทินการลา",
    loading: "กำลังโหลดข้อมูลปฏิทิน...",
    modalTitle: "รายละเอียดการลา: {date}",
    noLeave: "ไม่มีพนักงานลาในวันนี้",
    leaveStatus: "สถานะ",
    reason: "เหตุผล",
    employee: "พนักงาน",
    monthNavigator: {
        previousMonth: "เดือนก่อนหน้า",
        nextMonth: "เดือนถัดไป",
    }
  },

  // Employee Table Headers
  tableHeaderName: "ชื่อ",
  tableHeaderPosition: "ตำแหน่ง",
  tableHeaderDepartment: "แผนก",
  tableHeaderSection: "ส่วนงาน",
  tableHeaderShiftAssignment: "การจัดกะ",
  tableHeaderActions: "การกระทำ",

  // Shift Selector
  shiftSelector: {
    unassigned: "ไม่ระบุ",
    morning: "กะเช้า",
    night: "กะดึก",
    legend: "กะสำหรับ {employeeId}",
  },

  // Employee Details Modal
  employeeDetailsTitle: "รายละเอียดพนักงาน",
  updatePhotoTitle: "อัปเดตรูปถ่าย",
  capture: "ถ่ายภาพ",
  takePhoto: "ถ่ายรูป",
  uploadPhoto: "อัปโหลดรูป",
  modalLabels: {
    employeeId: "รหัสพนักงาน",
    nickname: "ชื่อเล่น",
    department: "แผนก",
    section: "ส่วนงาน",
    startDate: "วันที่เริ่มงาน",
    dob: "วันเกิด",
    gender: "เพศ",
    religion: "ศาสนา",
    phone: "เบอร์โทรศัพท์",
    emergencyContact: "ผู้ติดต่อฉุกเฉิน",
    referenceInfo: "ข้อมูลผู้อ้างอิง",
  },
  cameraErrors: {
    notSupported: "เบราว์เซอร์นี้ไม่รองรับ Camera API",
    notFound: "ไม่พบกล้อง กรุณาตรวจสอบการเชื่อมต่อ",
    notAllowed: "ไม่อนุญาตให้เข้าถึงกล้อง กรุณาให้สิทธิ์ในการตั้งค่าเบราว์เซอร์",
    notReadable: "กล้องกำลังถูกใช้งานโดยแอปพลิเคชันอื่น",
    generic: "ไม่สามารถเข้าถึงกล้องได้: {message} กรุณาตรวจสอบสิทธิ์",
    unknown: "เกิดข้อผิดพลาดกับกล้องที่ไม่รู้จัก",
    saveFailed: "ไม่สามารถบันทึกรูปภาพใหม่ได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง",
    uploadFailed: "ไม่สามารถบันทึกรูปภาพที่อัปโหลดได้ กรุณาลองอีกครั้ง",
    fileReadFailed: "ไม่สามารถอ่านไฟล์ที่เลือกได้",
    invalidFileType: "กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง",
  },
  
  // Confirmation
  unsavedChangesConfirmation: "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก การเปลี่ยนแปลงจะสูญหาย ดำเนินการต่อหรือไม่?",
};