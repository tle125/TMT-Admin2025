import React from 'react';
import type { Employee, ShiftAssignmentsMap, AttendanceMap, AttendanceStatus, AttendanceRecord } from '../types';
import { isLeaveStatus } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { EmployeeImage } from '../components/EmployeeImage';

interface AttendanceViewProps {
  date: Date;
  scheduledEmployees: Employee[];
  shiftAssignments: ShiftAssignmentsMap;
  attendanceData: AttendanceMap;
  onAttendanceChange: (employeeId: string, record: Partial<AttendanceRecord>) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  saveMessage: string;
  onViewDetails: (employee: Employee) => void;
}

const AttendanceStatusSelector: React.FC<{
  employeeId: string;
  currentStatus: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
}> = ({ employeeId, currentStatus, onChange }) => {
  const { t } = useLocalization();

  const leaveTypeKeys: AttendanceStatus[] = [
    'sick_leave', 'personal_leave', 'vacation_leave', 'ordination_leave', 
    'marriage_leave', 'hajj_leave', 'work_injury', 'work_accident', 'unpaid_leave', 
    'funeral_leave', 'birthday_leave', 'holiday_leave'
  ];

  const leaveTypes = leaveTypeKeys.map(key => ({
    value: key,
    label: t(`attendance.status.${key as 'sick_leave'}`) // Cast for type safety
  }));

  return (
    <select
      id={`status-${employeeId}`}
      name={`status-${employeeId}`}
      value={currentStatus}
      onChange={(e) => onChange(e.target.value as AttendanceStatus)}
      className="block w-full max-w-[220px] pl-3 pr-10 py-2 text-base bg-white border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      aria-label={t('attendance.statusLegend', { employeeId })}
    >
      <option value="not_set">{t('attendance.status.not_set')}</option>
      <option value="present">{t('attendance.status.present')}</option>
      <option value="absent">{t('attendance.status.absent')}</option>
      <optgroup label={t('attendance.status.leaveHeader')}>
        {leaveTypes.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </optgroup>
    </select>
  );
};


export const AttendanceView: React.FC<AttendanceViewProps> = ({
  date,
  scheduledEmployees,
  shiftAssignments,
  attendanceData,
  onAttendanceChange,
  onSave,
  isDirty,
  isSaving,
  isLoading,
  saveMessage,
  onViewDetails,
}) => {
  const { t, language } = useLocalization();
  const locale = language === 'th' ? 'th-TH' : 'en-US';
  const displayDate = date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-10 text-slate-500">{t('attendance.loading')}</div>
      );
    }
    if (scheduledEmployees.length === 0) {
      return (
        <div className="text-center py-10 text-slate-500">{t('attendance.noEmployeesScheduled')}</div>
      );
    }
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderName')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderShiftAssignment')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('attendance.statusHeader')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('attendance.reasonHeader')}</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('tableHeaderActions')}</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {scheduledEmployees.map((employee) => {
                  const assignment = shiftAssignments[employee.employeeId];
                  const shift = assignment ? assignment.shift : 'unassigned';
                  const shiftText = shift === 'morning' ? t('shiftSelector.morning') : t('shiftSelector.night');
                  const currentRecord = attendanceData[employee.employeeId] || { status: 'present', reason: '' };
                  const showReasonInput = isLeaveStatus(currentRecord.status);
                  
                  return (
                    <tr key={employee.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                             <EmployeeImage photoId={employee.photoId} fullName={employee.fullName} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{employee.fullName}</div>
                            <div className="text-sm text-slate-500">{employee.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{shiftText}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AttendanceStatusSelector
                          employeeId={employee.employeeId}
                          currentStatus={currentRecord.status}
                          onChange={(status) => onAttendanceChange(employee.employeeId, { status })}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {showReasonInput && (
                           <input
                              type="text"
                              placeholder={t('attendance.reasonPlaceholder')}
                              value={currentRecord.reason}
                              onChange={(e) => onAttendanceChange(employee.employeeId, { reason: e.target.value })}
                              className="block w-full max-w-[220px] bg-white border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => onViewDetails(employee)} className="text-indigo-600 hover:text-indigo-900">{t('viewDetails')}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
    );
  };

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t('attendance.title')}</h2>
          <p className="text-sm text-slate-600">{displayDate}</p>
        </div>
        <div className="flex items-center space-x-3">
          {saveMessage && <span className="text-sm text-green-600">{saveMessage}</span>}
          <button
            onClick={onSave}
            disabled={!isDirty || isSaving || isLoading}
            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isSaving ? t('saving') : t('attendance.save')}
          </button>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};