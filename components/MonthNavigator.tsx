import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';
import { useLocalization } from '../contexts/LocalizationContext';

interface MonthNavigatorProps {
  currentDate: Date;
  onMonthChange: (newDate: Date) => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentDate, onMonthChange }) => {
  const { t, language } = useLocalization();
  const locale = language === 'th' ? 'th-TH' : 'en-US';

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const displayMonth = currentDate.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-4">
      <button 
        onClick={handlePreviousMonth} 
        className="p-2 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label={t('attendanceCalendar.monthNavigator.previousMonth')}
      >
        <ChevronLeftIcon />
      </button>
      <div className="text-base md:text-lg font-semibold text-slate-700 w-40 text-center">
        {displayMonth}
      </div>
      <button 
        onClick={handleNextMonth} 
        className="p-2 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label={t('attendanceCalendar.monthNavigator.nextMonth')}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};