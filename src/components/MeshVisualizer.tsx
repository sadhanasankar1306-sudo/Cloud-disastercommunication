import React, { useState, useEffect } from 'react';
import { 
  Radio, Wifi, ShieldAlert, Cpu, Database, CloudUpload, 
  ArrowRight, Repeat, CheckCircle, AlertOctagon, RefreshCw, Zap, Activity
} from 'lucide-react';
import { meshService } from '../services/meshNetwork';
import { MeshNode, MeshPacket } from '../types';

export const MeshVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<MeshNode[]>(meshService.getNodes());
  const [packetLog, setPacketLog] = useState<MeshPacket[]>(meshService.getPacketLog());
  const [activeHop, setActiveHop] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string>('Mesh topology ready. 4 nodes discovered via BLE/Wi-Fi Direct ad-hoc clustering.');

  useEffect(() => {
    const unsubTopology = meshService.subscribeTopology((updatedNodes) => {
      setNodes([...updatedNodes]);
    });
    const unsubPackets = meshService.subscribePackets((packet) => {
      setPacketLog(prev => [packet, ...prev.slice(0, 15)]);
    });

    return () => {
      unsubTopology();
      unsubPackets();
    };
  }, []);

  const triggerMeshSimulatedBurst = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveHop(0);
    setLastActionMessage('Node Alpha (Victim): Broadcasting raw emergency packet PKT-992... Radio: Wi-Fi P2P / BLE.');

    // Step 1: Hop 1
    setTimeout(() => {
      setActiveHop(1);
      setLastActionMessage('Node Bravo (Relay): Ingested packet. Verified not in seen_cache. Incremented hopCount: 1. Forwarding...');
    }, 1200);

    // Step 2: Hop 2
    setTimeout(() => {
      setActiveHop(2);
      setLastActionMessage('SkyMesh Drone Relay: Received packet from Bravo. HopCount: 2. Forwarding to Base Station...');
    }, 2400);

    // Step 3: Hop 3 (Incident Post with Satellite Uplink)
    setTimeout(() => {
      setActiveHop(3);
      setLastActionMessage('NDRF Incident Command Post: Ingested packet. Detecting active Satellite Starlink Uplink. Syncing to Cloud Firestore!');
    }, 3600);

    // Step 4: Complete
    setTimeout(() => {
      setActiveHop(-1);
      setIsSimulating(false);
      setLastActionMessage('Success: End-to-end multi-hop delivery complete! Zero internet on victim phone -> Reached cloud through edge relays.');
    }, 5000);
  };

  const getNodeColor = (node: MeshNode, index: number) => {
    if (activeHop === index) return 'border-amber-400 bg-amber-500/20 shadow-amber-500/50 shadow-lg animate-pulse';
    if (node.role === 'VICTIM') return 'border-red-500/60 bg-red-950/40 text-red-300';
    if (node.role === 'RELAY') return 'border-indigo-500/60 bg-indigo-950/40 text-indigo-300';
    return 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Multi-Node Disaster Mesh Simulator</h3>
            <p className="text-xs text-slate-400">Physical D2D Protocol Simulation: Loop Suppression, TTL, and Gateway Bridging</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerMeshSimulatedBurst}
            disabled={isSimulating}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
              isSimulating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {isSimulating ? 'Propagating Packet...' : 'Simulate SOS Packet Multi-Hop'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs font-mono text-indigo-300 flex items-center gap-2">
        <Activity className="w-4 h-4 text-indigo-400 shrink-0 animate-spin" />
        <span className="truncate">{lastActionMessage}</span>
      </div>

      {/* Visual Network Topology Canvas */}
      <div className="relative bg-slate-950 border border-slate-800/80 rounded-xl p-6 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4 z-10">
          {nodes.map((node, index) => (
            <div
              key={node.id}
              className={`p-4 rounded-xl border transition-all duration-300 relative ${getNodeColor(node, index)}`}
            >
              {/* Active hop indicator beacon */}
              {activeHop === index && (
                <div className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce shadow">
                  Active Hop #{index}
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  node.role === 'VICTIM' ? 'bg-red-500/20 text-red-400' :
                  node.role === 'RELAY' ? 'bg-indigo-500/20 text-indigo-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {node.role}
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  {node.rssi} dBm
                </span>
              </div>

              <h4 className="font-semibold text-white text-sm mb-1">{node.name}</h4>
              <p className="text-[11px] text-slate-400 mb-3 font-mono">ID: {node.id}</p>

              <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-800/60">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Range:</span>
                  <span className="font-mono">{node.distanceMeters}m</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Battery:</span>
                  <span className="font-mono">{node.batteryLevel}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500">Cloud Uplink:</span>
                  {node.hasInternetUplink ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10px]">
                      <CloudUpload className="w-3 h-3" /> ONLINE (STARLINK)
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono text-[10px]">OFFLINE (ISOLATED)</span>
                  )}
                </div>
              </div>

              {/* Arrow Connector to next node */}
              {index < nodes.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-slate-900 border border-slate-700 text-slate-400 rounded-full p-1 shadow">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Victim Node (No Internet)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Multi-hop Relay (No Internet)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Gateway Node (Cloud Uplink)
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Strategy: Google Nearby Connections (P2P_CLUSTER)
          </span>
        </div>
      </div>

      {/* Protocol Packet Telemetry Stream */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ad-hoc Packet Telemetry & Loop Suppression Log
          </h4>
          <span className="text-[11px] font-mono text-emerald-400">
            seen_cache: {packetLog.length} unique packet IDs indexed
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto font-mono text-[11px]">
          {packetLog.length > 0 ? (
            packetLog.slice(0, 5).map((pkt, i) => (
              <div key={i} className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-indigo-400 font-bold">{pkt.packetId}</span>
                  <span className="text-slate-400 text-[10px]">
                    Type: <span className="text-amber-300">{pkt.payloadType}</span> • TTL: {pkt.ttlSeconds}s
                  </span>
                </div>
                <div className="text-slate-400 text-[10px] flex items-center gap-2">
                  <span>Hops: <b className="text-white">{pkt.hopCount}</b> / {pkt.maxHops}</span>
                  <span>•</span>
                  <span className="text-slate-300 truncate">
                    Path Trace: {pkt.pathTrace.join(' ➔ ')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-center py-4 italic">No packets in telemetry buffer yet. Click "Simulate SOS Packet Multi-Hop" above.</div>
          )}
        </div>
      </div>
    </div>
  );
};
