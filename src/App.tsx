import React, { useState } from 'react';
import { 
  ShieldAlert, Radio, Cpu, Database, Cloud, 
  GraduationCap, FolderTree, Terminal, Smartphone, 
  Layers, ExternalLink, HelpCircle, Activity, 
  CheckCircle2, AlertTriangle, Download
} from 'lucide-react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { MeshVisualizer } from './components/MeshVisualizer';
import { EdgeEngineInspector } from './components/EdgeEngineInspector';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { AcademicVivaKit } from './components/AcademicVivaKit';
import { StageRoadmapModal } from './components/StageRoadmapModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'SIMULATOR' | 'CODE' | 'VIVA' | 'ROADMAP'>('SIMULATOR');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-lg tracking-tight">ResQMesh</h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded uppercase">
                  Cloud-Edge Ad-Hoc System
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Internet-Independent Disaster Emergency Communication System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('SIMULATOR')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'SIMULATOR'
                  ? 'bg-indigo-600 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Interactive Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('CODE')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'CODE'
                  ? 'bg-indigo-600 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Flutter Source Code</span>
            </button>

            <button
              onClick={() => setActiveTab('VIVA')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'VIVA'
                  ? 'bg-indigo-600 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Viva & Review Kit</span>
            </button>

            <button
              onClick={() => setActiveTab('ROADMAP')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'ROADMAP'
                  ? 'bg-indigo-600 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>10-Stage Setup</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        
        {/* ================= TAB 1: INTERACTIVE SIMULATOR & TELEMETRY ================= */}
        {activeTab === 'SIMULATOR' && (
          <div className="space-y-8">
            {/* Quick Overview Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ACADEMIC DEFENSE & LIVE EVALUATION ENVIRONMENT
                </span>
                <h2 className="text-lg lg:text-xl font-bold text-white">
                  Real Zero-Internet Disaster Mesh Communication
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Test the actual mobile application on the virtual device below: tap <b>SOS</b> to trigger an alert, watch the <b>Edge Rule Engine</b> tokenize symptoms without cloud AI, observe <b>multi-hop mesh packet propagation</b> across disconnected nodes, and unlock the <b>Responder Dashboard</b> using PIN <code className="text-indigo-300 font-mono">9110</code>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300">
                  Storage: <span className="text-indigo-400 font-bold">Local SQLite</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300">
                  D2D: <span className="text-indigo-400 font-bold">Nearby Wi-Fi/BLE</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300">
                  Cloud: <span className="text-indigo-400 font-bold">Firestore Sync</span>
                </div>
              </div>
            </div>

            {/* Split Screen Layout: Phone on Left, Mesh & Edge Visualizers on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interactive Phone Device */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 px-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Virtual Android Phone
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Active Node: Alpha (Victim)
                  </span>
                </div>
                <PhoneSimulator />
              </div>

              {/* Right Column: Live Mesh Network Topology & Edge Engine Inspector */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Multi-Node Mesh Network Simulator */}
                <MeshVisualizer />

                {/* 2. On-Device Edge Prioritization Rule Engine Tester */}
                <EdgeEngineInspector />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: FLUTTER SOURCE CODE ================= */}
        {activeTab === 'CODE' && (
          <div className="space-y-4">
            <FlutterCodeViewer />
          </div>
        )}

        {/* ================= TAB 3: ACADEMIC VIVA & REVIEW KIT ================= */}
        {activeTab === 'VIVA' && (
          <div className="space-y-4">
            <AcademicVivaKit />
          </div>
        )}

        {/* ================= TAB 4: 10-STAGE ROADMAP ================= */}
        {activeTab === 'ROADMAP' && (
          <div className="space-y-4">
            <StageRoadmapModal />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-4 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ResQMesh • Cloud-Edge Emergency Communication System for Internet-Independent Disaster Response
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Compliant with CSE Final Year Project Evaluation Guidelines
          </div>
        </div>
      </footer>
    </div>
  );
}
