import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Radio, Wifi, WifiOff, MapPin, Send, 
  Users, CheckCircle2, AlertTriangle, Clock, RefreshCw, 
  MessageSquare, Compass, Eye, Settings, User, 
  ChevronRight, ArrowLeft, Lock, Check, AlertOctagon, 
  Battery, Activity, Phone, FileText, CornerDownRight, 
  Play, Cloud, CloudOff
} from 'lucide-react';
import { 
  UserProfile, EmergencyAlert, EmergencyMessage, 
  MeshNode, ConnectionMode, TriageLevel, AlertStatus 
} from '../types';
import { dbHelper } from '../services/storage';
import { meshService } from '../services/meshNetwork';
import { evaluateAlertOnEdge, sortEmergencyQueue } from '../services/edgeEngine';

type ActiveScreen = 
  | 'HOME' 
  | 'SOS_FORM' 
  | 'MESSAGES' 
  | 'RADAR' 
  | 'MAP_DETAILS' 
  | 'RESPONDER' 
  | 'SYNC_QUEUE' 
  | 'PROFILE';

export const PhoneSimulator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('HOME');
  const [userProfile, setUserProfile] = useState<UserProfile>(dbHelper.getUserProfile());
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(dbHelper.getAlerts());
  const [messages, setMessages] = useState<EmergencyMessage[]>(dbHelper.getMessages());
  const [nodes, setNodes] = useState<MeshNode[]>(meshService.getNodes());
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);

  // Radio & Environment simulation toggles
  const [isInternetOnline, setIsInternetOnline] = useState<boolean>(false);
  const [isGpsLocked, setIsGpsLocked] = useState<boolean>(true);
  const [responderPinInput, setResponderPinInput] = useState<string>('');
  const [isResponderUnlocked, setIsResponderUnlocked] = useState<boolean>(false);
  const [responderPinError, setResponderPinError] = useState<string>('');

  // SOS Form state
  const [sosCategory, setSosCategory] = useState<EmergencyAlert['category']>('TRAPPED');
  const [sosMessage, setSosMessage] = useState<string>('Trapped under concrete debris, severe bleeding from right leg. 2 adults and 1 infant.');
  const [sosPeopleCount, setSosPeopleCount] = useState<number>(3);
  const [isSubmittingSos, setIsSubmittingSos] = useState<boolean>(false);
  const [sosSuccessBanner, setSosSuccessBanner] = useState<boolean>(false);

  // New Chat Message state
  const [chatInput, setChatInput] = useState<string>('');

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string>('');

  // Refresh lists
  const reloadData = () => {
    setAlerts(dbHelper.getAlerts());
    setMessages(dbHelper.getMessages());
    setUserProfile(dbHelper.getUserProfile());
  };

  useEffect(() => {
    const unsubTopology = meshService.subscribeTopology((updatedNodes) => {
      setNodes([...updatedNodes]);
    });
    const unsubPackets = meshService.subscribePackets(() => {
      reloadData();
    });

    return () => {
      unsubTopology();
      unsubPackets();
    };
  }, []);

  // Compute live connection mode status label
  const getConnectionMode = (): { label: string; color: string; icon: React.ReactNode } => {
    if (isInternetOnline) {
      return {
        label: 'CLOUD ONLINE (STARLINK/4G)',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />
      };
    }
    const neighborCount = nodes.filter(n => n.isDirectNeighbor).length;
    if (neighborCount > 0) {
      return {
        label: `OFFLINE MESH (${neighborCount} PEERS IN RANGE)`,
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        icon: <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
      };
    }
    return {
      label: 'OFFLINE ISOLATED',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: <WifiOff className="w-3.5 h-3.5 text-amber-400" />
    };
  };

  // Evaluate SOS form live with Edge engine
  const liveEvaluation = evaluateAlertOnEdge(
    sosCategory, 
    sosMessage, 
    sosPeopleCount, 
    isGpsLocked
  );

  // Trigger SOS Submission
  const handleSendSos = () => {
    setIsSubmittingSos(true);

    const newAlert: EmergencyAlert = {
      id: `ALT-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: userProfile.id,
      userName: userProfile.name,
      userPhone: userProfile.phone,
      bloodGroup: userProfile.bloodGroup,
      category: sosCategory,
      message: sosMessage,
      peopleCount: sosPeopleCount,
      location: {
        latitude: 12.9716 + (Math.random() * 0.005 - 0.0025),
        longitude: 77.5946 + (Math.random() * 0.005 - 0.0025),
        accuracyMeters: isGpsLocked ? 3.5 : 85.0,
        timestamp: Date.now(),
        addressHint: 'Sector 4, Main Evacuation Corridor',
      },
      timestamp: Date.now(),
      priorityScore: liveEvaluation.score,
      triageLevel: liveEvaluation.triageLevel,
      priorityReason: liveEvaluation.reason,
      status: 'ACTIVE',
      syncState: isInternetOnline ? 'CLOUD_SYNCED' : 'PENDING_LOCAL',
      syncedAt: isInternetOnline ? Date.now() : undefined,
      hopCount: 0,
      maxHops: 5,
      relayedByNodeIds: [userProfile.id],
    };

    // 1. Immediately write to SQLite (zero-delay offline safety)
    dbHelper.saveAlert(newAlert);

    // 2. Transmit across offline mesh
    meshService.broadcastAlert(newAlert);

    setTimeout(() => {
      setIsSubmittingSos(false);
      setSosSuccessBanner(true);
      reloadData();
      setTimeout(() => {
        setSosSuccessBanner(false);
        setCurrentScreen('HOME');
      }, 1500);
    }, 600);
  };

  // Send mesh chat message
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMsg: EmergencyMessage = {
      id: `MSG-${Date.now().toString(36)}`,
      senderId: userProfile.id,
      senderName: userProfile.name,
      recipientId: 'BROADCAST',
      content: chatInput.trim(),
      timestamp: Date.now(),
      syncState: isInternetOnline ? 'CLOUD_SYNCED' : 'PENDING_LOCAL',
      hopCount: 0,
      maxHops: 5,
      relayedBy: [userProfile.id],
      isSosRelated: false,
    };

    dbHelper.saveMessage(newMsg);
    meshService.sendMessage(newMsg);
    setChatInput('');
    reloadData();
  };

  // Responder status update
  const handleUpdateAlertStatus = (alertId: string, newStatus: AlertStatus) => {
    dbHelper.updateAlertStatus(alertId, newStatus, `Action logged by Responder ${userProfile.name}`);
    reloadData();
  };

  // Manual cloud synchronization trigger
  const handleTriggerSync = () => {
    if (!isInternetOnline) {
      setSyncFeedback('Cannot sync: Internet is disabled. Connect satellite or cellular uplink to proceed.');
      return;
    }

    setIsSyncing(true);
    setSyncFeedback('Authenticating with Firebase Cloud Firestore...');

    setTimeout(() => {
      const pendingList = alerts.filter(a => a.syncState !== 'CLOUD_SYNCED');
      pendingList.forEach(a => {
        a.syncState = 'CLOUD_SYNCED';
        a.syncedAt = Date.now();
        dbHelper.saveAlert(a);
      });

      const pendingMsgs = messages.filter(m => m.syncState !== 'CLOUD_SYNCED');
      pendingMsgs.forEach(m => {
        m.syncState = 'CLOUD_SYNCED';
        dbHelper.saveMessage(m);
      });

      setIsSyncing(false);
      setSyncFeedback(`Successfully synchronized ${pendingList.length} alerts & ${pendingMsgs.length} messages to Firestore!`);
      reloadData();
    }, 1200);
  };

  const getTriageBadge = (level: TriageLevel) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'URGENT': return 'bg-amber-600 text-white';
      case 'MODERATE': return 'bg-emerald-600 text-white';
      case 'LOW': return 'bg-blue-600 text-white';
    }
  };

  const pendingSyncCount = alerts.filter(a => a.syncState !== 'CLOUD_SYNCED').length;
  const sortedAlerts = sortEmergencyQueue(alerts);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Device Frame */}
      <div className="w-full max-w-md bg-slate-950 border-4 border-slate-800 rounded-[36px] overflow-hidden shadow-2xl flex flex-col h-[740px] relative text-slate-100">
        
        {/* Top Speaker & Camera Notch */}
        <div className="bg-slate-950 pt-2 px-6 pb-1 flex justify-between items-center text-[11px] text-slate-400 select-none z-30 border-b border-slate-900">
          <span className="font-semibold text-slate-300">12:30</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 font-mono">
            {isGpsLocked ? <MapPin className="w-3 h-3 text-emerald-400" /> : <MapPin className="w-3 h-3 text-amber-500" />}
            {isInternetOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-slate-500" />}
            <Battery className="w-3.5 h-3.5 text-slate-300" />
            <span>84%</span>
          </div>
        </div>

        {/* Global Connection & Radio Status Bar (Req B: dynamic real labels) */}
        <div className="bg-slate-900/90 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <div className={`px-2 py-0.5 rounded border flex items-center gap-1.5 font-semibold text-[10px] ${getConnectionMode().color}`}>
            {getConnectionMode().icon}
            <span>{getConnectionMode().label}</span>
          </div>

          {pendingSyncCount > 0 && (
            <button 
              onClick={() => setCurrentScreen('SYNC_QUEUE')}
              className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>{pendingSyncCount} in queue</span>
            </button>
          )}
        </div>

        {/* Dynamic Screen Content Body */}
        <div className="flex-1 overflow-y-auto bg-slate-950 flex flex-col">
          
          {/* ================= SCREEN 1: HOME DASHBOARD ================= */}
          {currentScreen === 'HOME' && (
            <div className="p-4 space-y-4">
              {/* Header Greeting */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">ResQMesh Emergency</h2>
                  <p className="text-xs text-slate-400">Node: {userProfile.name} ({userProfile.role})</p>
                </div>
                <button
                  onClick={() => setCurrentScreen('PROFILE')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-300 hover:text-white"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>

              {/* BIG PROMINENT SOS BUTTON (Requirement B & C) */}
              <div className="bg-gradient-to-b from-red-950/40 to-slate-900 border border-red-900/40 rounded-2xl p-5 text-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">Life-Threatening Emergency</p>
                  
                  <button
                    onClick={() => setCurrentScreen('SOS_FORM')}
                    className="w-36 h-36 rounded-full bg-gradient-to-tr from-red-700 to-red-500 text-white font-black text-2xl shadow-xl shadow-red-900/60 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border-4 border-red-400/30 group animate-pulse"
                  >
                    <ShieldAlert className="w-10 h-10 group-hover:scale-110 transition-transform" />
                    <span>SOS</span>
                    <span className="text-[10px] font-normal tracking-wide opacity-90">TAP TO BROADCAST</span>
                  </button>

                  <p className="text-[11px] text-slate-400 mt-3 font-mono">
                    Instant zero-internet offline broadcast via BLE + Wi-Fi Direct
                  </p>
                </div>
              </div>

              {/* Status Telemetry Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div 
                  onClick={() => setCurrentScreen('RADAR')}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-indigo-400 mb-1">
                    <Radio className="w-4 h-4" />
                    <span className="text-[10px] font-mono">{nodes.length} Active</span>
                  </div>
                  <div className="font-semibold text-white">Mesh Radar</div>
                  <div className="text-[10px] text-slate-400">P2P Cluster in range</div>
                </div>

                <div 
                  onClick={() => setCurrentScreen('SYNC_QUEUE')}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-amber-400 mb-1">
                    <Cloud className="w-4 h-4" />
                    <span className="text-[10px] font-mono">{pendingSyncCount} Unsynced</span>
                  </div>
                  <div className="font-semibold text-white">Offline Queue</div>
                  <div className="text-[10px] text-slate-400">SQLite local cache</div>
                </div>
              </div>

              {/* Live Emergency Alerts Stream */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Distress Alerts</h3>
                  <span className="text-[10px] font-mono text-slate-500">Auto-prioritized on Edge</span>
                </div>

                <div className="space-y-2">
                  {sortedAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setSelectedAlert(alert);
                        setCurrentScreen('MAP_DETAILS');
                      }}
                      className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTriageBadge(alert.triageLevel)}`}>
                            {alert.triageLevel}
                          </span>
                          <span className="font-semibold text-xs text-white">{alert.category}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Score: <b className="text-white">{alert.priorityScore}</b>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2">{alert.message}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {alert.peopleCount} victims
                        </span>
                        <span className="flex items-center gap-1">
                          <Radio className="w-3 h-3 text-indigo-400" /> {alert.hopCount} hops
                        </span>
                        <span className={alert.syncState === 'CLOUD_SYNCED' ? 'text-emerald-400' : 'text-amber-400'}>
                          {alert.syncState === 'CLOUD_SYNCED' ? '✓ Synced' : '⏳ Queued'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= SCREEN 2: SOS EMERGENCY FORM ================= */}
          {currentScreen === 'SOS_FORM' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <button 
                  onClick={() => setCurrentScreen('HOME')}
                  className="p-1.5 bg-slate-900 rounded-lg text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-bold text-white text-base">Send SOS Distress Signal</h3>
                  <p className="text-[11px] text-slate-400">Zero Internet Required • Broadcasts to all nearby phones</p>
                </div>
              </div>

              {sosSuccessBanner && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Distress alert saved to local SQLite & transmitted to nearby mesh nodes!</span>
                </div>
              )}

              {/* Hazard Category Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Emergency Hazard Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['TRAPPED', 'MEDICAL', 'COLLAPSE', 'FIRE', 'FLOOD', 'GENERAL_SOS'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSosCategory(cat)}
                      className={`text-xs py-2 px-1 rounded-lg border font-medium transition-all ${
                        sosCategory === cat
                          ? 'bg-red-600 border-red-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input with Edge Keyword Detection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Situation Description</label>
                  <span className="text-[10px] text-indigo-400 font-mono">Edge NLP Active</span>
                </div>
                <textarea
                  value={sosMessage}
                  onChange={(e) => setSosMessage(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  placeholder="Describe trapped people, injuries, water level, structural damage..."
                />
              </div>

              {/* Live On-Device Triage Preview */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Computed Urgency:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTriageBadge(liveEvaluation.triageLevel)}`}>
                    {liveEvaluation.triageLevel} ({liveEvaluation.score}/100)
                  </span>
                </div>
                {liveEvaluation.detectedKeywords.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap text-[10px]">
                    <span className="text-slate-400">Trigger Keywords:</span>
                    {liveEvaluation.detectedKeywords.map((k, idx) => (
                      <span key={idx} className="bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-mono">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* People Count & GPS Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                  <label className="text-[11px] text-slate-400 block mb-1">People with you:</label>
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSosPeopleCount(Math.max(1, sosPeopleCount - 1))}
                      className="w-7 h-7 bg-slate-800 rounded-lg text-white font-bold"
                    >-</button>
                    <span className="font-bold text-white text-base">{sosPeopleCount}</span>
                    <button 
                      onClick={() => setSosPeopleCount(sosPeopleCount + 1)}
                      className="w-7 h-7 bg-slate-800 rounded-lg text-white font-bold"
                    >+</button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400">GPS Hardware:</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Locked (12.9716, 77.5946)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSendSos}
                disabled={isSubmittingSos}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <ShieldAlert className="w-5 h-5" />
                {isSubmittingSos ? 'Broadcasting to Mesh...' : 'CONFIRM & BROADCAST SOS'}
              </button>
            </div>
          )}

          {/* ================= SCREEN 3: EMERGENCY MESSAGES ================= */}
          {currentScreen === 'MESSAGES' && (
            <div className="p-4 flex flex-col h-full">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentScreen('HOME')}
                    className="p-1.5 bg-slate-900 rounded-lg text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-white text-sm">Disaster Mesh Broadcast Chat</h3>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Ad-hoc Channel
                </span>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {messages.map((msg) => {
                  const isMine = msg.senderId === userProfile.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 font-mono">
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.hopCount === 0 ? 'Direct Origin' : `${msg.hopCount} hops`}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-100 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span className={msg.syncState === 'CLOUD_SYNCED' ? 'text-emerald-400' : 'text-amber-400'}>
                          {msg.syncState === 'CLOUD_SYNCED' ? '✓ Synced' : '⏳ Mesh Queued'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="pt-3 border-t border-slate-800 flex gap-2 items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type broadcast update..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= SCREEN 4: MESH RADAR ================= */}
          {currentScreen === 'RADAR' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentScreen('HOME')}
                    className="p-1.5 bg-slate-900 rounded-lg text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-white text-sm">Nearby Mesh Radar</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 animate-pulse">Scanning BLE/Wi-Fi P2P</span>
              </div>

              {/* Radar Graphic Simulation */}
              <div className="relative w-48 h-48 mx-auto rounded-full border-2 border-indigo-500/30 bg-slate-900/50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 scale-75" />
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 scale-50" />
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 scale-25" />
                
                {/* Center Node (Me) */}
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50 z-10" />

                {/* Neighbor Node Blips */}
                <div className="absolute top-8 right-12 w-3 h-3 rounded-full bg-indigo-400 shadow animate-ping" />
                <div className="absolute top-8 right-12 w-3 h-3 rounded-full bg-indigo-400 shadow" />

                <div className="absolute bottom-10 left-10 w-3 h-3 rounded-full bg-indigo-400 shadow animate-ping" />
                <div className="absolute bottom-10 left-10 w-3 h-3 rounded-full bg-indigo-400 shadow" />

                <div className="absolute bottom-6 right-10 w-3 h-3 rounded-full bg-emerald-400 shadow" />
              </div>

              {/* Discovered Peer Nodes List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Discovered Physical Peers ({nodes.length})
                </h4>
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{node.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                          {node.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Distance: ~{node.distanceMeters}m • Battery: {node.batteryLevel}%
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-indigo-400">
                        {node.rssi} dBm
                      </span>
                      <div className="text-[9px] text-slate-500">
                        {node.isDirectNeighbor ? 'Direct 1-Hop' : 'Multi-hop'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SCREEN 5: MAP & ALERT DETAILS ================= */}
          {currentScreen === 'MAP_DETAILS' && selectedAlert && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <button 
                  onClick={() => setCurrentScreen('HOME')}
                  className="p-1.5 bg-slate-900 rounded-lg text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-bold text-white text-sm">Disaster Incident Details</h3>
                  <p className="text-[10px] font-mono text-slate-400">ID: {selectedAlert.id}</p>
                </div>
              </div>

              {/* Simulated Tactical Map Canvas */}
              <div className="h-44 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between p-3">
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                
                <div className="flex justify-between items-start z-10">
                  <span className="bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-slate-800">
                    GPS LOCK: {selectedAlert.location.latitude.toFixed(4)}, {selectedAlert.location.longitude.toFixed(4)}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTriageBadge(selectedAlert.triageLevel)}`}>
                    {selectedAlert.triageLevel}
                  </span>
                </div>

                {/* Distress Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="w-8 h-8 rounded-full bg-red-600/30 border-2 border-red-500 animate-ping absolute" />
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-red-300 mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded">
                    {selectedAlert.category}
                  </span>
                </div>

                <div className="z-10 text-[10px] font-mono text-slate-400 bg-slate-950/80 p-1.5 rounded border border-slate-800">
                  📍 {selectedAlert.location.addressHint || 'Disaster Sector Coordinates'}
                </div>
              </div>

              {/* Alert Details Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Reported Situation:</span>
                  <p className="text-slate-200 mt-1 leading-relaxed">{selectedAlert.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500">Victim Name:</span>
                    <div className="font-semibold text-white">{selectedAlert.userName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <div className="font-semibold text-white font-mono">{selectedAlert.userPhone}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Blood Group:</span>
                    <div className="font-semibold text-red-400 font-mono">{selectedAlert.bloodGroup || 'Unknown'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Affected Headcount:</span>
                    <div className="font-semibold text-white">{selectedAlert.peopleCount} victims</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                  <span className="text-slate-300 font-semibold">Priority Triage Reason: </span>
                  {selectedAlert.priorityReason}
                </div>
              </div>
            </div>
          )}

          {/* ================= SCREEN 6: RESPONDER DASHBOARD (Req I) ================= */}
          {currentScreen === 'RESPONDER' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentScreen('HOME')}
                    className="p-1.5 bg-slate-900 rounded-lg text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-white text-sm">Emergency Responder Console</h3>
                </div>
                <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                  Tactical View
                </span>
              </div>

              {/* PIN Gate if not unlocked */}
              {!isResponderUnlocked ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center space-y-3">
                  <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Authorized Responder Access</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter Responder Officer PIN to unlock triage resolution tools.
                    </p>
                    <p className="text-[11px] font-mono text-indigo-400 mt-1">(Demo PIN: 9110)</p>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={responderPinInput}
                    onChange={(e) => setResponderPinInput(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="w-36 text-center text-lg tracking-widest bg-slate-950 border border-slate-800 rounded-lg py-1.5 text-white focus:outline-none focus:border-indigo-500 font-mono mx-auto block"
                  />
                  {responderPinError && (
                    <p className="text-xs text-red-400">{responderPinError}</p>
                  )}
                  <button
                    onClick={() => {
                      if (responderPinInput === '9110') {
                        setIsResponderUnlocked(true);
                        setResponderPinError('');
                      } else {
                        setResponderPinError('Invalid Officer PIN. Use 9110 for demo.');
                      }
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Authenticate Officer
                  </button>
                </div>
              ) : (
                /* Unlocked Responder View */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Active Incidents: {alerts.length}</span>
                    <button 
                      onClick={() => setIsResponderUnlocked(false)}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Lock Console
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {sortedAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTriageBadge(alert.triageLevel)}`}>
                            {alert.triageLevel} ({alert.priorityScore}pts)
                          </span>
                          <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                            Status: {alert.status}
                          </span>
                        </div>

                        <p className="text-xs text-white">{alert.message}</p>

                        <div className="text-[10px] font-mono text-slate-400">
                          Victim: {alert.userName} • {alert.userPhone}
                        </div>

                        {/* Status Transition Action Buttons */}
                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => handleUpdateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                            className={`py-1 rounded text-[10px] font-medium border ${
                              alert.status === 'ACKNOWLEDGED' 
                                ? 'bg-amber-600 text-white border-amber-500' 
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => handleUpdateAlertStatus(alert.id, 'DISPATCHED')}
                            className={`py-1 rounded text-[10px] font-medium border ${
                              alert.status === 'DISPATCHED' 
                                ? 'bg-indigo-600 text-white border-indigo-500' 
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            Dispatch Unit
                          </button>
                          <button
                            onClick={() => handleUpdateAlertStatus(alert.id, 'RESOLVED')}
                            className={`py-1 rounded text-[10px] font-medium border ${
                              alert.status === 'RESOLVED' 
                                ? 'bg-emerald-600 text-white border-emerald-500' 
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= SCREEN 7: OFFLINE QUEUE & CLOUD SYNC (Req H) ================= */}
          {currentScreen === 'SYNC_QUEUE' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentScreen('HOME')}
                    className="p-1.5 bg-slate-900 rounded-lg text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-white text-sm">Offline Queue & Cloud Sync</h3>
                </div>
                <span className="text-[10px] font-mono text-amber-400">SQLite Cache</span>
              </div>

              {/* Internet Uplink Simulator Toggle */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Simulated Internet Connection</div>
                  <div className="text-[10px] text-slate-400">Toggle Starlink / Restored 4G Cell Tower</div>
                </div>
                <button
                  onClick={() => setIsInternetOnline(!isInternetOnline)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isInternetOnline
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 shadow'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isInternetOnline ? 'ONLINE (4G/STARLINK)' : 'OFFLINE (AIRPLANE)'}
                </button>
              </div>

              {syncFeedback && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-indigo-500/30 text-xs font-mono text-indigo-300">
                  {syncFeedback}
                </div>
              )}

              {/* Trigger Cloud Upload Button */}
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Uploading to Firestore...' : 'REPLAY & SYNCHRONIZE QUEUE TO CLOUD'}
              </button>

              {/* Unsynced Queue List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Queued Records in SQLite
                </h4>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{alert.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({alert.category})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                        {alert.message}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      alert.syncState === 'CLOUD_SYNCED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alert.syncState}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SCREEN 8: USER PROFILE & SETTINGS ================= */}
          {currentScreen === 'PROFILE' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <button 
                  onClick={() => setCurrentScreen('HOME')}
                  className="p-1.5 bg-slate-900 rounded-lg text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-white text-sm">Emergency ICE Profile & Settings</h3>
              </div>

              {/* Profile Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">User Name</label>
                  <div className="text-white font-bold text-sm">{userProfile.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Contact Phone</label>
                    <div className="text-white font-mono">{userProfile.phone}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Blood Group</label>
                    <div className="text-red-400 font-bold font-mono">{userProfile.bloodGroup}</div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Medical ICE Alert</label>
                  <div className="text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 mt-1 font-mono text-[11px]">
                    {userProfile.medicalNotes}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Emergency Next of Kin (ICE)</label>
                  <div className="text-white font-medium">{userProfile.emergencyContactName}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{userProfile.emergencyContactPhone}</div>
                </div>
              </div>

              {/* Radio Hardware Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                <div className="font-semibold text-white">Hardware Radio Settings</div>
                
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>GPS Sensor Status:</span>
                  <button
                    onClick={() => setIsGpsLocked(!isGpsLocked)}
                    className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                      isGpsLocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isGpsLocked ? 'GPS HARDWARE LOCKED' : 'GPS SEARCHING'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Max Mesh Packet Hops:</span>
                  <span className="font-mono text-white font-bold">5 Hops</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Packet TTL:</span>
                  <span className="font-mono text-white font-bold">3600 seconds (1 hr)</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation Dock */}
        <div className="bg-slate-950 border-t border-slate-900 px-3 py-2 flex items-center justify-around z-30">
          <button
            onClick={() => setCurrentScreen('HOME')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
              currentScreen === 'HOME' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS</span>
          </button>

          <button
            onClick={() => setCurrentScreen('MESSAGES')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
              currentScreen === 'MESSAGES' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setCurrentScreen('RADAR')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
              currentScreen === 'RADAR' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Radar</span>
          </button>

          <button
            onClick={() => setCurrentScreen('RESPONDER')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
              currentScreen === 'RESPONDER' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Responder</span>
          </button>

          <button
            onClick={() => setCurrentScreen('SYNC_QUEUE')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
              currentScreen === 'SYNC_QUEUE' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Sync</span>
          </button>
        </div>

      </div>
    </div>
  );
};
