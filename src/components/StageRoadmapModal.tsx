import React, { useState } from 'react';
import { 
  CheckCircle2, Terminal, FolderTree, Cpu, Radio, 
  Database, Shield, Cloud, Smartphone, ChevronRight, 
  ExternalLink, Copy, Check
} from 'lucide-react';

interface Stage {
  number: number;
  title: string;
  badge: string;
  description: string;
  commands: string[];
  deliverableFiles: string[];
  testChecklist: string[];
}

const STAGES: Stage[] = [
  {
    number: 1,
    title: 'Environment Setup & Verification',
    badge: 'STAGE 1',
    description: 'Verify Flutter, Dart SDK, Android SDK, and create initial clean Flutter project.',
    commands: [
      '# 1. Run Flutter doctor in Windows PowerShell',
      'flutter doctor -v',
      '',
      '# 2. Create the production ResQMesh project',
      'flutter create --org com.emergency --platforms android resqmesh',
      'cd resqmesh',
      '',
      '# 3. Verify Android device connection',
      'flutter devices'
    ],
    deliverableFiles: ['pubspec.yaml', 'android/app/build.gradle'],
    testChecklist: [
      'Flutter doctor reports [✓] Android toolchain & [✓] Flutter SDK',
      'Physical Android phone is connected via USB with "USB Debugging" enabled',
      'Default counter app compiles and runs on physical phone via flutter run'
    ]
  },
  {
    number: 2,
    title: 'Core App Structure & Primary Screens',
    badge: 'STAGE 2',
    description: 'Set up navigation, 10 primary screens, responsive emergency layout, and state management.',
    commands: [
      '# Add provider state management',
      'flutter pub add provider uuid intl',
      'flutter run'
    ],
    deliverableFiles: [
      'lib/main.dart',
      'lib/screens/home_dashboard.dart',
      'lib/screens/sos_screen.dart',
      'lib/screens/responder_screen.dart'
    ],
    testChecklist: [
      'App launches into modern dark-mode emergency theme',
      'Navigation between Home, SOS, Messages, Radar, and Responder works smoothly',
      'Form validation prevents empty emergency submissions'
    ]
  },
  {
    number: 3,
    title: 'Local SQLite Storage & Offline Survival',
    badge: 'STAGE 3',
    description: 'Implement ACID-compliant local database so data survives battery loss or app restarts.',
    commands: [
      '# Install SQLite for Flutter',
      'flutter pub add sqflite path',
      'flutter run'
    ],
    deliverableFiles: [
      'lib/services/database_helper.dart',
      'lib/models/emergency_alert.dart'
    ],
    testChecklist: [
      'Create SOS alert while in Airplane Mode',
      'Force close the application completely',
      'Reopen the app: verify alert is still listed on Home Dashboard'
    ]
  },
  {
    number: 4,
    title: 'Firebase Project & Android Configuration',
    badge: 'STAGE 4',
    description: 'Provision Firebase Cloud Firestore and Authentication with secure rules.',
    commands: [
      '# Install Firebase packages',
      'flutter pub add firebase_core cloud_firestore firebase_auth',
      '# Configure android/app/google-services.json'
    ],
    deliverableFiles: [
      'android/app/google-services.json',
      'firestore.rules',
      'lib/services/cloud_sync_service.dart'
    ],
    testChecklist: [
      'Firebase initialization succeeds at app startup without crashing',
      'Firestore rules restrict unauthenticated responder updates'
    ]
  },
  {
    number: 5,
    title: 'Hardware GPS Location & Permissions',
    badge: 'STAGE 5',
    description: 'Capture exact latitude/longitude and handle user permission denial gracefully.',
    commands: [
      'flutter pub add geolocator permission_handler'
    ],
    deliverableFiles: [
      'android/app/src/main/AndroidManifest.xml',
      'lib/services/location_service.dart'
    ],
    testChecklist: [
      'App requests ACCESS_FINE_LOCATION at runtime',
      'GPS coordinates (lat, lon, accuracy) successfully attach to SOS alert payload',
      'Graceful fallback message when user denies permission'
    ]
  },
  {
    number: 6,
    title: 'Device-to-Device Mesh (Wi-Fi Direct / BLE)',
    badge: 'STAGE 6',
    description: 'Implement real P2P ad-hoc networking between two phones without internet or router.',
    commands: [
      'flutter pub add flutter_nearby_connections',
      'flutter run'
    ],
    deliverableFiles: [
      'lib/services/nearby_mesh_service.dart',
      'android/app/src/main/AndroidManifest.xml'
    ],
    testChecklist: [
      'Turn OFF Wi-Fi router internet and Mobile Data on Phone 1 and Phone 2',
      'Send SOS on Phone 1: Phone 2 receives alert via BLE/Wi-Fi Direct within 2-4 seconds',
      'Verify loop suppression: Phone 1 drops duplicate echo packet'
    ]
  },
  {
    number: 7,
    title: 'On-Device Edge Prioritization Engine',
    badge: 'STAGE 7',
    description: 'Deterministic START triage classification: keyword extraction, age penalty, victim count.',
    commands: [
      'flutter test test/mesh_edge_test.dart'
    ],
    deliverableFiles: [
      'lib/services/edge_prioritization_service.dart',
      'test/mesh_edge_test.dart'
    ],
    testChecklist: [
      'Automated unit tests pass with zero cloud calls',
      'Critical words (trapped, bleeding, infant) elevate score above 75 (RED Critical)',
      'Queue sorts active emergencies above minor requests'
    ]
  },
  {
    number: 8,
    title: 'Cloud Synchronization & Offline Queue',
    badge: 'STAGE 8',
    description: 'Store-and-forward gateway pattern with idempotent Firestore document merging.',
    commands: [
      'flutter run'
    ],
    deliverableFiles: [
      'lib/services/cloud_sync_service.dart',
      'lib/screens/sync_queue_screen.dart'
    ],
    testChecklist: [
      'Restore Wi-Fi internet on Phone 2 (Gateway node)',
      'Trigger cloud sync: local SQLite alerts upload to Firestore automatically',
      'Verify status updates from PENDING_LOCAL to CLOUD_SYNCED'
    ]
  },
  {
    number: 9,
    title: 'Responder Command View & Role Security',
    badge: 'STAGE 9',
    description: 'Authorized tactical triage console with status lifecycle and responder notes.',
    commands: [
      'flutter run'
    ],
    deliverableFiles: [
      'lib/screens/responder_screen.dart',
      'firestore.rules'
    ],
    testChecklist: [
      'Responder enters PIN 9110 to unlock incident triage console',
      'Status transitions from ACTIVE -> ACKNOWLEDGED -> DISPATCHED -> RESOLVED',
      'Audit log tracks responder name and timestamp'
    ]
  },
  {
    number: 10,
    title: 'Physical Device Testing & Release APK',
    badge: 'STAGE 10',
    description: 'Compile production release APK and perform live academic demonstration.',
    commands: [
      '# Run flutter analyzer for zero errors',
      'flutter analyze',
      '',
      '# Build release APK for Android',
      'flutter build apk --release --split-per-abi'
    ],
    deliverableFiles: [
      'build/app/outputs/flutter-apk/app-arm64-v8a-release.apk',
      'README.md'
    ],
    testChecklist: [
      'Zero static analysis warnings or errors',
      'Release APK builds successfully under 25 MB',
      'Installed on two physical phones for College Review demonstration'
    ]
  }
];

export const StageRoadmapModal: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<Stage>(STAGES[0]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopyCmd = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-base">Step-by-Step 10-Stage Development Roadmap</h3>
          <p className="text-xs text-slate-400">
            Systematic engineering pathway from Windows setup to physical Android device demonstration
          </p>
        </div>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 font-bold">
          CSE Academic Project Plan
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Left Stage Selector */}
        <div className="md:col-span-4 border-r border-slate-800 bg-slate-950/60 p-3 space-y-1 overflow-y-auto max-h-[520px]">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2 px-2">
            Execution Stages
          </div>

          {STAGES.map((stage) => {
            const isSelected = selectedStage.number === stage.number;
            return (
              <button
                key={stage.number}
                onClick={() => setSelectedStage(stage)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {stage.number}
                </span>
                <div className="truncate flex-1">
                  <div className="truncate font-semibold">{stage.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{stage.badge}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Stage Detail Panel */}
        <div className="md:col-span-8 p-5 space-y-5 bg-slate-950 overflow-y-auto max-h-[520px]">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {selectedStage.badge}
            </span>
            <h4 className="text-lg font-bold text-white mt-1">{selectedStage.title}</h4>
            <p className="text-xs text-slate-300 mt-1">{selectedStage.description}</p>
          </div>

          {/* Commands Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Windows PowerShell Commands
              </span>
              <button
                onClick={() => handleCopyCmd(selectedStage.commands.join('\n'))}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCmd ? 'Copied' : 'Copy Commands'}
              </button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-indigo-200 overflow-x-auto">
              <pre className="whitespace-pre leading-relaxed">{selectedStage.commands.join('\n')}</pre>
            </div>
          </div>

          {/* Deliverables & Test Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Target Source Files
              </span>
              <ul className="text-xs font-mono space-y-1 text-slate-300">
                {selectedStage.deliverableFiles.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 truncate">
                    <span className="text-indigo-400">📄</span>
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Verification Checklist
              </span>
              <ul className="text-xs space-y-1.5 text-slate-300">
                {selectedStage.testChecklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
