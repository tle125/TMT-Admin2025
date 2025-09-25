import React from 'react';
import type { Employee, ShiftAssignmentsMap, ShiftAssignment } from '../types';
import { EmployeeTable } from '../components/EmployeeTable';
import { WeekNavigator } from '../components/WeekNavigator';
import { SearchIcon } from '../constants';
import { useLocalization } from '../contexts/LocalizationContext';

interface SchedulerViewProps {
  employees: Employee[];
  sections: string[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onViewDetails: (employee: Employee) => void;
  currentWeek: Date;
  onWeekChange: (newWeek: Date) => void;
  shiftAssignments: ShiftAssignmentsMap;
  onShiftChange: (employeeId: string, assignment: ShiftAssignment) => void;
  onSaveSchedule: () => void;
  onAddOt: (employee: Employee) => void;
  isDirty: boolean;
  isSaving: boolean;
  scheduleLoading: boolean;
  saveMessage: string;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  employees,
  sections,
  activeSection,
  setActiveSection,
  searchTerm,
  setSearchTerm,
  onViewDetails,
  currentWeek,
  onWeekChange,
  shiftAssignments,
  onShiftChange,
  onSaveSchedule,
  onAddOt,
  isDirty,
  isSaving,
  scheduleLoading,
  saveMessage,
}) => {
  const { t } = useLocalization();
  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <WeekNavigator currentDate={currentWeek} onWeekChange={onWeekChange} />
        <div className="flex items-center space-x-3">
          {saveMessage && <span className="text-sm text-green-600">{saveMessage}</span>}
          <button
            onClick={onSaveSchedule}
            disabled={!isDirty || isSaving || scheduleLoading}
            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isSaving ? t('saving') : t('saveSchedule')}
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder={t('searchPlaceholderScheduling')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`${
                activeSection === section
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
              aria-current={activeSection === section ? 'page' : undefined}
            >
              {section}
            </button>
          ))}
        </nav>
      </div>

      {scheduleLoading ? (
        <div className="text-center py-10 text-slate-500">{t('loadingSchedule')}</div>
      ) : (
        <EmployeeTable
          mode="scheduling"
          employees={employees}
          onViewDetails={onViewDetails}
          shiftAssignments={shiftAssignments}
          onShiftChange={onShiftChange}
          onAddOt={onAddOt}
        />
      )}
    </div>
  );
};