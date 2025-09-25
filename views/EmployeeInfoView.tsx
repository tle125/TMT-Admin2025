import React from 'react';
import type { Employee } from '../types';
import { EmployeeTable } from '../components/EmployeeTable';
import { SearchIcon } from '../constants';
import { useLocalization } from '../contexts/LocalizationContext';

interface EmployeeInfoViewProps {
  employees: Employee[];
  sections: string[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onViewDetails: (employee: Employee) => void;
}

export const EmployeeInfoView: React.FC<EmployeeInfoViewProps> = ({
  employees,
  sections,
  activeSection,
  setActiveSection,
  searchTerm,
  setSearchTerm,
  onViewDetails,
}) => {
  const { t } = useLocalization();
  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-1">{t('employeeInformationTitle')}</h2>
        <p className="text-sm text-slate-600">{t('employeeInformationDescription')}</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
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

      <EmployeeTable
        mode="info"
        employees={employees}
        onViewDetails={onViewDetails}
      />
    </div>
  );
};