import React, { useState } from 'react';
import { JAVA_CODEBASE, JavaFile } from '../data/javaCodebase';
import { FileCode, Copy, Check, Download, Layers, ShieldCheck } from 'lucide-react';

export const JavaCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<JavaFile>(JAVA_CODEBASE[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Android Studio Java Codebase (Java 17 / SDK 34)
            </h3>
            <p className="text-xs text-slate-400">
              Pure Java source files compliant with Mobile App Development 700
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-xs font-medium rounded-lg text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: File Tree */}
        <div className="w-72 bg-slate-950/70 border-r border-slate-800 flex flex-col p-3 overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Project Tree (MAD700)
          </div>

          <div className="flex flex-col gap-1">
            {JAVA_CODEBASE.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div className="truncate">
                    <span className="block truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {file.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 leading-snug">
            <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1" />
            100% Java compliance. Zero GPS or Google Maps SDK dependencies.
          </div>
        </div>

        {/* Right Area: Code Display */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          {/* File Metadata Header */}
          <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono text-emerald-400 truncate">{selectedFile.path}</span>
            <span className="text-slate-400 text-[11px]">{selectedFile.description}</span>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/80">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
