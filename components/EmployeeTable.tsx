import React from 'react';
import type { Employee, ShiftType, ShiftAssignmentsMap, ShiftAssignment } from '../types';
import { EmployeeImage } from './EmployeeImage';
import { useLocalization } from '../contexts/LocalizationContext';

const ShiftSelector: React.FC<{
  employeeId: string;
  currentShift: ShiftType;
  onChange: (shift: ShiftType) => void;
}> = ({ employeeId, currentShift, onChange }) => {
  const { t } = useLocalization();
  const shifts: { value: ShiftType; label: string }[] = [
    { value: 'unassigned', label: t('shiftSelector.unassigned') },
    { value: 'morning', label: t('shiftSelector.morning') },
    { value: 'night', label: t('shiftSelector.night') },
  ];

  return (
    <fieldset className="flex items-center space-x-4">
      <legend className="sr-only">{t('shiftSelector.legend', { employeeId })}</legend>
      {shifts.map(({ value, label }) => (
        <div key={value} className="flex items-center">
          <input
            id={`${employeeId}-${value}`}
            name={`shift-${employeeId}`}
            type="radio"
            value={value}
            checked={currentShift === value}
            // FIX: Use the event target's value and cast it to ShiftType to resolve type inference issues.
            onChange={(e) => onChange(e.target.value as ShiftType)}
            className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
          />
          <label htmlFor={`${employeeId}-${value}`} className="ml-2 block text-sm text-slate-700">
            {label}
          </label>
        </div>
      ))}
    </fieldset>
  );
};

type EmployeeTableInfoProps = {
  mode: 'info';
  employees: Employee[];
  onViewDetails: (employee: Employee) => void;
};

type EmployeeTableSchedulingProps = {
  mode: 'scheduling';
  employees: Employee[];
  onViewDetails: (employee: Employee) => void;
  shiftAssignments: ShiftAssignmentsMap;
  onShiftChange: (employeeId: string, assignment: ShiftAssignment) => void;
  onAddOt: (employee: Employee) => void;
};

type EmployeeTableProps = EmployeeTableInfoProps | EmployeeTableSchedulingProps;

export const EmployeeTable: React.FC<EmployeeTableProps> = (props) => {
  const { t } = useLocalization();
  const { employees, onViewDetails } = props;

  const renderTableBody = () => {
    if (employees.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="text-center py-10 text-slate-500">
            {t('noEmployeesFound')}
          </td>
        </tr>
      );
    }

    return employees.map((employee) => {
      const currentAssignment = props.mode === 'scheduling' 
        ? props.shiftAssignments[employee.employeeId] || { shift: 'unassigned', otEndTime: null }
        : { shift: 'unassigned', otEndTime: null };

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
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-slate-900">{employee.position}</div>
        </td>

        {props.mode === 'info' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{employee.department}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{employee.section}</td>
          </>
        )}

        {props.mode === 'scheduling' && (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
            <div className="flex items-center space-x-4">
              <ShiftSelector 
                employeeId={employee.employeeId}
                currentShift={currentAssignment.shift}
                onChange={(newShift) => props.onShiftChange(employee.employeeId, { ...currentAssignment, shift: newShift })}
              />
              {currentAssignment.shift !== 'unassigned' && (
                <div className="flex items-center">
                  <button 
                    onClick={() => props.onAddOt(employee)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md px-2 py-1"
                  >
                    {currentAssignment.otEndTime ? `+ OT ${currentAssignment.otEndTime}` : t('overtime.addOt')}
                  </button>
                </div>
              )}
            </div>
          </td>
        )}
        
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => onViewDetails(employee)}
            className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md px-2 py-1"
          >
            {t('viewDetails')}
          </button>
        </td>
      </tr>
      );
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderName')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderPosition')}</th>
              {props.mode === 'info' && (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderDepartment')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderSection')}</th>
                </>
              )}
              {props.mode === 'scheduling' && (
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderShiftAssignment')}</th>
              )}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t('tableHeaderActions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {renderTableBody()}
          </tbody>
        </table>
      </div>
    </div>
  );
};