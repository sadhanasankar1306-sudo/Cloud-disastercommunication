/**
 * ResQMesh Data Models & Types
 * Cloud-Edge Emergency Communication System
 */

export type ConnectionMode = 'OFFLINE_ISOLATED' | 'MESH_CONNECTED' | 'CLOUD_ONLINE';

export type TriageLevel = 'CRITICAL' | 'URGENT' | 'MODERATE' | 'LOW';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'ON_SCENE' | 'RESOLVED' | 'CANCELLED';

export type SyncState = 'PENDING_LOCAL' | 'MESH_RELAYED' | 'CLOUD_SYNCED' | 'FAILED_RETRY';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  bloodGroup: string;
  medicalNotes: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  role: 'CITIZEN' | 'RESPONDER';
  responderPin?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: number;
  addressHint?: string;
}

export interface EmergencyAlert {
  id: string; // UUID / timestamp-based unique ID
  userId: string;
  userName: string;
  userPhone: string;
  bloodGroup?: string;
  category: 'MEDICAL' | 'TRAPPED' | 'COLLAPSE' | 'FIRE' | 'FLOOD' | 'GENERAL_SOS';
  message: string;
  peopleCount: number;
  location: GeoLocation;
  timestamp: number;
  priorityScore: number; // 0 - 100 calculated by edge engine
  triageLevel: TriageLevel;
  priorityReason: string;
  status: AlertStatus;
  syncState: SyncState;
  syncedAt?: number;
  hopCount: number;
  maxHops: number;
  relayedByNodeIds: string[];
  responderNotes?: string;
  resolvedAt?: number;
}

export interface EmergencyMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // 'BROADCAST' or specific node ID
  content: string;
  timestamp: number;
  location?: GeoLocation;
  syncState: SyncState;
  hopCount: number;
  maxHops: number;
  relayedBy: string[];
  isSosRelated: boolean;
}

export interface MeshNode {
  id: string;
  name: string;
  role: 'VICTIM' | 'RELAY' | 'RESPONDER';
  rssi: number; // dBm signal strength e.g. -50 (close) to -90 (far)
  isDirectNeighbor: boolean;
  batteryLevel: number;
  hasInternetUplink: boolean;
  distanceMeters: number;
  lastSeen: number;
  coords: { x: number; y: number }; // For canvas visualization
}

export interface MeshPacket {
  packetId: string;
  originNodeId: string;
  targetNodeId: string; // '*' for flood broadcast
  payloadType: 'ALERT' | 'MESSAGE' | 'ACK' | 'HEARTBEAT';
  payload: EmergencyAlert | EmergencyMessage | Record<string, unknown>;
  timestamp: number;
  hopCount: number;
  maxHops: number;
  pathTrace: string[];
  ttlSeconds: number;
}

export interface EdgeEvaluationResult {
  score: number;
  triageLevel: TriageLevel;
  detectedKeywords: string[];
  reason: string;
  factors: {
    keywordImpact: number;
    victimCountImpact: number;
    hazardSeverityImpact: number;
    locationFreshnessImpact: number;
  };
}
