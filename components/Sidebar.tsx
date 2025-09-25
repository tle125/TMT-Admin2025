import React from 'react';
import type { ViewType } from '../App';
import { UsersIcon, CalendarDaysIcon, ClipboardCheckIcon, XIcon } from '../constants';
import { useLocalization } from '../contexts/LocalizationContext';

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150";
  const activeClasses = "bg-indigo-100 text-indigo-700";
  const inactiveClasses = "text-slate-600 hover:bg-slate-200 hover:text-slate-800";
  
  return (
    <li>
      <button
        onClick={onClick}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, setIsOpen }) => {
  const { t } = useLocalization();

  const sidebarClasses = `
    w-64 bg-white flex-shrink-0 border-r border-slate-200 flex flex-col
    transform transition-transform duration-300 ease-in-out
    md:relative md:translate-x-0
    fixed inset-y-0 left-0 z-30
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;
  
  return (
    <aside className={sidebarClasses}>
       <div className="h-16 flex-shrink-0 px-6 flex items-center justify-between border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">{t('menu')}</h2>
            <button 
                className="md:hidden p-1 text-slate-400 hover:text-slate-600"
                onClick={() => setIsOpen(false)}
                aria-label="Close sidebar"
            >
                <XIcon />
            </button>
        </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <NavItem
            label={t('shiftScheduler')}
            icon={<CalendarDaysIcon className="h-5 w-5" />}
            isActive={activeView === 'scheduler'}
            onClick={() => onNavigate('scheduler')}
          />
          <NavItem
            label={t('attendance.title')}
            icon={<ClipboardCheckIcon className="h-5 w-5" />}
            isActive={activeView === 'attendance'}
            onClick={() => onNavigate('attendance')}
          />
          <NavItem
            label={t('attendanceCalendar.title')}
            icon={<CalendarDaysIcon className="h-5 w-5" />}
            isActive={activeView === 'attendance_calendar'}
            onClick={() => onNavigate('attendance_calendar')}
          />
          <NavItem
            label={t('employeeInformation')}
            icon={<UsersIcon className="h-5 w-5" />}
            isActive={activeView === 'employees'}
            onClick={() => onNavigate('employees')}
          />
        </ul>
      </nav>
    </aside>
  );
};