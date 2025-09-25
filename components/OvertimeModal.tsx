import React, { useState, useEffect } from 'react';
import type { Employee, ShiftAssignment } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { XIcon } from '../constants';

interface OvertimeModalProps {
  employee: Employee | null;
  currentAssignment?: ShiftAssignment;
  onClose: () => void;
  onSave: (employeeId: string, otEndTime: string | null) => void;
}

const DetailItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-sm text-slate-900">{value}</p>
  </div>
);

export const OvertimeModal: React.FC<OvertimeModalProps> = ({ employee, currentAssignment, onClose, onSave }) => {
  const { t } = useLocalization();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentAssignment) {
      setSelectedTime(currentAssignment.otEndTime);
    }
  }, [currentAssignment]);
  
  if (!employee || !currentAssignment) return null;

  const { shift } = currentAssignment;
  const isMorningShift = shift === 'morning';

  const otOptions = isMorningShift 
    ? ["18:30", "19:00", "20:00", "20:30"]
    : ["06:30", "07:00", "07:30", "08:00", "08:30"];
  
  const handleSave = () => {
    onSave(employee.employeeId, selectedTime);
  };
  
  const handleRemove = () => {
    onSave(employee.employeeId, null);
  };
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 id="modal-title" className="text-lg font-bold text-slate-800">
              {t('overtime.modalTitle', { employeeName: employee.fullName })}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label={t('close')}
            >
              <XIcon />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label={t('overtime.shift')} value={isMorningShift ? t('shiftSelector.morning') : t('shiftSelector.night')} />
            <DetailItem label={t('overtime.otStartTime')} value={isMorningShift ? '17:30' : '05:30'} />
          </div>
          <div>
            <label htmlFor="ot-end-time" className="block text-sm font-medium text-slate-700">
              {t('overtime.otEndTime')}
            </label>
            <select
              id="ot-end-time"
              name="ot-end-time"
              value={selectedTime || ''}
              onChange={(e) => setSelectedTime(e.target.value || null)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">{t('overtime.noOt')}</option>
              {otOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 flex justify-between items-center rounded-b-lg">
           <button
            type="button"
            onClick={handleRemove}
            className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {t('remove')} OT
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
