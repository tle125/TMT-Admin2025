import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';
import { useLocalization } from '../contexts/LocalizationContext';

interface WeekNavigatorProps {
  currentDate: Date;
  onWeekChange: (newDate: Date) => void;
}

const getWeekStart = (date: Date): Date => {
  const d = new Date(date); // Clone to avoid modifying the original date
  const day = d.getDay(); // Sunday = 0, Monday = 1, etc.
  // Adjust logic to set Monday as the first day of the week
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0); // Set to midnight in the local timezone
  return weekStart;
};

const getWeekDisplayString = (startDate: Date, locale: string): string => {
    // startDate is now a local date object, representing midnight.
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startString = startDate.toLocaleDateString(locale, options);
    const endString = end.toLocaleDateString(locale, { ...options, year: 'numeric' });
    
    return `${startString} - ${endString}`;
};

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({ currentDate, onWeekChange }) => {
  const { t, language } = useLocalization();
  const weekStart = getWeekStart(currentDate);

  const handlePreviousWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() - 7);
    onWeekChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + 7);
    onWeekChange(newDate);
  };
  
  const locale = language === 'th' ? 'th-TH' : 'en-US';

  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-4">
      <button 
        onClick={handlePreviousWeek} 
        className="p-2 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label={t('weekNavigator.previousWeek')}
      >
        <ChevronLeftIcon />
      </button>
      <div className="text-base md:text-lg font-semibold text-slate-700 w-56 md:w-64 text-center">
        {getWeekDisplayString(weekStart, locale)}
      </div>
      <button 
        onClick={handleNextWeek} 
        className="p-2 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label={t('weekNavigator.nextWeek')}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};