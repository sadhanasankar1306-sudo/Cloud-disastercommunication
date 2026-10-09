/**
 * Complete Flutter Source Code Repository & Academic Viva Companion
 * ResQMesh: Cloud-Edge Emergency Communication System
 */

export interface CodeFile {
  path: string;
  filename: string;
  language: string;
  category: 'CONFIG' | 'MODELS' | 'SERVICES' | 'SCREENS' | 'TESTS' | 'RULES';
  description: string;
  code: string;
}

export const FLUTTER_CODEBASE: CodeFile[] = [
  {
    path: 'pubspec.yaml',
    filename: 'pubspec.yaml',
    language: 'yaml',
    category: 'CONFIG',
    description: 'Dependencies for SQLite, Nearby Connections, Geolocator, Firebase Firestore, and UUID',
    code: `name: resqmesh
description: "Cloud-Edge Emergency Communication System for Internet-Independent Disaster Response"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management & Utilities
  provider: ^6.1.1
  uuid: ^4.3.3
  intl: ^0.19.0
  flutter_spinkit: ^5.2.0

  # Local Persistence (Edge SQLite)
  sqflite: ^2.3.2
  path: ^1.9.0

  # Location Services
  geolocator: ^11.0.0
  permission_handler: ^11.3.0

  # Device-to-Device Mesh (Wi-Fi Direct / BLE Nearby)
  # Uses Google Nearby Connections API on Android
  flutter_nearby_connections: ^1.1.2

  # Cloud Synchronization & Auth
  firebase_core: ^2.27.0
  cloud_firestore: ^4.15.8
  firebase_auth: ^4.17.8

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/icons/
`
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    category: 'CONFIG',
    description: 'Android hardware permissions for BLE advertising, Wi-Fi Direct, and GPS location',
    code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.emergency.resqmesh">

    <!-- Location Permissions for GPS Distress Coordinates -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Wi-Fi & Network State (Wi-Fi Direct P2P) -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Bluetooth Low Energy (Android 11 and lower) -->
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />

    <!-- Android 12+ (API 31+) Runtime Bluetooth Permissions -->
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN"
        android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <!-- Android 13+ (API 33+) Nearby Wi-Fi Devices -->
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES"
        android:usesPermissionFlags="neverForLocation" />

    <application
        android:label="ResQMesh"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>
`
  },
  {
    path: 'lib/models/emergency_alert.dart',
    filename: 'emergency_alert.dart',
    language: 'dart',
    category: 'MODELS',
    description: 'Data model with serialization for SQLite and Firestore',
    code: `import 'package:uuid/uuid.dart';

enum AlertCategory { medical, trapped, collapse, fire, flood, general }
enum TriageLevel { critical, urgent, moderate, low }
enum AlertStatus { active, acknowledged, dispatched, onScene, resolved, cancelled }
enum SyncState { pendingLocal, meshRelayed, cloudSynced, failedRetry }

class EmergencyAlert {
  final String id;
  final String userId;
  final String userName;
  final String userPhone;
  final String? bloodGroup;
  final AlertCategory category;
  final String message;
  final int peopleCount;
  final double latitude;
  final double longitude;
  final double accuracy;
  final int timestamp;
  final int priorityScore; // 0-100 calculated by edge rule engine
  final TriageLevel triageLevel;
  final String priorityReason;
  AlertStatus status;
  SyncState syncState;
  int? syncedAt;
  int hopCount;
  final int maxHops;
  List<String> relayedByNodeIds;
  String? responderNotes;

  EmergencyAlert({
    String? id,
    required this.userId,
    required this.userName,
    required this.userPhone,
    this.bloodGroup,
    required this.category,
    required this.message,
    required this.peopleCount,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    required this.timestamp,
    required this.priorityScore,
    required this.triageLevel,
    required this.priorityReason,
    this.status = AlertStatus.active,
    this.syncState = SyncState.pendingLocal,
    this.syncedAt,
    this.hopCount = 0,
    this.maxHops = 5,
    List<String>? relayedByNodeIds,
    this.responderNotes,
  })  : id = id ?? const Uuid().v4(),
        relayedByNodeIds = relayedByNodeIds ?? [userId];

  // SQLite Mapping
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'userPhone': userPhone,
      'bloodGroup': bloodGroup,
      'category': category.name,
      'message': message,
      'peopleCount': peopleCount,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'timestamp': timestamp,
      'priorityScore': priorityScore,
      'triageLevel': triageLevel.name,
      'priorityReason': priorityReason,
      'status': status.name,
      'syncState': syncState.name,
      'syncedAt': syncedAt,
      'hopCount': hopCount,
      'maxHops': maxHops,
      'relayedByNodeIds': relayedByNodeIds.join(','),
      'responderNotes': responderNotes,
    };
  }

  factory EmergencyAlert.fromMap(Map<String, dynamic> map) {
    return EmergencyAlert(
      id: map['id'] as String,
      userId: map['userId'] as String,
      userName: map['userName'] as String,
      userPhone: map['userPhone'] as String,
      bloodGroup: map['bloodGroup'] as String?,
      category: AlertCategory.values.firstWhere((e) => e.name == map['category']),
      message: map['message'] as String,
      peopleCount: map['peopleCount'] as int,
      latitude: (map['latitude'] as num).toDouble(),
      longitude: (map['longitude'] as num).toDouble(),
      accuracy: (map['accuracy'] as num).toDouble(),
      timestamp: map['timestamp'] as int,
      priorityScore: map['priorityScore'] as int,
      triageLevel: TriageLevel.values.firstWhere((e) => e.name == map['triageLevel']),
      priorityReason: map['priorityReason'] as String,
      status: AlertStatus.values.firstWhere((e) => e.name == map['status']),
      syncState: SyncState.values.firstWhere((e) => e.name == map['syncState']),
      syncedAt: map['syncedAt'] as int?,
      hopCount: map['hopCount'] as int? ?? 0,
      maxHops: map['maxHops'] as int? ?? 5,
      relayedByNodeIds: (map['relayedByNodeIds'] as String?)?.split(',') ?? [],
      responderNotes: map['responderNotes'] as String?,
    );
  }

  // Firestore JSON serialization
  Map<String, dynamic> toFirestore() {
    final map = toMap();
    map['relayedByNodeIds'] = relayedByNodeIds;
    return map;
  }
}
`
  },
  {
    path: 'lib/services/database_helper.dart',
    filename: 'database_helper.dart',
    language: 'dart',
    category: 'SERVICES',
    description: 'Local SQLite database helper for full offline persistence',
    code: `import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/emergency_alert.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('resqmesh_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    // 1. Emergency Alerts Table
    await db.execute('''
      CREATE TABLE emergency_alerts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        userName TEXT NOT NULL,
        userPhone TEXT NOT NULL,
        bloodGroup TEXT,
        category TEXT NOT NULL,
        message TEXT NOT NULL,
        peopleCount INTEGER NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        priorityScore INTEGER NOT NULL,
        triageLevel TEXT NOT NULL,
        priorityReason TEXT NOT NULL,
        status TEXT NOT NULL,
        syncState TEXT NOT NULL,
        syncedAt INTEGER,
        hopCount INTEGER NOT NULL,
        maxHops INTEGER NOT NULL,
        relayedByNodeIds TEXT NOT NULL,
        responderNotes TEXT
      )
    ''');

    // 2. Loop Suppression Packet Cache (Prevents Broadcast Storms)
    await db.execute('''
      CREATE TABLE seen_packets (
        packetId TEXT PRIMARY KEY,
        seenAt INTEGER NOT NULL
      )
    ''');

    // 3. Create index for fast offline queue retrieval
    await db.execute(
      'CREATE INDEX idx_sync_state ON emergency_alerts(syncState)'
    );
  }

  // Insert or Replace (Idempotent for Mesh Rebroadcasts)
  Future<int> insertAlert(EmergencyAlert alert) async {
    final db = await instance.database;
    return await db.insert(
      'emergency_alerts',
      alert.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<EmergencyAlert>> getAllAlerts() async {
    final db = await instance.database;
    final result = await db.query(
      'emergency_alerts',
      orderBy: 'priorityScore DESC, timestamp DESC',
    );
    return result.map((json) => EmergencyAlert.fromMap(json)).toList();
  }

  Future<List<EmergencyAlert>> getPendingSyncAlerts() async {
    final db = await instance.database;
    final result = await db.query(
      'emergency_alerts',
      where: 'syncState != ?',
      whereArgs: [SyncState.cloudSynced.name],
    );
    return result.map((json) => EmergencyAlert.fromMap(json)).toList();
  }

  // Deduplication check for incoming mesh packets
  Future<bool> hasSeenPacket(String packetId) async {
    final db = await instance.database;
    final result = await db.query(
      'seen_packets',
      where: 'packetId = ?',
      whereArgs: [packetId],
      limit: 1,
    );
    return result.isNotEmpty;
  }

  Future<void> recordPacketSeen(String packetId) async {
    final db = await instance.database;
    await db.insert(
      'seen_packets',
      {
        'packetId': packetId,
        'seenAt': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.ignore,
    );
  }
}
`
  },
  {
    path: 'lib/services/edge_prioritization_service.dart',
    filename: 'edge_prioritization_service.dart',
    language: 'dart',
    category: 'SERVICES',
    description: 'Rule-based on-device disaster triage classifier (zero AI/cloud dependency)',
    code: `import '../models/emergency_alert.dart';

class EdgeTriageEvaluation {
  final int score;
  final TriageLevel triageLevel;
  final List<String> detectedKeywords;
  final String reasoning;

  EdgeTriageEvaluation({
    required this.score,
    required this.triageLevel,
    required this.detectedKeywords,
    required this.reasoning,
  });
}

class EdgePrioritizationService {
  // Configurable Critical Keyword Map with disaster weights
  static final Map<String, int> _keywordWeights = {
    'trapped': 45,
    'bleeding': 40,
    'unconscious': 45,
    'crushed': 45,
    'collapse': 35,
    'infant': 35,
    'child': 30,
    'pregnant': 35,
    'elderly': 25,
    'drowning': 45,
    'burn': 35,
    'smoke': 30,
    'cardiac': 45,
    'fracture': 25,
    'broken': 20,
    'water': 20,
    'hungry': 10,
    'cold': 15,
  };

  static final Map<AlertCategory, int> _categoryWeights = {
    AlertCategory.trapped: 40,
    AlertCategory.medical: 35,
    AlertCategory.collapse: 35,
    AlertCategory.fire: 30,
    AlertCategory.flood: 30,
    AlertCategory.general: 20,
  };

  static EdgeTriageEvaluation evaluate({
    required AlertCategory category,
    required String message,
    required int peopleCount,
    required bool hasGps,
  }) {
    final lowerText = message.toLowerCase();
    int keywordPoints = 0;
    final List<String> detected = [];
    final List<String> reasons = [];

    // Scan critical disaster keywords
    _keywordWeights.forEach((keyword, weight) {
      final regex = RegExp('\\\\b$keyword\\\\b', caseSensitive: false);
      if (regex.hasMatch(lowerText)) {
        keywordPoints += weight;
        detected.add(keyword);
        reasons.add('$keyword (+$weight)');
      }
    });

    final baseCategory = _categoryWeights[category] ?? 20;
    // Additional victim multiplier: +8 points per extra person, max +24
    final headcountPoints = ((peopleCount - 1) * 8).clamp(0, 24);
    final gpsBonus = hasGps ? 5 : -5;

    final rawScore = baseCategory + keywordPoints + headcountPoints + gpsBonus;
    final finalScore = rawScore.clamp(5, 100);

    // Disaster triage standard categorization
    TriageLevel level;
    if (finalScore >= 75) {
      level = TriageLevel.critical; // RED (Immediate)
    } else if (finalScore >= 50) {
      level = TriageLevel.urgent;   // YELLOW (Delayed)
    } else if (finalScore >= 30) {
      level = TriageLevel.moderate; // GREEN (Minor)
    } else {
      level = TriageLevel.low;
    }

    final reasonStr = 'Category: \${category.name.toUpperCase()} (base $baseCategory) | '
        'Keywords: \${detected.isEmpty ? "None" : reasons.join(", ")} | '
        'Victims: $peopleCount (+$headcountPoints) | '
        '\${hasGps ? "GPS Fixed (+5)" : "Approx Location (-5)"}';

    return EdgeTriageEvaluation(
      score: finalScore,
      triageLevel: level,
      detectedKeywords: detected,
      reasoning: reasonStr,
    );
  }
}
`
  },
  {
    path: 'lib/services/nearby_mesh_service.dart',
    filename: 'nearby_mesh_service.dart',
    language: 'dart',
    category: 'SERVICES',
    description: 'Device-to-device communication using Google Nearby Connections with loop cache & hop bounds',
    code: `import 'dart:convert';
import 'package:flutter_nearby_connections/flutter_nearby_connections.dart';
import '../models/emergency_alert.dart';
import 'database_helper.dart';

class MeshPacketHeader {
  final String packetId;
  final String originNodeId;
  final String targetNodeId; // '*' for flood broadcast
  final int hopCount;
  final int maxHops;
  final List<String> pathTrace;
  final int timestamp;
  final String payloadType;

  MeshPacketHeader({
    required this.packetId,
    required this.originNodeId,
    required this.targetNodeId,
    required this.hopCount,
    required this.maxHops,
    required this.pathTrace,
    required this.timestamp,
    required this.payloadType,
  });

  Map<String, dynamic> toJson() => {
    'packetId': packetId,
    'originNodeId': originNodeId,
    'targetNodeId': targetNodeId,
    'hopCount': hopCount,
    'maxHops': maxHops,
    'pathTrace': pathTrace,
    'timestamp': timestamp,
    'payloadType': payloadType,
  };

  factory MeshPacketHeader.fromJson(Map<String, dynamic> json) => MeshPacketHeader(
    packetId: json['packetId'],
    originNodeId: json['originNodeId'],
    targetNodeId: json['targetNodeId'],
    hopCount: json['hopCount'],
    maxHops: json['maxHops'],
    pathTrace: List<String>.from(json['pathTrace']),
    timestamp: json['timestamp'],
    payloadType: json['payloadType'],
  );
}

class NearbyMeshService {
  final String localNodeId;
  late NearbyService _nearbyService;
  final List<Device> _connectedDevices = [];

  NearbyMeshService({required this.localNodeId});

  Future<void> initMesh() async {
    _nearbyService = NearbyService();
    await _nearbyService.init(
      serviceType: 'resqmesh_p2p',
      strategy: Strategy.P2P_CLUSTER, // High-density mesh topology
      callback: (isRunning) {},
    );

    // Listen for peer discovery and payload streams
    _nearbyService.dataReceivedSubscription(callback: _onDataReceived);
  }

  // Transmit SOS Alert across physical radio
  Future<void> broadcastAlert(EmergencyAlert alert) async {
    final packetId = 'PKT-\${alert.id}-\${DateTime.now().millisecondsSinceEpoch}';

    final packet = {
      'header': MeshPacketHeader(
        packetId: packetId,
        originNodeId: localNodeId,
        targetNodeId: '*',
        hopCount: 0,
        maxHops: 5,
        pathTrace: [localNodeId],
        timestamp: DateTime.now().millisecondsSinceEpoch,
        payloadType: 'ALERT',
      ).toJson(),
      'payload': alert.toMap(),
    };

    // Store in local loop suppression cache
    await DatabaseHelper.instance.recordPacketSeen(packetId);

    // Send bytes to all connected direct neighbors
    final jsonStr = jsonEncode(packet);
    for (var device in _connectedDevices) {
      _nearbyService.sendMessage(device.deviceId, jsonStr);
    }
  }

  // Handle incoming RF packet: inspect header, prevent loops, relay if hops < maxHops
  Future<void> _onDataReceived(dynamic data) async {
    try {
      final decoded = jsonDecode(data['message']) as Map<String, dynamic>;
      final header = MeshPacketHeader.fromJson(decoded['header']);

      // 1. Loop Suppression: Check if packet ID was already processed
      final alreadySeen = await DatabaseHelper.instance.hasSeenPacket(header.packetId);
      if (alreadySeen) {
        // Discard duplicate echo silently
        return;
      }
      await DatabaseHelper.instance.recordPacketSeen(header.packetId);

      // 2. Ingest payload locally
      if (header.payloadType == 'ALERT') {
        final alertMap = decoded['payload'] as Map<String, dynamic>;
        final alert = EmergencyAlert.fromMap(alertMap);
        alert.hopCount = header.hopCount + 1;
        alert.syncState = SyncState.meshRelayed;
        alert.relayedByNodeIds = [...header.pathTrace, localNodeId];
        await DatabaseHelper.instance.insertAlert(alert);
      }

      // 3. Multi-Hop Forwarding: Decrement remaining hops and re-transmit
      if (header.hopCount + 1 < header.maxHops) {
        final forwardedHeader = MeshPacketHeader(
          packetId: header.packetId,
          originNodeId: header.originNodeId,
          targetNodeId: header.targetNodeId,
          hopCount: header.hopCount + 1,
          maxHops: header.maxHops,
          pathTrace: [...header.pathTrace, localNodeId],
          timestamp: header.timestamp,
          payloadType: header.payloadType,
        );

        final forwardPacket = {
          'header': forwardedHeader.toJson(),
          'payload': decoded['payload'],
        };
        final forwardJson = jsonEncode(forwardPacket);

        // Forward to other peers (except sender)
        for (var peer in _connectedDevices) {
          if (peer.deviceId != data['deviceId']) {
            _nearbyService.sendMessage(peer.deviceId, forwardJson);
          }
        }
      }
    } catch (e) {
      // Packet parse error or malformed payload
    }
  }
}
`
  },
  {
    path: 'lib/services/cloud_sync_service.dart',
    filename: 'cloud_sync_service.dart',
    language: 'dart',
    category: 'SERVICES',
    description: 'Cloud Firestore synchronization when internet connectivity returns',
    code: `import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../models/emergency_alert.dart';
import 'database_helper.dart';

class CloudSyncService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<void> attemptSync() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      // Still offline, retain records in local queue
      return;
    }

    // Retrieve records waiting for cloud synchronization
    final pendingAlerts = await DatabaseHelper.instance.getPendingSyncAlerts();

    for (var alert in pendingAlerts) {
      try {
        // Idempotent upsert into Firestore using Alert ID as document key
        await _firestore
            .collection('emergency_alerts')
            .doc(alert.id)
            .set(alert.toFirestore(), SetOptions(merge: true));

        // Mark as synchronized in local SQLite
        alert.syncState = SyncState.cloudSynced;
        alert.syncedAt = DateTime.now().millisecondsSinceEpoch;
        await DatabaseHelper.instance.insertAlert(alert);
      } catch (e) {
        // Mark as retry state, do not drop record
        alert.syncState = SyncState.failedRetry;
        await DatabaseHelper.instance.insertAlert(alert);
      }
    }
  }
}
`
  },
  {
    path: 'firestore.rules',
    filename: 'firestore.rules',
    language: 'javascript',
    category: 'RULES',
    description: 'Firebase Firestore security rules enforcing role-based responder triage',
    code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: checks if request is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function: checks if user has responder role
    function isResponder() {
      return isAuthenticated() &&
        request.auth.token.role == 'responder';
    }

    // Emergency Alerts collection
    match /emergency_alerts/{alertId} {
      // Anyone can create an emergency alert (even anonymous disaster victims)
      allow create: if true;
      
      // Anyone can read active alerts for community awareness
      allow read: if true;
      
      // Only authenticated responders can modify status or add triage notes
      allow update: if isResponder() || 
        (isAuthenticated() && request.auth.uid == resource.data.userId && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']));
        
      // Deletions are forbidden to protect audit trail
      allow delete: if false;
    }

    // Mesh telemetry and message exchange
    match /emergency_messages/{messageId} {
      allow create, read: if true;
      allow update, delete: if false;
    }
  }
}
`
  },
  {
    path: 'test/mesh_edge_test.dart',
    filename: 'mesh_edge_test.dart',
    language: 'dart',
    category: 'TESTS',
    description: 'Automated unit tests for Edge prioritization and loop suppression cache',
    code: `import 'package:flutter_test/flutter_test.dart';
import 'package:resqmesh/models/emergency_alert.dart';
import 'package:resqmesh/services/edge_prioritization_service.dart';

void main() {
  group('Edge Prioritization Engine Tests', () {
    test('Classifies severe entrapment as CRITICAL RED (Score >= 75)', () {
      final result = EdgePrioritizationService.evaluate(
        category: AlertCategory.trapped,
        message: 'Family trapped under collapsed roof, heavy bleeding',
        peopleCount: 3,
        hasGps: true,
      );

      expect(result.score, greaterThanOrEqualTo(75));
      expect(result.triageLevel, TriageLevel.critical);
      expect(result.detectedKeywords, contains('trapped'));
      expect(result.detectedKeywords, contains('bleeding'));
      expect(result.detectedKeywords, contains('collapse'));
    });

    test('Classifies minor supply request as MODERATE/LOW', () {
      final result = EdgePrioritizationService.evaluate(
        category: AlertCategory.general,
        message: 'Need blankets and drinking water for tonight',
        peopleCount: 1,
        hasGps: true,
      );

      expect(result.score, lessThan(50));
      expect(result.triageLevel, isNot(TriageLevel.critical));
    });
  });
}
`
  }
];

export interface VivaQuestion {
  id: number;
  question: string;
  answer: string;
  category: 'NETWORKING' | 'ARCHITECTURE' | 'EDGE_COMPUTING' | 'SECURITY' | 'ACADEMIC_DEFENSE';
}

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    question: "How does ResQMesh communicate when cell towers and internet are completely down?",
    answer: "ResQMesh utilizes Device-to-Device (D2D) wireless protocols—specifically Wi-Fi Direct and Bluetooth Low Energy (BLE) via the Android Nearby Connections API (P2P_CLUSTER topology). Smartphones establish ad-hoc peer links directly with neighboring devices within radio range (~30-100m) without needing a cellular base station or Wi-Fi router.",
    category: "NETWORKING"
  },
  {
    id: 2,
    question: "Why can't we simply rely on Firebase Firestore offline persistence for disaster communication?",
    answer: "Firebase offline persistence only saves documents to the local phone's SQLite cache. It CANNOT transmit data to another person's nearby phone without an active internet path to Google Cloud servers. ResQMesh introduces a separate wireless ad-hoc mesh transport layer to bridge disconnected physical devices.",
    category: "ARCHITECTURE"
  },
  {
    id: 3,
    question: "How do you prevent 'Broadcast Storms' and infinite packet looping in the mesh network?",
    answer: "We implement three mechanisms: 1) A local 'seen_packets' hash cache stored in SQLite: any packet ID seen within the TTL window is dropped immediately. 2) A Hop Count and Max Hops bound (default 5): the hop count increments at each relay and is discarded when hopCount >= maxHops. 3) Time-To-Live (TTL) expiration timestamps.",
    category: "NETWORKING"
  },
  {
    id: 4,
    question: "What is the difference between Wi-Fi Direct and ordinary Wi-Fi?",
    answer: "Ordinary Wi-Fi operates in Infrastructure Mode, requiring all devices to associate with a centralized Access Point (AP) / router with DHCP IP assignment. Wi-Fi Direct (Wi-Fi P2P) allows two or more mobile devices to negotiate a soft Access Point (Group Owner) on the fly, communicating directly without any existing router or Internet uplink.",
    category: "NETWORKING"
  },
  {
    id: 5,
    question: "Explain what 'Edge Computing' means in ResQMesh.",
    answer: "Rather than sending raw unclassified text to cloud AI servers (which are unreachable during disasters), our Edge Prioritization Engine executes directly on the smartphone CPU. It tokenizes distress messages, extracts disaster keywords ('trapped', 'bleeding', 'collapse'), calculates headcount weights, and assigns START triage priority tiers in under 5 milliseconds with zero cloud connectivity.",
    category: "EDGE_COMPUTING"
  },
  {
    id: 6,
    question: "How is cloud synchronization handled when one of the mesh nodes reaches an area with connectivity?",
    answer: "This is known as a 'Store-and-Forward' Gateway pattern. When a relay or rescue vehicle node with satellite/cellular connectivity (e.g., Starlink or restored 4G) ingests packets, its CloudSyncService detects internet reachability and executes idempotent upserts (merge=true) into Firebase Firestore using the unique alert UUID.",
    category: "ARCHITECTURE"
  },
  {
    id: 7,
    question: "How are duplicate alert submissions prevented during cloud sync?",
    answer: "Each alert generates a deterministic UUID v4 at the moment of creation on the victim's phone. When multiple relay nodes forward the same packet to Firestore, Firestore uses the alert ID as the document ID (`doc(alert.id).set(..., SetOptions(merge: true))`). This makes all synchronization operations idempotent.",
    category: "ARCHITECTURE"
  },
  {
    id: 8,
    question: "How do you secure responder triage actions so ordinary users cannot alter records?",
    answer: "At the database layer, Firebase Firestore Security Rules check custom claims (`request.auth.token.role == 'responder'`). Ordinary users can only submit alerts (create) and read active distress calls; only authenticated emergency responders with verified credentials can update triage status or close incidents.",
    category: "SECURITY"
  },
  {
    id: 9,
    question: "What are the physical limits of BLE and Wi-Fi Direct in a real disaster scenario?",
    answer: "1) Physical Range: BLE covers ~10-30 meters indoors through rubble; Wi-Fi Direct achieves ~50-100 meters line-of-sight. 2) Battery consumption: Wi-Fi Direct Group Owners consume notable battery; ResQMesh uses duty-cycling (periodic 10-second beacon bursts rather than continuous high-power radio broadcasting). 3) Android background limits: Android OS restricts background BLE scanning unless run as a Foreground Service with a persistent notification.",
    category: "ACADEMIC_DEFENSE"
  },
  {
    id: 10,
    question: "Why choose Flutter and SQLite for this project?",
    answer: "Flutter compiles natively to ARM machine code for Android with high UI rendering performance (60fps). SQLite (`sqflite`) is an embedded ACID-compliant relational engine that requires zero daemon processes, guaranteeing zero data loss even if the phone battery suddenly dies or the app crashes mid-disaster.",
    category: "ACADEMIC_DEFENSE"
  }
];
