import React, { useState, useEffect } from 'react';
import { VIDEO_DEMO_SCRIPT } from '../data/reportData';
import { Video, Play, Pause, RotateCcw, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const VideoDemoViewer: React.FC = () => {
  const [rehearsalSeconds, setRehearsalSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setRehearsalSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Status check against Section 5 rubric (5:00 to 7:00 mins)
  const isTooShort = rehearsalSeconds < 300;
  const isOptimal = rehearsalSeconds >= 300 && rehearsalSeconds <= 420;
  const isTooLong = rehearsalSeconds > 420;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Video className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Video Demonstration Rehearsal Studio (Section 5)
            </h3>
            <p className="text-xs text-slate-400">
              5 to 7 minute strictly timed structure & narration script
            </p>
          </div>
        </div>

        {/* Live Rehearsal Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span
              className={`font-bold text-sm tabular-nums ${
                isOptimal ? 'text-emerald-400' : isTooLong ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {formatTime(rehearsalSeconds)}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              {isOptimal ? 'Optimal (5-7m)' : isTooShort ? 'Min 5:00' : 'Over limit!'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
              title={isTimerRunning ? 'Pause timer' : 'Start rehearsal timer'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setRehearsalSeconds(0);
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-950/70 flex flex-col gap-4">
        {/* Rubric Notice Banner */}
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Video Assessment Criteria (Section 5.1 & 5.2):</strong> Exactly 4 mandatory phases:
            (1) GitHub Walkthrough (~1m), (2) Live App Demonstration (~2-3m, full CRUD + strict matching proof),
            (3) Concept Explanation in code (~2-3m: lifecycle, database, adapter/intents/matcher),
            (4) Database Justification (~45s). Voice narration is compulsory.
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {VIDEO_DEMO_SCRIPT.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhaseIndex(idx)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                activePhaseIndex === idx
                  ? 'bg-emerald-950 border-emerald-500 text-white font-bold ring-1 ring-emerald-400/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block truncate text-[11px] font-semibold text-emerald-400">
                Phase {idx + 1}
              </span>
              <span className="block truncate font-medium text-slate-200 mt-0.5">
                {item.phase.split('.')[1] || item.phase}
              </span>
              <span className="block text-[10px] text-slate-500 font-mono mt-1">
                {item.targetDuration}
              </span>
            </button>
          ))}
        </div>

        {/* Active Phase Script Card */}
        {(() => {
          const current = VIDEO_DEMO_SCRIPT[activePhaseIndex];
          return (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-white">{current.phase}</h4>
                  <span className="text-xs text-emerald-400 font-mono">
                    Target Time: {current.targetDuration}
                  </span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                  On-Screen Goal
                </span>
              </div>

              {/* Goal Description */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                <span className="font-semibold text-emerald-300 block mb-1">Demonstration Objective:</span>
                {current.goal}
              </div>

              {/* Spoken Narration Teleprompter Script */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Suggested Verbal Narration (Teleprompter Guide):
                </span>
                {current.talkingPoints.map((point, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-xl text-xs text-emerald-100 leading-relaxed font-sans"
                  >
                    <span className="font-bold text-emerald-400 mr-2 font-mono">{pIdx + 1}.</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
