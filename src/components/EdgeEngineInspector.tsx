import React, { useState } from 'react';
import { 
  ShieldAlert, Activity, Wifi, Radio, Cpu, Database, 
  MapPin, CheckCircle2, AlertTriangle, Users, Flame, 
  Clock, ArrowRight, CornerDownRight, RefreshCw, Zap
} from 'lucide-react';
import { EmergencyAlert, TriageLevel } from '../types';
import { evaluateAlertOnEdge } from '../services/edgeEngine';

interface EdgeEngineInspectorProps {
  onTestAlertGenerated?: (alert: Partial<EmergencyAlert>) => void;
}

export const EdgeEngineInspector: React.FC<EdgeEngineInspectorProps> = ({ onTestAlertGenerated }) => {
  const [category, setCategory] = useState<EmergencyAlert['category']>('TRAPPED');
  const [message, setMessage] = useState('2 people trapped under collapsed wall with deep bleeding wound and infant crying');
  const [peopleCount, setPeopleCount] = useState(2);
  const [hasGps, setHasGps] = useState(true);

  const evaluation = evaluateAlertOnEdge(category, message, peopleCount, hasGps);

  const getTriageColor = (level: TriageLevel) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'URGENT': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'MODERATE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  const getTriageBadge = (level: TriageLevel) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'URGENT': return 'bg-amber-600 text-white';
      case 'MODERATE': return 'bg-emerald-600 text-white';
      case 'LOW': return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Edge Prioritization Rule Engine</h3>
            <p className="text-xs text-slate-400">Zero-Cloud, On-Device Deterministic Disaster Triage (START Protocol)</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
          Offline Mode Active • &lt;5ms Latency
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Input Parameters */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Disaster Hazard Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(['TRAPPED', 'MEDICAL', 'COLLAPSE', 'FIRE', 'FLOOD', 'GENERAL_SOS'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs py-2 px-2.5 rounded-lg border font-medium transition-all ${
                    category === cat
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-400">Distress Message (Natural Language Text)</label>
              <span className="text-[11px] text-indigo-400 font-mono">NLP Keyword Tokenizer Active</span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Trapped under debris, heavy bleeding, elderly person injured..."
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="text-[10px] text-slate-400">Quick test phrases:</span>
              {[
                '3 trapped, 1 infant breathing hard',
                'Water rising fast on 2nd floor, elderly stranded',
                'Minor leg cut, need bandages and food',
              ].map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessage(phrase)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                >
                  {phrase.slice(0, 24)}...
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Number of Victims Affected</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <span className="text-xs font-mono font-bold text-white px-2 py-1 bg-slate-800 rounded border border-slate-700">
                  {peopleCount}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">GPS Hardware Lock</label>
              <button
                onClick={() => setHasGps(!hasGps)}
                className={`w-full py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                  hasGps
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {hasGps ? 'GPS Precision (+5 pts)' : 'Approx Cell Tower (-5 pts)'}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Output & Score Breakdown */}
        <div className="lg:col-span-6 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Computed Priority Output</span>
              <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${getTriageBadge(evaluation.triageLevel)}`}>
                {evaluation.triageLevel} TRIAGE
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-3">
              <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
                {evaluation.score}
                <span className="text-base text-slate-400 font-normal">/100</span>
              </div>
              <div className="flex-1">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      evaluation.score >= 75 ? 'bg-red-500' :
                      evaluation.score >= 50 ? 'bg-amber-500' :
                      evaluation.score >= 30 ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${evaluation.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0 (Low)</span>
                  <span>30 (Mod)</span>
                  <span>50 (Urg)</span>
                  <span>75 (Crit)</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* Factor breakdown */}
            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/90 rounded-lg p-3 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Weight Calculation Audit:
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">• Base Hazard ({category}):</span>
                <span className="font-mono text-indigo-400">+{evaluation.factors.hazardSeverityImpact} pts</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">• NLP Keyword Urgency:</span>
                <span className="font-mono text-red-400">+{evaluation.factors.keywordImpact} pts</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">• Multi-Victim Headcount:</span>
                <span className="font-mono text-amber-400">+{evaluation.factors.victimCountImpact} pts</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">• GPS Fix Accuracy:</span>
                <span className={`font-mono ${evaluation.factors.locationFreshnessImpact >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {evaluation.factors.locationFreshnessImpact >= 0 ? '+5 pts' : '-5 pts'}
                </span>
              </div>
            </div>

            {/* Detected Keywords Tag List */}
            <div className="mt-3">
              <div className="text-[11px] text-slate-400 mb-1.5">Detected Critical Keywords:</div>
              <div className="flex flex-wrap gap-1.5">
                {evaluation.detectedKeywords.length > 0 ? (
                  evaluation.detectedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-mono font-medium"
                    >
                      ★ {kw.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No life-threatening keywords detected in text</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              <span className="text-slate-300 font-semibold">Triage Rule: </span>
              {evaluation.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
