/**
 * Local Storage & SQLite Emulation Layer
 * Emulates Android SQLite (sqflite) database tables and transactions.
 * Persists to browser localStorage so data survives app restart.
 */

import { EmergencyAlert, EmergencyMessage, UserProfile } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'resqmesh_profile_v1',
  ALERTS: 'resqmesh_alerts_v1',
  MESSAGES: 'resqmesh_messages_v1',
  SEEN_PACKETS: 'resqmesh_seen_packets_v1',
  SETTINGS: 'resqmesh_settings_v1',
};

// Default profile
const DEFAULT_USER: UserProfile = {
  id: 'node_user_alpha',
  name: 'Alex Mercer',
  phone: '+91 98765 43210',
  bloodGroup: 'O+',
  medicalNotes: 'Asthmatic, carries inhaler',
  emergencyContactName: 'Dr. Sarah Mercer',
  emergencyContactPhone: '+91 98765 11223',
  role: 'CITIZEN',
  responderPin: '9110',
};

// Seed alerts for realistic disaster response demonstration
const INITIAL_SEED_ALERTS: EmergencyAlert[] = [
  {
    id: 'ALT-882101',
    userId: 'node_victim_02',
    userName: 'Priya Sharma',
    userPhone: '+91 94441 22334',
    bloodGroup: 'B+',
    category: 'TRAPPED',
    message: '2 adults and 1 infant trapped under collapsed staircase in Sector 4 block B! Severe bleeding from leg, water pipe burst!',
    peopleCount: 3,
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      accuracyMeters: 4.2,
      timestamp: Date.now() - 14 * 60 * 1000,
      addressHint: 'Sector 4, Block B, Civil Hospital Rd',
    },
    timestamp: Date.now() - 14 * 60 * 1000,
    priorityScore: 92,
    triageLevel: 'CRITICAL',
    priorityReason: 'Category: TRAPPED | Critical keywords: [TRAPPED (+45pts), BLEEDING (+40pts), INFANT (+35pts)] | Victims: 3 (+16pts) | GPS locked',
    status: 'ACTIVE',
    syncState: 'MESH_RELAYED',
    hopCount: 2,
    maxHops: 5,
    relayedByNodeIds: ['node_victim_02', 'node_relay_bravo', 'node_user_alpha'],
  },
  {
    id: 'ALT-882098',
    userId: 'node_victim_03',
    userName: 'Karthik Raja',
    userPhone: '+91 98840 55667',
    bloodGroup: 'A+',
    category: 'FLOOD',
    message: 'Water level reached 1st floor ceiling. Need boat evacuation for 4 elderly residents.',
    peopleCount: 4,
    location: {
      latitude: 12.9784,
      longitude: 77.6012,
      accuracyMeters: 6.8,
      timestamp: Date.now() - 32 * 60 * 1000,
      addressHint: 'Lakeview Colony, 2nd Cross',
    },
    timestamp: Date.now() - 32 * 60 * 1000,
    priorityScore: 68,
    triageLevel: 'URGENT',
    priorityReason: 'Category: FLOOD | Critical keywords: [ELDERLY (+25pts), WATER (+20pts)] | Victims: 4 (+24pts) | GPS locked',
    status: 'ACKNOWLEDGED',
    syncState: 'PENDING_LOCAL',
    hopCount: 1,
    maxHops: 5,
    relayedByNodeIds: ['node_victim_03', 'node_user_alpha'],
    responderNotes: 'Boat Unit Bravo assigned. ETA 15 mins.',
  },
];

const INITIAL_SEED_MESSAGES: EmergencyMessage[] = [
  {
    id: 'MSG-001',
    senderId: 'node_relay_bravo',
    senderName: 'Civil Defense Volunteer',
    recipientId: 'BROADCAST',
    content: 'All civilian units: Community Shelter open at St. Johns Hall. Drinking water & first aid available.',
    timestamp: Date.now() - 25 * 60 * 1000,
    syncState: 'MESH_RELAYED',
    hopCount: 1,
    maxHops: 4,
    relayedBy: ['node_relay_bravo'],
    isSosRelated: false,
  },
  {
    id: 'MSG-002',
    senderId: 'node_responder_lead',
    senderName: 'Commander Roy (NDRF)',
    recipientId: 'BROADCAST',
    content: 'Do NOT drink tap water in Sector 4. Main line contaminated by flood sludge.',
    timestamp: Date.now() - 8 * 60 * 1000,
    syncState: 'MESH_RELAYED',
    hopCount: 2,
    maxHops: 5,
    relayedBy: ['node_responder_lead', 'node_relay_bravo'],
    isSosRelated: false,
  },
];

export class LocalDatabaseHelper {
  private static instance: LocalDatabaseHelper;

  private constructor() {
    this.initIfEmpty();
  }

  public static getInstance(): LocalDatabaseHelper {
    if (!LocalDatabaseHelper.instance) {
      LocalDatabaseHelper.instance = new LocalDatabaseHelper();
    }
    return LocalDatabaseHelper.instance;
  }

  private initIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEYS.USER_PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_USER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_SEED_ALERTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_SEED_MESSAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SEEN_PACKETS)) {
      localStorage.setItem(STORAGE_KEYS.SEEN_PACKETS, JSON.stringify([]));
    }
  }

  // --- Profile Operations ---
  public getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  }

  public saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  // --- Emergency Alerts (SQLite table: emergency_alerts) ---
  public getAlerts(): EmergencyAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveAlert(alert: EmergencyAlert): void {
    const list = this.getAlerts();
    const index = list.findIndex(a => a.id === alert.id);
    if (index >= 0) {
      list[index] = alert; // Idempotent update
    } else {
      list.unshift(alert); // Insert at head
    }
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(list));
  }

  public updateAlertStatus(alertId: string, status: EmergencyAlert['status'], responderNotes?: string): boolean {
    const list = this.getAlerts();
    const alert = list.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      if (responderNotes) alert.responderNotes = responderNotes;
      if (status === 'RESOLVED') alert.resolvedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(list));
      return true;
    }
    return false;
  }

  // --- Emergency Messages (SQLite table: emergency_messages) ---
  public getMessages(): EmergencyMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveMessage(message: EmergencyMessage): void {
    const list = this.getMessages();
    const index = list.findIndex(m => m.id === message.id);
    if (index >= 0) {
      list[index] = message;
    } else {
      list.push(message);
    }
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
  }

  // --- Loop Suppression Cache (SQLite table: seen_packets) ---
  public hasSeenPacket(packetId: string): boolean {
    try {
      const cache: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEEN_PACKETS) || '[]');
      return cache.includes(packetId);
    } catch {
      return false;
    }
  }

  public recordSeenPacket(packetId: string): void {
    try {
      let cache: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEEN_PACKETS) || '[]');
      if (!cache.includes(packetId)) {
        cache.push(packetId);
        // Retain latest 250 packet IDs to cap storage
        if (cache.length > 250) {
          cache = cache.slice(-250);
        }
        localStorage.setItem(STORAGE_KEYS.SEEN_PACKETS, JSON.stringify(cache));
      }
    } catch {
      // ignore
    }
  }

  // Reset database for test demonstrations
  public resetToSeeds(): void {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_SEED_ALERTS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_SEED_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.SEEN_PACKETS, JSON.stringify([]));
  }
}

export const dbHelper = LocalDatabaseHelper.getInstance();
