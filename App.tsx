
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { JobApplication, JobStatus, UserProfile, ActivityLog, Theme } from './types';
import { Icons, STATUS_COLORS, THEME_CONFIGS } from './constants';
import { storageService } from './services/storageService';
import { Button } from './components/Button';
import { JobCard } from './components/JobCard';
import { JobModal } from './components/JobModal';
import { StatsOverview } from './components/StatsOverview';
import { AIDrawer } from './components/AIDrawer';

type ViewMode = 'grid' | 'board';

const App: React.FC = () => {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [profile, setProfile] = useState<UserProfile>(storageService.getProfile());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<JobStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<ViewMode>(() => 
    (localStorage.getItem('hiretrace_view') as ViewMode) || 'grid'
  );
  
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<JobStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = profile.theme || 'light';
  const themeConfig = THEME_CONFIGS[theme];

  useEffect(() => {
    setApps(storageService.getApplications());
  }, []);

  useEffect(() => {
    storageService.saveApplications(apps);
  }, [apps]);

  useEffect(() => {
    storageService.saveProfile(profile);
  }, [profile]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return apps.flatMap(app => 
      app.importantDates
        .filter(d => {
          const date = new Date(d.date);
          return date >= now && date <= in48Hours;
        })
        .map(d => ({ ...d, appRole: app.role, appCompany: app.company }))
    );
  }, [apps]);

  const handleExportData = () => {
    const data = {
      applications: apps,
      profile: profile,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hiretrace-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.applications && Array.isArray(json.applications)) {
          if (window.confirm("This will overwrite your current data. Are you sure you want to proceed?")) {
            setApps(json.applications);
            if (json.profile) setProfile(json.profile);
            alert("Data imported successfully!");
          }
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Failed to read the file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddOrUpdate = (job: JobApplication) => {
    if (editingJob) {
      setApps(apps.map(a => a.id === job.id ? job : a));
    } else {
      setApps([{ ...job, activityLog: [{ id: crypto.randomUUID(), timestamp: Date.now(), note: 'Application created', type: 'status_change' }] }, ...apps]);
    }
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    setApps(prev => prev.map(app => {
      if (app.id === jobId) {
        if (app.status === newStatus) return app;
        const log: ActivityLog = { id: crypto.randomUUID(), timestamp: Date.now(), note: `Status updated to ${newStatus}`, type: 'status_change' };
        return { ...app, status: newStatus, activityLog: [...app.activityLog, log], lastUpdated: Date.now() };
      }
      return app;
    }));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedJobId(id);
    e.dataTransfer.setData('jobId', id);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedJobId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId') || draggedJobId;
    if (jobId) {
      handleStatusChange(jobId, status);
    }
    setDraggedJobId(null);
    setDragOverStatus(null);
  };

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = app.company.toLowerCase().includes(searchQuery.toLowerCase()) || app.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || app.status === activeFilter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => b.lastUpdated - a.lastUpdated);
  }, [apps, searchQuery, activeFilter]);

  const handleSelect = (job: JobApplication) => {
    setSelectedJob(job);
    setIsAIDrawerOpen(true);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredApps.map((app) => (
        <JobCard 
          key={app.id} 
          job={app} 
          theme={theme}
          onEdit={setEditingJob} 
          onDelete={id => setApps(apps.filter(a => a.id !== id))} 
          onSelect={handleSelect} 
        />
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${themeConfig.bg}`}>
      <header className={`sticky top-0 z-30 transition-colors duration-500 ${themeConfig.nav} border-b ${themeConfig.border} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${themeConfig.headerIcon} rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500`}>
              <span className="text-white font-black">H</span>
            </div>
            <h1 className={`text-xl font-black tracking-tight hidden sm:block transition-colors duration-500 ${themeConfig.text}`}>HireTrace AI</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsThemeOpen(!isThemeOpen)} 
                className={`p-2 rounded-xl transition-all ${isThemeOpen ? `bg-${themeConfig.accent}/10 text-${themeConfig.accent}` : `${themeConfig.subtext} hover:bg-slate-100 dark:hover:bg-slate-800`}`}
              >
                <Icons.Palette />
              </button>
              {isThemeOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border p-2 z-50 ${themeConfig.card} ${themeConfig.border}`}>
                  <h3 className={`text-[10px] font-black uppercase tracking-widest p-2 mb-1 ${themeConfig.subtext}`}>Select Theme</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {(Object.keys(THEME_CONFIGS) as Theme[]).map(t => (
                      <button 
                        key={t}
                        onClick={() => { setProfile({...profile, theme: t}); setIsThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-xs font-bold transition-all ${theme === t ? `bg-${themeConfig.accent}/10 text-${themeConfig.accent}` : `${themeConfig.text} hover:bg-slate-100 dark:hover:bg-slate-800`}`}
                      >
                        <div className={`w-4 h-4 rounded-full ${THEME_CONFIGS[t].headerIcon} border border-white/20`}></div>
                        <span className="capitalize">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setIsRemindersOpen(!isRemindersOpen)} className={`p-2 rounded-xl transition-all ${upcomingDeadlines.length > 0 ? 'text-rose-500 bg-rose-50' : `${themeConfig.subtext} hover:bg-slate-100 dark:hover:bg-slate-800`}`}>
                <Icons.Bell />
                {upcomingDeadlines.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 border-2 border-white rounded-full"></span>}
              </button>
              {isRemindersOpen && (
                <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border p-4 z-50 ${themeConfig.card} ${themeConfig.border}`}>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${themeConfig.subtext}`}>Priority Alerts</h3>
                  <div className="space-y-3">
                    {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((d, i) => (
                      <div key={i} className={`text-xs p-2 rounded-lg border ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/50 border-slate-700'}`}>
                        <p className={`font-bold ${themeConfig.text}`}>{d.label}</p>
                        <p className={themeConfig.subtext}>{d.appRole} @ {d.appCompany}</p>
                        <p className="text-rose-600 font-medium mt-1">Due: {new Date(d.date).toLocaleString()}</p>
                      </div>
                    )) : <p className={`text-xs italic ${themeConfig.subtext}`}>No urgent deadlines.</p>}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setIsProfileOpen(true)} className={`p-2 rounded-xl transition-all ${themeConfig.subtext} hover:bg-slate-100 dark:hover:bg-slate-800`}>
              <Icons.User />
            </button>
            
            <div className={`h-6 w-px mx-1 ${themeConfig.border}`}></div>
            <Button onClick={() => setIsModalOpen(true)} className={`shadow-lg bg-${themeConfig.accent} hover:opacity-90`}><Icons.Plus /><span className="ml-2 hidden lg:inline">New Application</span></Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <StatsOverview applications={apps} theme={theme} />

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Filter applications..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className={`w-full pl-10 pr-4 py-3 border rounded-2xl shadow-sm focus:ring-2 focus:ring-${themeConfig.accent} focus:outline-none transition-all ${themeConfig.card} ${themeConfig.border} ${themeConfig.text}`} 
            />
            <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.subtext}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2}/></svg>
            </div>
          </div>
          <div className={`flex gap-2 p-1 rounded-2xl shadow-sm border ${themeConfig.card} ${themeConfig.border}`}>
            {['grid', 'board'].map(m => (
              <button 
                key={m} 
                onClick={() => setViewMode(m as any)} 
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${viewMode === m ? `bg-${themeConfig.accent} text-white shadow-md` : `${themeConfig.subtext} hover:text-slate-600 dark:hover:text-slate-300`}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'grid' ? renderGridView() : (
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide min-h-[600px]">
            {Object.values(JobStatus).map(status => (
              <div 
                key={status} 
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={(e) => handleDrop(e, status)}
                className={`w-80 flex-shrink-0 flex flex-col gap-4 rounded-2xl transition-all duration-200 p-2 ${dragOverStatus === status ? `bg-${themeConfig.accent}/10 ring-2 ring-${themeConfig.accent}/50 ring-dashed` : ''}`}
              >
                <div className={`p-3 rounded-xl shadow-sm border-t-4 flex items-center justify-between transition-colors duration-500 ${themeConfig.card} ${themeConfig.border} ${STATUS_COLORS[status].split(' ')[2]}`}>
                  <h3 className={`text-xs font-black uppercase tracking-widest ${themeConfig.text} opacity-70`}>{status}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'} ${themeConfig.text}`}>{apps.filter(a => a.status === status).length}</span>
                </div>
                <div className="flex flex-col gap-4">
                  {apps.filter(a => a.status === status).map(app => (
                    <div 
                      key={app.id} 
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onDragEnd={handleDragEnd}
                      draggable
                    >
                      <JobCard 
                        job={app} 
                        theme={theme}
                        onEdit={setEditingJob} 
                        onDelete={id => setApps(apps.filter(a => a.id !== id))} 
                        onSelect={handleSelect} 
                      />
                    </div>
                  ))}
                </div>
                {apps.filter(a => a.status === status).length === 0 && (
                  <div className={`flex-1 min-h-[100px] border-2 border-dashed rounded-xl flex items-center justify-center text-xs italic ${themeConfig.border} ${themeConfig.subtext}`}>
                    Drop here
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {isProfileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className={`rounded-[2rem] shadow-2xl w-full max-w-xl p-8 ${themeConfig.card}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-black ${themeConfig.text}`}>Your Search Profile</h2>
              <button onClick={() => setIsProfileOpen(false)} className={themeConfig.subtext}><Icons.X /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className={`text-[10px] font-black uppercase tracking-widest ${themeConfig.subtext}`}>Data Management</p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleExportData}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${themeConfig.border} ${themeConfig.text} hover:bg-slate-100 dark:hover:bg-slate-800`}
                  >
                    <Icons.Download /> Export JSON
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${themeConfig.border} ${themeConfig.text} hover:bg-slate-100 dark:hover:bg-slate-800`}
                  >
                    <Icons.Upload /> Import JSON
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImportData} 
                    accept=".json" 
                    className="hidden" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-black uppercase ${themeConfig.subtext}`}>Master Resume (Plain Text)</label>
                <textarea 
                  value={profile.masterResume} 
                  onChange={e => setProfile({...profile, masterResume: e.target.value})} 
                  rows={10} 
                  className={`w-full p-4 border rounded-2xl focus:ring-2 focus:ring-${themeConfig.accent} focus:outline-none text-sm leading-relaxed ${themeConfig.bg} ${themeConfig.border} ${themeConfig.text}`} 
                  placeholder="Paste your resume text here for AI Matching..." 
                />
              </div>
              <Button className={`w-full py-4 rounded-2xl bg-${themeConfig.accent}`} onClick={() => setIsProfileOpen(false)}>Save & Close</Button>
            </div>
          </div>
        </div>
      )}

      <JobModal isOpen={isModalOpen || !!editingJob} onClose={() => { setIsModalOpen(false); setEditingJob(null); }} onSave={handleAddOrUpdate} initialData={editingJob} />
      <AIDrawer isOpen={isAIDrawerOpen} job={selectedJob} onClose={() => setIsAIDrawerOpen(false)} />
    </div>
  );
};

export default App;
