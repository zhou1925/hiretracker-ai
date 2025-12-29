import React, { useState } from 'react';
import { JobApplication, AIAnalysis, UserProfile } from '../types';
import { Icons } from '../constants';
import { Button } from './Button';
import { getAIAnalysis, getCompanyResearch } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface AIDrawerProps {
  job: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AIDrawer: React.FC<AIDrawerProps> = ({ job, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [research, setResearch] = useState<{ text: string, sources: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!job) return;
    setLoading(true);
    setError(null);
    const profile = storageService.getProfile();
    try {
      const result = await getAIAnalysis(
        job.role, 
        job.company, 
        job.notes || "No details.",
        profile.masterResume
      );
      setAnalysis(result);
    } catch (err) {
      setError("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResearch = async () => {
    if (!job) return;
    setResearchLoading(true);
    setError(null);
    try {
      const result = await getCompanyResearch(job.company);
      setResearch(result);
    } catch (err) {
      setError("Research failed.");
    } finally {
      setResearchLoading(false);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Icons.Sparkles />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Intelligence</h2>
              <p className="text-xs text-indigo-100">{job.role} @ {job.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Icons.X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {analysis?.matchScore !== undefined && (
            <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Resume Match Score</span>
                <span className="text-3xl font-black text-indigo-400">{analysis.matchScore}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full w-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" 
                  style={{ width: `${analysis.matchScore}%` }}
                />
              </div>
              {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Keyword Gaps</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((kw, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Research</h3>
              {!research && <Button size="sm" variant="ai" onClick={handleResearch} disabled={researchLoading}>Search Web</Button>}
            </div>
            {research && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-900 whitespace-pre-wrap">
                  {research.text}
                </div>
                {/* List all website URLs from grounding chunks as required by the Gemini API rules */}
                {research.sources && research.sources.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sources</p>
                    <div className="flex flex-col gap-2">
                      {research.sources.map((source: any, i: number) => source.web && (
                        <a 
                          key={i} 
                          href={source.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 font-medium transition-colors"
                        >
                          <Icons.ExternalLink />
                          <span className="truncate">{source.web.title || source.web.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Strategy</h3>
              {!analysis && <Button size="sm" variant="ai" onClick={handleAnalyze} disabled={loading}>Analyze Now</Button>}
            </div>
            {analysis && (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-900 leading-relaxed text-sm italic">"{analysis.summary}"</div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Interview Strategy</p>
                  {analysis.interviewTips.map((tip, i) => (
                    <div key={i} className="text-sm p-3 bg-white border border-slate-100 rounded-lg shadow-sm flex gap-3">
                      <span className="text-indigo-600 font-black">{i+1}</span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};