import React, { useState, useMemo } from 'react';
import type { MonthlyAttendanceData, AttendanceRecordWithDetails } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { MonthNavigator } from '../components/MonthNavigator';
import { XIcon } from '../constants';

const DayDetailModal: React.FC<{
    selectedDate: Date | null;
    records: AttendanceRecordWithDetails[];
    onClose: () => void;
}> = ({ selectedDate, records, onClose }) => {
    const { t, language } = useLocalization();
    const locale = language === 'th' ? 'th-TH' : 'en-US';

    if (!selectedDate) return null;

    const formattedDate = selectedDate.toLocaleDateString(locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                        <h2 id="modal-title" className="text-lg font-bold text-slate-800">
                           {t('attendanceCalendar.modalTitle', { date: formattedDate })}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            aria-label="Close modal"
                        >
                            <XIcon />
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto">
                    {records.length > 0 ? (
                         <div className="space-y-4">
                            {records.map(record => (
                                <div key={record.employeeId} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <p className="font-semibold text-slate-900">{record.fullName}</p>
                                    <p className="text-sm text-slate-600">
                                        <span className="font-medium">{t('attendanceCalendar.leaveStatus')}:</span> {t(`attendance.status.${record.status as 'sick_leave'}`)}
                                    </p>
                                    {record.reason && (
                                        <p className="text-sm text-slate-600 mt-1">
                                            <span className="font-medium">{t('attendanceCalendar.reason')}:</span> {record.reason}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-8">{t('attendanceCalendar.noLeave')}</p>
                    )}
                </div>
                 <div className="p-4 border-t border-slate-200 bg-slate-50 text-right rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                    >
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface AttendanceCalendarViewProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
  attendanceData: MonthlyAttendanceData;
  isLoading: boolean;
}

export const AttendanceCalendarView: React.FC<AttendanceCalendarViewProps> = ({
  currentMonth,
  onMonthChange,
  attendanceData,
  isLoading,
}) => {
  const { t } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Adjust to start the week on Monday
    const dayOfWeek = startDate.getDay(); // Sunday: 0, Monday: 1
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diff);

    const grid = [];
    for (let i = 0; i < 6; i++) { // 6 weeks to cover all possibilities
      const week = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(startDate);
        week.push(date);
        startDate.setDate(startDate.getDate() + 1);
      }
      grid.push(week);
      if (startDate > lastDay) break;
    }
    return grid;
  }, [currentMonth]);
  
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedDayRecords = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return attendanceData[dateKey] || [];
  }, [selectedDate, attendanceData]);

  const renderCalendar = () => {
    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    return (
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-slate-600 mb-2">
          {weekDays.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarGrid.flat().map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const records = attendanceData[dateKey] || [];
            
            return (
              <div
                key={index}
                onClick={() => isCurrentMonth && handleDayClick(date)}
                className={`h-28 p-2 border border-slate-200 rounded-md flex flex-col overflow-hidden ${isCurrentMonth ? 'bg-white hover:bg-slate-50 cursor-pointer' : 'bg-slate-100 text-slate-400'}`}
              >
                <span className={`font-bold ${isCurrentMonth ? 'text-slate-800' : ''}`}>{date.getDate()}</span>
                {isCurrentMonth && records.length > 0 && (
                   <div className="mt-1 text-xs text-left space-y-0.5 overflow-y-auto">
                      {records.map(r => (
                          <div key={r.employeeId} className="bg-red-100 text-red-800 rounded px-1.5 py-0.5 truncate">
                              {r.fullName.split(' ')[0]}
                          </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
       <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t('attendanceCalendar.title')}</h2>
        </div>
        <MonthNavigator currentDate={currentMonth} onMonthChange={onMonthChange} />
      </div>
      
      {isLoading ? (
        <div className="text-center py-10 text-slate-500">{t('attendanceCalendar.loading')}</div>
      ) : renderCalendar()}

      <DayDetailModal 
        selectedDate={selectedDate}
        records={selectedDayRecords}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
};
