import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Pill } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: logs, isLoading } = useQuery(
    ['medication-logs', format(selectedDate, 'yyyy-MM-dd')],
    () => apiService.getMedicationLogs(format(selectedDate, 'yyyy-MM-dd')),
    { enabled: !!selectedDate }
  );

  const { data: medications } = useQuery('medications', apiService.getMedications);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getLogsForDate = (date) => {
    if (!logs) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs.filter(log => 
      format(parseISO(log.taken_at), 'yyyy-MM-dd') === dateStr
    );
  };

  const getDayStatus = (date) => {
    const dayLogs = getLogsForDate(date);
    if (dayLogs.length === 0) return 'none';
    
    const taken = dayLogs.filter(log => log.status === 'taken').length;
    const total = dayLogs.length;
    
    if (taken === total) return 'complete';
    if (taken > 0) return 'partial';
    return 'missed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
        <p className="text-gray-600">Track your medication adherence over time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {monthDays.map((date) => {
                const status = getDayStatus(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isTodayDate = isToday(date);
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      p-3 text-sm rounded-lg border-2 transition-all hover:shadow-md
                      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${isTodayDate ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                      ${isSelected ? 'ring-2 ring-blue-600' : ''}
                      ${getStatusColor(status)}
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`font-medium ${isTodayDate ? 'font-bold' : ''}`}>
                        {format(date, 'd')}
                      </span>
                      {status !== 'none' && (
                        <div className="mt-1">
                          {status === 'complete' && <CheckCircle2 className="h-3 w-3" />}
                          {status === 'partial' && <Clock className="h-3 w-3" />}
                          {status === 'missed' && <XCircle className="h-3 w-3" />}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span className="text-gray-600">All taken</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                <span className="text-gray-600">Partially taken</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                <span className="text-gray-600">Missed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                <span className="text-gray-600">No data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {format(selectedDate, 'MMMM dd, yyyy')}
            </h3>

            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : logs && logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        log.status === 'taken' ? 'bg-green-100' : 
                        log.status === 'missed' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Pill className={`h-4 w-4 ${
                          log.status === 'taken' ? 'text-green-600' : 
                          log.status === 'missed' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{log.medication_name}</p>
                        <p className="text-sm text-gray-600">{log.dosage}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'taken' ? 'bg-green-100 text-green-800' :
                      log.status === 'missed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No medication logs for this date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;