import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchEmployees, fetchScheduleForWeek, saveScheduleForWeek, fetchAttendanceForDate, saveAttendanceForDate, fetchAttendanceForMonth } from './services/employeeService';
import type { Employee, ShiftAssignmentsMap, ShiftAssignment, AttendanceMap, AttendanceRecord, MonthlyAttendanceData } from './types';
import { isLeaveStatus } from './types';
import { EmployeeDetailsModal } from './components/EmployeeDetailsModal';
import { Sidebar } from './components/Sidebar';
import { EmployeeInfoView } from './views/EmployeeInfoView';
import { SchedulerView } from './views/SchedulerView';
import { AttendanceView } from './views/AttendanceView';
import { AttendanceCalendarView } from './views/AttendanceCalendarView';
import { OvertimeModal } from './components/OvertimeModal';
import { BriefcaseIcon } from './constants';
import { useLocalization } from './contexts/LocalizationContext';
import LanguageSwitcher from './components/LanguageSwitcher';

const getWeekStart = (date: Date): Date => {
  const d = new Date(date); // Clone to avoid modifying the original date
  const day = d.getDay(); // Sunday = 0, Monday = 1, etc.
  // Adjust logic to set Monday as the first day of the week
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0); // Set to midnight in the local timezone
  return weekStart;
};

export type ViewType = 'employees' | 'scheduler' | 'attendance' | 'attendance_calendar';

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);


const App: React.FC = () => {
  const { t } = useLocalization();
  const [activeView, setActiveView] = useState<ViewType>('employees');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [otModalEmployee, setOtModalEmployee] = useState<Employee | null>(null);

  // Scheduling state
  const [currentWeek, setCurrentWeek] = useState<Date>(getWeekStart(new Date()));
  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignmentsMap>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceMap>({});
  const [attendanceSchedule, setAttendanceSchedule] = useState<ShiftAssignmentsMap>({});
  const [isAttendanceDirty, setIsAttendanceDirty] = useState<boolean>(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState<boolean>(false);
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);
  const [attendanceSaveMessage, setAttendanceSaveMessage] = useState<string>('');

  // Attendance Calendar state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendanceData>({});
  const [monthlyAttendanceLoading, setMonthlyAttendanceLoading] = useState<boolean>(false);

  // Filtering state (shared by multiple views)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('All');

  const loadEmployees = useCallback(async () => {
    if (allEmployees.length > 0) return;
    try {
      setLoading(true);
      setError(null);
      const employees = await fetchEmployees();
      setAllEmployees(employees);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching employees.");
    } finally {
      setLoading(false);
    }
  }, [allEmployees.length]);
  
  // Generic schedule loader
  const loadScheduleForWeek = useCallback(async (week: Date): Promise<ShiftAssignmentsMap> => {
    try {
      return await fetchScheduleForWeek(week);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching schedule.");
      return {};
    }
  }, []);

  // Effect for scheduler's schedule
  useEffect(() => {
    if (activeView !== 'scheduler' || allEmployees.length === 0) return;

    setScheduleLoading(true);
    loadScheduleForWeek(currentWeek).then(schedule => {
      setShiftAssignments(schedule);
      setIsDirty(false);
      setScheduleLoading(false);
    });
  }, [activeView, allEmployees.length, currentWeek, loadScheduleForWeek]);

  // Effect for attendance view's schedule and data
  useEffect(() => {
    if (activeView !== 'attendance' || allEmployees.length === 0) return;

    const weekOfAttendance = getWeekStart(attendanceDate);
    setAttendanceLoading(true);

    const fetchAllData = async () => {
      try {
        const [schedule, attendance] = await Promise.all([
          loadScheduleForWeek(weekOfAttendance),
          fetchAttendanceForDate(attendanceDate),
        ]);

        setAttendanceSchedule(schedule);

        // Set 'present' as the default for scheduled employees without an attendance record
        const processedAttendance = { ...attendance };
        const allScheduledEmployeeIds = Object.keys(schedule).filter(
          (empId) => schedule[empId] && schedule[empId].shift !== 'unassigned'
        );

        allScheduledEmployeeIds.forEach((employeeId) => {
          if (!processedAttendance[employeeId]) {
            processedAttendance[employeeId] = { status: 'present', reason: '' };
          }
        });

        setAttendanceData(processedAttendance);
        setIsAttendanceDirty(false); // Start with a clean state, no unsaved changes
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load attendance data.'
        );
      } finally {
        setAttendanceLoading(false);
      }
    };
    fetchAllData();
  }, [activeView, allEmployees.length, attendanceDate, loadScheduleForWeek]);

  // Effect for Attendance Calendar
  useEffect(() => {
    if (activeView !== 'attendance_calendar') return;
    
    setMonthlyAttendanceLoading(true);
    fetchAttendanceForMonth(calendarMonth)
      .then(data => {
        setMonthlyAttendance(data);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Could not load monthly attendance data.');
      })
      .finally(() => {
        setMonthlyAttendanceLoading(false);
      });

  }, [activeView, calendarMonth]);


  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);
  
  const sections = useMemo(() => {
    const uncategorizedLabel = t('uncategorized');
    const uniqueSections = [...new Set(allEmployees.map(e => e.section || uncategorizedLabel))];
    return [t('all'), ...uniqueSections.sort()];
  }, [allEmployees, t]);

  const filteredEmployees = useMemo(() => {
    const searched = allEmployees.filter(employee =>
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (activeSection === t('all')) return searched;
    const uncategorizedLabel = t('uncategorized');
    return searched.filter(employee => (employee.section || uncategorizedLabel) === activeSection);
  }, [allEmployees, searchTerm, activeSection, t]);
  
  useEffect(() => {
    setActiveSection(t('all'));
  }, [t]);

  // Scheduler handlers
  const handleWeekChange = (newWeek: Date) => {
    if (isDirty && !window.confirm(t('unsavedChangesConfirmation'))) return;
    setCurrentWeek(newWeek);
  };

  const handleShiftChange = (employeeId: string, assignment: ShiftAssignment) => {
    setShiftAssignments(prev => ({ ...prev, [employeeId]: assignment }));
    setIsDirty(true);
    setSaveMessage('');
  };

  const handleAddOt = (employee: Employee) => {
    const currentAssignment = shiftAssignments[employee.employeeId];

    // If there's an assignment but no OT time set yet, apply the default.
    if (currentAssignment && !currentAssignment.otEndTime) {
      let defaultOtEndTime: string | null = null;
      if (currentAssignment.shift === 'morning') {
        defaultOtEndTime = '20:30';
      } else if (currentAssignment.shift === 'night') {
        defaultOtEndTime = '08:30';
      }
      
      if (defaultOtEndTime) {
        // Update the state with the default time
        handleShiftChange(employee.employeeId, {
          ...currentAssignment,
          otEndTime: defaultOtEndTime,
        });
      }
    }
    
    // Open the modal
    setOtModalEmployee(employee);
  };

  const handleSaveOt = (employeeId: string, otEndTime: string | null) => {
    setShiftAssignments(prev => {
      const current = prev[employeeId] || { shift: 'unassigned', otEndTime: null };
      return { ...prev, [employeeId]: { ...current, otEndTime }};
    });
    setIsDirty(true);
    setSaveMessage('');
    setOtModalEmployee(null); // Close modal
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    setError(null);
    setSaveMessage('');
    try {
      await saveScheduleForWeek(currentWeek, shiftAssignments);
      setIsDirty(false);
      setSaveMessage(t('scheduleSavedSuccessfully'));
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Attendance handlers
  const scheduledForToday = useMemo(() => {
    return filteredEmployees.filter(emp => 
      attendanceSchedule[emp.employeeId] && attendanceSchedule[emp.employeeId].shift !== 'unassigned'
    );
  }, [filteredEmployees, attendanceSchedule]);

  const handleAttendanceChange = (employeeId: string, newRecord: Partial<AttendanceRecord>) => {
    setAttendanceData(prev => {
        const existingRecord = prev[employeeId] || { status: 'not_set', reason: '' };
        const updatedRecord = { ...existingRecord, ...newRecord };
        
        // If status is updated and it's not a leave status, clear the reason.
        if (newRecord.status && !isLeaveStatus(newRecord.status)) {
            updatedRecord.reason = '';
        }

        return { ...prev, [employeeId]: updatedRecord };
    });
    setIsAttendanceDirty(true);
    setAttendanceSaveMessage('');
  };

  const handleSaveAttendance = async () => {
    setIsSavingAttendance(true);
    setAttendanceSaveMessage('');
    setError(null);
    try {
        await saveAttendanceForDate(attendanceDate, attendanceData);
        setIsAttendanceDirty(false);
        setAttendanceSaveMessage(t('attendance.savedSuccess'));
        setTimeout(() => setAttendanceSaveMessage(''), 3000);
    } catch(err) {
        setError(err instanceof Error ? err.message : "Could not save attendance.");
    } finally {
        setIsSavingAttendance(false);
    }
  };

  // Modal and photo handlers
  const handleViewDetails = (employee: Employee) => setSelectedEmployee(employee);
  const handleCloseModal = () => setSelectedEmployee(null);

  const handleSaveNewPhoto = async (employee: Employee, dataUrl: string): Promise<void> => {
    const originalPhotoId = employee.photoId || '';
    const updateStateWithNewPhoto = (photoIdentifier: string) => {
      setAllEmployees(prev => prev.map(emp => emp.id === employee.id ? { ...emp, photoId: photoIdentifier } : emp));
      if (selectedEmployee?.id === employee.id) {
        setSelectedEmployee(prev => ({ ...prev!, photoId: photoIdentifier }));
      }
    };

    updateStateWithNewPhoto(dataUrl);

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzvwzhMd5SEE8JwtlSYPXFDFMtN_AGOMo-nwBSb8yHZrD-Ml69FoHLWHB3E4y4Nbu2W/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'savePhoto', employeeId: employee.employeeId, imageData: dataUrl }),
      });

      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
      const result = await response.json();
      if (result.success && result.photoId) {
        updateStateWithNewPhoto(result.photoId);
      } else {
        throw new Error(result.error || 'Failed to save photo due to a server error.');
      }
    } catch (err) {
      console.error("Failed to save photo:", err);
      updateStateWithNewPhoto(originalPhotoId);
      throw err;
    }
  };

  const renderContent = () => {
    // Show loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">{t('loading')}...</p>
          </div>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                loadEmployees();
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      );
    }
    
    const sharedFilterProps = {
        sections: sections,
        activeSection: activeSection,
        setActiveSection: setActiveSection,
        searchTerm: searchTerm,
        setSearchTerm: setSearchTerm,
    };

    switch (activeView) {
        case 'employees':
            return <EmployeeInfoView 
                {...sharedFilterProps} 
                employees={filteredEmployees} 
                onViewDetails={handleViewDetails} />;
        
        case 'scheduler':
            return (
                <SchedulerView
                  {...sharedFilterProps}
                  employees={filteredEmployees}
                  onViewDetails={handleViewDetails}
                  currentWeek={currentWeek}
                  onWeekChange={handleWeekChange}
                  shiftAssignments={shiftAssignments}
                  onShiftChange={handleShiftChange}
                  onSaveSchedule={handleSaveSchedule}
                  onAddOt={handleAddOt}
                  isDirty={isDirty}
                  isSaving={isSaving}
                  scheduleLoading={scheduleLoading}
                  saveMessage={saveMessage}
                />
            );

        case 'attendance':
            return (
                <AttendanceView
                    date={attendanceDate}
                    scheduledEmployees={scheduledForToday}
                    shiftAssignments={attendanceSchedule}
                    attendanceData={attendanceData}
                    onAttendanceChange={handleAttendanceChange}
                    onSave={handleSaveAttendance}
                    isDirty={isAttendanceDirty}
                    isSaving={isSavingAttendance}
                    isLoading={attendanceLoading}
                    saveMessage={attendanceSaveMessage}
                    onViewDetails={handleViewDetails}
                />
            );

        case 'attendance_calendar':
            return (
                <AttendanceCalendarView 
                    currentMonth={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    attendanceData={monthlyAttendance}
                    isLoading={monthlyAttendanceLoading}
                />
            );
        default:
            return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
       <Sidebar
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          setIsSidebarOpen(false); // Close sidebar on navigation
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <button
                className="md:hidden p-1 text-slate-500 rounded-md hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
               >
                <MenuIcon />
              </button>
              <BriefcaseIcon />
              <h1 className="text-2xl font-bold text-slate-900">{t('employeeDashboard')}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
             <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {renderContent()}
            </div>
        </main>
      </div>

      <EmployeeDetailsModal 
        employee={selectedEmployee} 
        onClose={handleCloseModal}
        onSaveNewPhoto={handleSaveNewPhoto}
      />

      <OvertimeModal
        employee={otModalEmployee}
        currentAssignment={otModalEmployee ? shiftAssignments[otModalEmployee.employeeId] : undefined}
        onClose={() => setOtModalEmployee(null)}
        onSave={handleSaveOt}
      />
    </div>
  );
};

export default App;