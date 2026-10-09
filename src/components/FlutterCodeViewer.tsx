import React, { useState } from 'react';
import { 
  FileCode, Copy, Check, Download, FolderTree, 
  Terminal, ShieldCheck, Cpu, Database, Radio 
} from 'lucide-react';
import { FLUTTER_CODEBASE, CodeFile } from '../data/flutterCodebase';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(FLUTTER_CODEBASE[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredFiles = categoryFilter === 'ALL'
    ? FLUTTER_CODEBASE
    : FLUTTER_CODEBASE.filter(f => f.category === categoryFilter);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    let combined = `=================================================================\n`;
    combined += `ResQMesh — Cloud-Edge Emergency Communication System\n`;
    combined += `Complete Production Flutter & Android Codebase Bundle\n`;
    combined += `=================================================================\n\n`;

    FLUTTER_CODEBASE.forEach(file => {
      combined += `\n/* =================================================================\n`;
      combined += `   FILE: ${file.path}\n`;
      combined += `   CATEGORY: ${file.category}\n`;
      combined += `   DESCRIPTION: ${file.description}\n`;
      combined += `   ================================================================= */\n\n`;
      combined += file.code;
      combined += `\n\n`;
    });

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ResQMesh_Flutter_Complete_Codebase.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Production Flutter Codebase (Ready-to-Run)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete Android & Flutter Dart sources for SQLite, Google Nearby Connections, & Firestore
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Download Code Bundle (.txt)
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-400 mr-2 font-mono">Filter:</span>
        {['ALL', 'CONFIG', 'SERVICES', 'MODELS', 'RULES', 'TESTS'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all ${
              categoryFilter === cat
                ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
        {/* Left File Tree Navigation */}
        <div className="md:col-span-4 border-r border-slate-800 bg-slate-950/60 p-3 space-y-1 overflow-y-auto max-h-[520px]">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2 px-2">
            Files ({filteredFiles.length})
          </div>

          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2 rounded-lg text-xs font-mono transition-all flex items-start gap-2 ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div className="truncate flex-1">
                  <div className="truncate font-semibold">{file.filename}</div>
                  <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Code Display Area */}
        <div className="md:col-span-8 flex flex-col bg-slate-950">
          {/* File Toolbar */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-white">{selectedFile.path}</span>
              <p className="text-[11px] text-slate-400">{selectedFile.description}</p>
            </div>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy File'}
            </button>
          </div>

          {/* Syntax Content Box */}
          <div className="p-4 overflow-x-auto flex-1 font-mono text-xs leading-relaxed text-slate-300 max-h-[460px] overflow-y-auto bg-slate-950">
            <pre className="whitespace-pre">{selectedFile.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
