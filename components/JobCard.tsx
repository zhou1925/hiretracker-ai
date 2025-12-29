
import React from 'react';
import { JobApplication, JobStatus, Theme } from '../types';
import { STATUS_COLORS, Icons, THEME_CONFIGS } from '../constants';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onSelect: (job: JobApplication) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  theme?: Theme;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete, onSelect, onDragStart, theme = 'light' }) => {
  const config = THEME_CONFIGS[theme];

  return (
    <div 
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, job.id)}
      onClick={() => onSelect(job)}
      className={`group relative ${config.card} border ${config.border} rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full active:scale-95 active:shadow-inner`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-8">
          <h3 className={`font-bold ${config.text} text-lg truncate leading-tight`}>{job.role}</h3>
          <p className={`text-sm font-medium text-${config.accent} truncate`}>{job.company}</p>
        </div>
        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${STATUS_COLORS[job.status]}`}>
          {job.status}
        </span>
      </div>

      <div className="space-y-2.5 mb-6">
        {job.location && (
          <div className={`flex items-center gap-2 text-xs ${config.subtext}`}>
            <Icons.Location />
            <span className="truncate">{job.location}</span>
          </div>
        )}

        {job.url && (
          <div className="flex items-center gap-2 text-xs">
            <div className={config.subtext}>
              <Icons.ExternalLink />
            </div>
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`text-${config.accent} hover:underline truncate font-medium`}
            >
              Application Link
            </a>
          </div>
        )}

        <div className={`flex items-center gap-2 text-xs ${config.subtext}`}>
          <Icons.Calendar />
          <span>Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
        </div>
      </div>

      {job.importantDates && job.importantDates.length > 0 && (
        <div className={`mt-auto pt-4 border-t ${config.border} space-y-2 opacity-80`}>
          <p className={`text-[10px] font-bold ${config.subtext} uppercase tracking-widest`}>Upcoming Dates</p>
          <div className="space-y-1.5">
            {job.importantDates.slice(0, 2).map((d, i) => (
              <div key={i} className="flex justify-between items-center text-[11px]">
                <span className={`${config.text} opacity-80 font-medium truncate pr-2`}>{d.label}</span>
                <span className={`${config.subtext} flex-shrink-0`}>{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
            {job.importantDates.length > 2 && (
              <p className={`text-[10px] text-${config.accent} font-medium`}>+{job.importantDates.length - 2} more</p>
            )}
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(job); }}
          className={`p-1.5 ${config.card} text-slate-400 hover:text-${config.accent} rounded-lg border ${config.border} shadow-sm`}
        >
          <Icons.Edit />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(job.id); }}
          className={`p-1.5 ${config.card} text-slate-400 hover:text-rose-600 rounded-lg border ${config.border} shadow-sm`}
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
};
