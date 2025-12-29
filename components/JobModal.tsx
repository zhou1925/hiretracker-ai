import React, { useState, useEffect } from 'react';
import { JobApplication, JobStatus } from '../types';
import { Button } from './Button';
import { Icons } from '../constants';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobApplication) => void;
  initialData?: JobApplication | null;
}

// Add missing activityLog property to match Omit<JobApplication, 'id' | 'lastUpdated'>
const EMPTY_JOB: Omit<JobApplication, 'id' | 'lastUpdated'> = {
  company: '',
  role: '',
  url: '',
  status: JobStatus.WISHLIST,
  appliedDate: new Date().toISOString().split('T')[0],
  importantDates: [],
  notes: '',
  salary: '',
  location: '',
  activityLog: []
};

export const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<JobApplication>>(EMPTY_JOB);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(EMPTY_JOB);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
      lastUpdated: Date.now()
    } as JobApplication);
  };

  const addDate = () => {
    const dates = [...(formData.importantDates || []), { label: '', date: new Date().toISOString().split('T')[0] }];
    setFormData({ ...formData, importantDates: dates });
  };

  const updateDate = (index: number, field: 'label' | 'date', value: string) => {
    const dates = [...(formData.importantDates || [])];
    dates[index] = { ...dates[index], [field]: value };
    setFormData({ ...formData, importantDates: dates });
  };

  const removeDate = (index: number) => {
    const dates = (formData.importantDates || []).filter((_, i) => i !== index);
    setFormData({ ...formData, importantDates: dates });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Application' : 'Add New Application'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
            <Icons.X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Company *</label>
              <input 
                required
                type="text" 
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                placeholder="e.g. Google"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Role *</label>
              <input 
                required
                type="text" 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as JobStatus})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
              >
                {Object.values(JobStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Applied Date</label>
              <input 
                type="date" 
                value={formData.appliedDate}
                onChange={e => setFormData({...formData, appliedDate: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Location</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                placeholder="e.g. Remote, NY, London"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Salary Range</label>
              <input 
                type="text" 
                value={formData.salary}
                onChange={e => setFormData({...formData, salary: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                placeholder="e.g. $120k - $150k"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Application / Post URL</label>
            <input 
              type="url" 
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
              placeholder="https://company.com/careers/job-id"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">Important Dates</label>
              <button 
                type="button" 
                onClick={addDate}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Icons.Plus /> Add Date
              </button>
            </div>
            <div className="space-y-2">
              {(formData.importantDates || []).map((d, i) => (
                <div key={i} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <input 
                    type="text" 
                    value={d.label}
                    onChange={e => updateDate(i, 'label', e.target.value)}
                    placeholder="e.g. Interview 1"
                    className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input 
                    type="date" 
                    value={d.date}
                    onChange={e => updateDate(i, 'date', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeDate(i)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
              {(formData.importantDates || []).length === 0 && (
                <p className="text-xs text-slate-400 italic">No important dates added yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Notes / Job Description</label>
            <textarea 
              rows={4}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
              placeholder="Paste job details or personal notes here..."
            />
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} type="button">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};