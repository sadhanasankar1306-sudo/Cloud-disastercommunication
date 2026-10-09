import React, { useState } from 'react';
import { 
  GraduationCap, HelpCircle, Layers, CheckCircle, 
  Search, Shield, Radio, Cpu, Database, ChevronDown, 
  ChevronUp, Terminal, Presentation, PlayCircle 
} from 'lucide-react';
import { VIVA_QUESTIONS, VivaQuestion } from '../data/flutterCodebase';

export const AcademicVivaKit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SLIDES' | 'VIVA' | 'ARCHITECTURE' | 'COMPARISON' | 'DEMO_SCRIPT'>('SLIDES');
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const SLIDES = [
    {
      title: "ResQMesh: Cloud-Edge Emergency Communication System",
      subtitle: "Internet-Independent Disaster Response Architecture for Humanitarian Triage",
      speakerNotes: "Begin by introducing yourself and the core thesis: When base stations and electrical grids collapse during earthquakes or floods, conventional mobile apps fail. ResQMesh introduces a 3-tier mesh architecture.",
      bullets: [
        "Domain: Mobile Ad-Hoc Networks (MANET), Edge Computing & Disaster Informatics",
        "Problem: Cell tower outages isolate victims from first responders during first 72 critical hours",
        "Key Innovation: Combines on-device NLP Edge Prioritization + P2P Mesh Routing (Wi-Fi Direct & BLE) + Gateway Store-and-Forward Cloud Synchronization",
        "Technology Stack: Flutter (Dart), SQLite (sqflite), Google Nearby Connections, Firebase Firestore"
      ],
      tag: "SLIDE 1 • TITLE & INTRODUCTION"
    },
    {
      title: "The Problem & Critical Gap in Existing Solutions",
      subtitle: "Why popular apps and naive Firebase implementations fail in disasters",
      speakerNotes: "Emphasize this distinction: Firebase offline persistence does NOT communicate between two disconnected phones. It only caches locally on ONE device.",
      bullets: [
        "Single-Point of Failure: Cloud-only apps (WhatsApp, Disaster Management portals) require 4G/5G tower backhaul",
        "The 'Offline Persistence' Fallacy: Firebase cache is single-device local persistence; it cannot bridge disconnected victims",
        "Lack of Local Triage: Raw unranked distress calls overwhelm response centers without edge categorization",
        "Battery & Bandwidth Constraints: High-power cellular search rapidly drains battery; need duty-cycled low-power P2P discovery"
      ],
      tag: "SLIDE 2 • LITERATURE GAP & MOTIVATION"
    },
    {
      title: "ResQMesh 3-Tier System Architecture",
      subtitle: "Decoupling survival communication from cellular telecommunications",
      speakerNotes: "Walk through Tier 1 (Device Edge), Tier 2 (D2D Mesh Transport), and Tier 3 (Cloud Store-and-Forward Gateway). Point to the flow diagram.",
      bullets: [
        "Tier 1 [Device Edge]: SQLite ACID persistence + On-device START Triage Keyword Classifier (<5ms latency)",
        "Tier 2 [Ad-hoc D2D Mesh]: Google Nearby Connections (P2P_CLUSTER: Wi-Fi Direct + BLE) multi-hop transport",
        "Tier 3 [Gateway Cloud Sync]: Opportunistic satellite/cellular bridging to Firebase Cloud Firestore",
        "Loop Suppression: Local seen_packets SQLite cache prevents broadcast storms; TTL & Max Hops (5) prevent forwarding loops"
      ],
      tag: "SLIDE 3 • ARCHITECTURE DESIGN"
    },
    {
      title: "On-Device Edge Prioritization Algorithm",
      subtitle: "Deterministic disaster triage executed directly on smartphone CPU",
      speakerNotes: "Explain that we use transparent rule-based NLP rather than unverified cloud AI models, guaranteeing 100% offline reliability.",
      bullets: [
        "START Protocol Implementation: Simple Triage and Rapid Treatment standard",
        "Hazard Weights: Trapped (+40), Medical (+35), Collapse (+35), Fire (+30), Flood (+30)",
        "Keyword Urgency Tokenizer: Physical entrapment (+45), Severe hemorrhage/bleeding (+40), Infant/Pediatric (+35)",
        "Headcount Multiplier: +8 pts per additional victim (capped at +24) + GPS precision bonus (+5)",
        "Deterministic Output: 75+ = CRITICAL RED (Immediate), 50-74 = URGENT YELLOW, 30-49 = MODERATE GREEN"
      ],
      tag: "SLIDE 4 • ALGORITHMIC CONTRIBUTION"
    },
    {
      title: "Ad-Hoc Wireless Mesh Protocol & Routing",
      subtitle: "Peer discovery, packet framing, and loop prevention",
      speakerNotes: "Explain the packet structure and how the seen_packets SQLite cache completely eliminates broadcast storms.",
      bullets: [
        "Packet Structure: { packetId, originNodeId, targetNodeId, hopCount, maxHops, pathTrace, ttl, payload }",
        "Broadcast Storm Mitigation: Hash of packetId stored in seen_packets table; duplicates dropped immediately",
        "Forwarding Bounds: If hopCount + 1 < maxHops (5), packet is re-broadcast to connected neighbors excluding sender",
        "Radio Layer: BLE for low-power continuous peer discovery; Wi-Fi Direct for high-bandwidth telemetry and payload transport"
      ],
      tag: "SLIDE 5 • NETWORKING & PROTOCOL"
    },
    {
      title: "Cloud Synchronization & Responder Security",
      subtitle: "Store-and-forward gateway pattern and role-based incident control",
      speakerNotes: "Conclude with how the data reaches emergency headquarters and how security rules prevent unauthorized tampering.",
      bullets: [
        "Store-and-Forward: When any node reaches Starlink/4G, CloudSyncService triggers idempotent merge",
        "Idempotency Guarantee: Document ID in Firestore equals alert UUID (doc(id).set(..., merge: true))",
        "Firestore Security Rules: Anyone can create alerts; only authenticated Responders can update triage status",
        "Audit Trail: Complete trace of intermediate relay nodes recorded in pathTrace array"
      ],
      tag: "SLIDE 6 • CLOUD & ACCESS CONTROL"
    }
  ];

  const filteredQuestions = VIVA_QUESTIONS.filter(q => {
    const matchesCat = selectedCategory === 'ALL' || q.category === selectedCategory;
    const matchesQuery = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Academic Review & Viva Voce Companion</h3>
            <p className="text-xs text-slate-400">Project defense materials for CSE Final/Mid-term Evaluation</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('SLIDES')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'SLIDES' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Slide Deck (Presentation)</span>
          </button>
          <button
            onClick={() => setActiveTab('VIVA')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'VIVA' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Viva Q&A
          </button>
          <button
            onClick={() => setActiveTab('ARCHITECTURE')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'ARCHITECTURE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'COMPARISON' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wireless Protocols Matrix
          </button>
          <button
            onClick={() => setActiveTab('DEMO_SCRIPT')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'DEMO_SCRIPT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5-Min Demo Script
          </button>
        </div>
      </div>

      {/* Tab 0: Presentation Slide Deck */}
      {activeTab === 'SLIDES' && (
        <div className="p-5 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 min-h-[380px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Top Tag & Slide Number */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                  {SLIDES[currentSlide].tag}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Slide {currentSlide + 1} of {SLIDES.length}
                </span>
              </div>

              {/* Slide Content */}
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {SLIDES[currentSlide].title}
              </h3>
              <p className="text-xs sm:text-sm text-indigo-300 font-medium mt-1 mb-5">
                {SLIDES[currentSlide].subtitle}
              </p>

              <div className="space-y-3">
                {SLIDES[currentSlide].bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: Speaker Notes & Navigation */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex-1">
                <strong className="text-amber-400 font-mono text-[11px] block">🎤 Spoken Cue for Evaluators:</strong>
                <span className="text-[11px] italic font-sans">{SLIDES[currentSlide].speakerNotes}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    currentSlide === 0
                      ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  }`}
                >
                  Previous
                </button>
                <button
                  disabled={currentSlide === SLIDES.length - 1}
                  onClick={() => setCurrentSlide(prev => Math.min(SLIDES.length - 1, prev + 1))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
                    currentSlide === SLIDES.length - 1
                      ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  Next Slide ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Viva Q&A */}
      {activeTab === 'VIVA' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search viva questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-[11px] font-mono">
              {['ALL', 'NETWORKING', 'ARCHITECTURE', 'EDGE_COMPUTING', 'SECURITY', 'ACADEMIC_DEFENSE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded border transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion list */}
          <div className="space-y-2.5">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedId === q.id;
              return (
                <div
                  key={q.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs font-mono font-bold text-indigo-400 mt-0.5">
                        Q{q.id}.
                      </span>
                      <div>
                        <div className="font-semibold text-white text-xs sm:text-sm">
                          {q.question}
                        </div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 mt-1 inline-block">
                          Category: {q.category}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-900 bg-slate-900/30 text-xs text-slate-300 leading-relaxed font-sans">
                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300/90 leading-normal">
                        <strong className="text-emerald-400 block mb-1">High-Scoring Viva Answer:</strong>
                        {q.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: System Architecture */}
      {activeTab === 'ARCHITECTURE' && (
        <div className="p-5 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              3-Tier ResQMesh Cloud-Edge-D2D Architecture
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              ResQMesh decouples survival communication from telecommunications infrastructure through three distinct functional tiers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tier 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 inline-block">
                  TIER 1: DEVICE EDGE LAYER
                </div>
                <h5 className="font-semibold text-white text-xs">On-Device Edge Computing</h5>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  <li>Embedded SQLite (<code className="text-indigo-300">sqflite</code>) offline ACID storage</li>
                  <li>START Triage Rule Engine (&lt;5ms latency)</li>
                  <li>Natural Language Emergency Keyword Tokenizer</li>
                  <li>Hardware GPS Coordinates & Accuracy Locking</li>
                </ul>
              </div>

              {/* Tier 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block">
                  TIER 2: AD-HOC D2D MESH
                </div>
                <h5 className="font-semibold text-white text-xs">Wireless Mesh Transport</h5>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  <li>Android Nearby Connections (Wi-Fi Direct + BLE)</li>
                  <li>Multi-Hop Forwarding (TTL & Max Hops = 5)</li>
                  <li><code className="text-indigo-300">seen_packets</code> Cache to prevent broadcast storms</li>
                  <li>Zero cellular base station / router requirement</li>
                </ul>
              </div>

              {/* Tier 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
                  TIER 3: CLOUD GATEWAY
                </div>
                <h5 className="font-semibold text-white text-xs">Centralized Coordination</h5>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  <li>Firebase Cloud Firestore document collection</li>
                  <li>Store-and-Forward Gateway Bridging</li>
                  <li>Idempotent Upsert via Alert UUID (<code className="text-indigo-300">merge: true</code>)</li>
                  <li>Role-Based Access Control for NDRF Responders</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Wireless Protocols Matrix */}
      {activeTab === 'COMPARISON' && (
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <th className="p-3">Parameter</th>
                  <th className="p-3 text-indigo-400">Wi-Fi Direct (P2P)</th>
                  <th className="p-3 text-indigo-400">BLE (Bluetooth LE)</th>
                  <th className="p-3 text-slate-400">LoRa Radio (SX1276)</th>
                  <th className="p-3 text-slate-400">Cellular (4G/5G)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                <tr className="bg-slate-900/40">
                  <td className="p-3 font-semibold text-white">Disaster Independence</td>
                  <td className="p-3 text-emerald-400 font-semibold">100% Autonomous</td>
                  <td className="p-3 text-emerald-400 font-semibold">100% Autonomous</td>
                  <td className="p-3 text-emerald-400 font-semibold">100% Autonomous</td>
                  <td className="p-3 text-red-400">Fails on tower outage</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Smartphone Hardware</td>
                  <td className="p-3 text-emerald-400">Native Android built-in</td>
                  <td className="p-3 text-emerald-400">Native Android built-in</td>
                  <td className="p-3 text-amber-400">Requires external USB/ESP32</td>
                  <td className="p-3 text-emerald-400">Native built-in</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-3 font-semibold text-white">Physical Range</td>
                  <td className="p-3">50 - 100 meters</td>
                  <td className="p-3">10 - 30 meters</td>
                  <td className="p-3 text-emerald-400 font-bold">2 - 10 kilometers</td>
                  <td className="p-3">1 - 5 km (Tower line of sight)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Bandwidth / Speed</td>
                  <td className="p-3 text-emerald-400 font-bold">High (~54 Mbps)</td>
                  <td className="p-3">Low-Medium (~1 Mbps)</td>
                  <td className="p-3 text-red-400">Very Low (0.3 - 5 kbps)</td>
                  <td className="p-3">Very High (100+ Mbps)</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-3 font-semibold text-white">Power Consumption</td>
                  <td className="p-3 text-amber-400">Moderate</td>
                  <td className="p-3 text-emerald-400 font-bold">Ultra Low</td>
                  <td className="p-3 text-emerald-400">Ultra Low</td>
                  <td className="p-3">High during cell search</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">ResQMesh Role</td>
                  <td className="p-3 text-indigo-300 font-semibold">Payload & Map transfer</td>
                  <td className="p-3 text-indigo-300 font-semibold">Low-power peer discovery</td>
                  <td className="p-3 text-slate-400">Long-distance telemetry (Future)</td>
                  <td className="p-3 text-slate-400">Gateway to Cloud Firestore</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: 5-Minute Demo Script */}
      {activeTab === 'DEMO_SCRIPT' && (
        <div className="p-5 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs leading-relaxed">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Presentation className="w-4 h-4" />
              <span>5-Minute Demonstration Script for College Review Panel</span>
            </div>

            <div className="space-y-3 font-mono text-[11px] text-slate-300">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <strong className="text-white block mb-1">Minute 1: The Problem & Disaster Architecture</strong>
                "Respected panel, during catastrophic disasters like floods and earthquakes, cellular towers and power grids collapse within minutes. While popular apps claim offline capability via Firebase persistence, Firebase persistence only caches data to one phone; it cannot transmit data between two disconnected phones without internet. ResQMesh solves this through a dual-stack Cloud-Edge Architecture."
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <strong className="text-white block mb-1">Minute 2: Real Edge Computing Demo</strong>
                "Notice our Edge Prioritization Engine. As a victim enters 'trapped under concrete with severe bleeding', our on-device NLP tokenizer detects critical keywords locally. Without touching any cloud server, it computes a START priority score of 92/100 and assigns RED Critical triage. This guarantees immediate prioritization on edge devices."
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <strong className="text-white block mb-1">Minute 3: Multi-Hop D2D Mesh Networking</strong>
                "Now, we demonstrate offline broadcast. When the SOS button is pressed, the alert writes immediately to SQLite (so a battery crash won't lose data), and generates a Mesh Packet. Using Google Nearby Connections, the packet hops from Victim Node Alpha to Volunteer Relay Bravo, to SkyMesh Drone Relay, and reaches NDRF Incident Command. We demonstrate loop suppression using our seen_packets SQLite cache so broadcast loops are eliminated."
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <strong className="text-white block mb-1">Minute 4: Gateway Cloud Synchronization & Responder Triage</strong>
                "When any edge node (like the NDRF command post) connects to satellite or restored cell data, our CloudSyncService detects internet connectivity, reconciles offline records, and executes idempotent upserts to Firebase Firestore. Responders unlock the tactical console using PIN 9110 to acknowledge, dispatch, and resolve incidents."
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
