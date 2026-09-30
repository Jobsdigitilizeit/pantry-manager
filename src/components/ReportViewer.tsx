import React, { useState } from 'react';
import { ACADEMIC_REPORT_SECTIONS, AcademicReportSection } from '../data/reportData';
import { FileText, Printer, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

export const ReportViewer: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<AcademicReportSection>(
    ACADEMIC_REPORT_SECTIONS[0]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Written Assessment Report (Section 6)
            </h3>
            <p className="text-xs text-slate-400">
              Formatted academic paper formatted in exact required section order (1-9)
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Sections TOC */}
        <div className="w-64 bg-slate-950/70 border-r border-slate-800 flex flex-col p-3 overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Report Sections (Order 1-9)
          </div>

          <div className="flex flex-col gap-1">
            {ACADEMIC_REPORT_SECTIONS.map((sec) => {
              const isSelected = selectedSection.id === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec)}
                  className={`text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-mono text-emerald-400 mr-1.5">{sec.number}.</span>
                    <span>{sec.title}</span>
                  </div>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/80">
          <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl p-8 shadow-md border border-slate-200 leading-relaxed font-sans text-xs">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
              <span>Mobile App Development 700</span>
              <span>Practical Assessment Written Report</span>
            </div>

            <div className="prose prose-slate max-w-none text-xs">
              <pre className="whitespace-pre-wrap font-sans text-xs bg-transparent p-0 text-slate-800 border-none leading-relaxed">
                {selectedSection.content}
              </pre>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Section {selectedSection.number} of 9</span>
              <span>Alexander Morgan · Student No. MAD-700-2026-8842</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
