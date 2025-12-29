
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { JobApplication, JobStatus, Theme } from '../types';
import { THEME_CONFIGS } from '../constants';

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b'];

interface StatsOverviewProps {
  applications: JobApplication[];
  theme?: Theme;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ applications, theme = 'light' }) => {
  const config = THEME_CONFIGS[theme];
  const statusCounts = Object.values(JobStatus).map(status => ({
    name: status,
    value: applications.filter(app => app.status === status).length
  })).filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className={`${config.card} p-6 rounded-2xl shadow-sm border ${config.border} flex flex-col items-center`}>
        <h3 className={`text-sm font-semibold ${config.subtext} mb-4 self-start`}>Application Distribution</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusCounts}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                  borderColor: theme === 'light' ? '#e2e8f0' : '#334155',
                  color: theme === 'light' ? '#1e293b' : '#f8fafc',
                  borderRadius: '12px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${config.card} p-6 rounded-2xl shadow-sm border ${config.border} lg:col-span-2`}>
        <h3 className={`text-sm font-semibold ${config.subtext} mb-4`}>Total Pipeline</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl opacity-90`} style={{ backgroundColor: `${COLORS[0]}15` }}>
            <p className="text-xs font-bold uppercase" style={{ color: COLORS[0] }}>Total</p>
            <p className={`text-2xl font-bold ${config.text}`}>{applications.length}</p>
          </div>
          <div className={`p-4 rounded-xl opacity-90`} style={{ backgroundColor: `${COLORS[1]}15` }}>
            <p className="text-xs font-bold uppercase" style={{ color: COLORS[1] }}>Applied</p>
            <p className={`text-2xl font-bold ${config.text}`}>
              {applications.filter(a => a.status === JobStatus.APPLIED).length}
            </p>
          </div>
          <div className={`p-4 rounded-xl opacity-90`} style={{ backgroundColor: `${COLORS[2]}15` }}>
            <p className="text-xs font-bold uppercase" style={{ color: COLORS[2] }}>Interviews</p>
            <p className={`text-2xl font-bold ${config.text}`}>
              {applications.filter(a => a.status === JobStatus.INTERVIEWING).length}
            </p>
          </div>
          <div className={`p-4 rounded-xl opacity-90`} style={{ backgroundColor: `${COLORS[3]}15` }}>
            <p className="text-xs font-bold uppercase" style={{ color: COLORS[3] }}>Offers</p>
            <p className={`text-2xl font-bold ${config.text}`}>
              {applications.filter(a => a.status === JobStatus.OFFER).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
