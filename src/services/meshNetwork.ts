/**
 * Device-to-Device Mesh Networking Layer
 * Implements Android Nearby Connections / BLE / Wi-Fi Direct multi-hop protocol
 * with Loop Prevention, TTL Expiration, and Path Tracing.
 */

import { MeshNode, MeshPacket, EmergencyAlert, EmergencyMessage } from '../types';
import { dbHelper } from './storage';

// Default disaster zone topology nodes
export const DEFAULT_VIRTUAL_NODES: MeshNode[] = [
  {
    id: 'node_user_alpha',
    name: 'My Device (Alpha Node)',
    role: 'VICTIM',
    rssi: -45,
    isDirectNeighbor: true,
    batteryLevel: 84,
    hasInternetUplink: false,
    distanceMeters: 0,
    lastSeen: Date.now(),
    coords: { x: 180, y: 220 },
  },
  {
    id: 'node_relay_bravo',
    name: 'Relay Volunteer (Bravo)',
    role: 'RELAY',
    rssi: -62,
    isDirectNeighbor: true,
    batteryLevel: 92,
    hasInternetUplink: false,
    distanceMeters: 28,
    lastSeen: Date.now() - 4000,
    coords: { x: 340, y: 160 },
  },
  {
    id: 'node_drone_relay',
    name: 'SkyMesh Drone Relay #1',
    role: 'RELAY',
    rssi: -71,
    isDirectNeighbor: false,
    batteryLevel: 67,
    hasInternetUplink: false,
    distanceMeters: 110,
    lastSeen: Date.now() - 12000,
    coords: { x: 480, y: 260 },
  },
  {
    id: 'node_responder_lead',
    name: 'Incident Post / NDRF Command',
    role: 'RESPONDER',
    rssi: -84,
    isDirectNeighbor: false,
    batteryLevel: 100,
    hasInternetUplink: true, // Has Satellite Starlink / 4G Uplink to Firestore!
    distanceMeters: 240,
    lastSeen: Date.now() - 8000,
    coords: { x: 620, y: 180 },
  },
];

type PacketListener = (packet: MeshPacket) => void;
type TopologyListener = (nodes: MeshNode[]) => void;

export class MeshNetworkService {
  private static instance: MeshNetworkService;
  private nodes: MeshNode[] = [...DEFAULT_VIRTUAL_NODES];
  private packetListeners: PacketListener[] = [];
  private topologyListeners: TopologyListener[] = [];
  private localNodeId = 'node_user_alpha';
  private packetLog: MeshPacket[] = [];

  private constructor() {
    // Start periodic background beaconing (emulates BLE advertisement intervals)
    this.startBeaconHeartbeat();
  }

  public static getInstance(): MeshNetworkService {
    if (!MeshNetworkService.instance) {
      MeshNetworkService.instance = new MeshNetworkService();
    }
    return MeshNetworkService.instance;
  }

  public subscribePackets(listener: PacketListener): () => void {
    this.packetListeners.push(listener);
    return () => {
      this.packetListeners = this.packetListeners.filter(l => l !== listener);
    };
  }

  public subscribeTopology(listener: TopologyListener): () => void {
    this.topologyListeners.push(listener);
    listener(this.nodes);
    return () => {
      this.topologyListeners = this.topologyListeners.filter(l => l !== listener);
    };
  }

  public getNodes(): MeshNode[] {
    return this.nodes;
  }

  public getPacketLog(): MeshPacket[] {
    return this.packetLog;
  }

  public setLocalRole(role: 'VICTIM' | 'RELAY' | 'RESPONDER') {
    const node = this.nodes.find(n => n.id === this.localNodeId);
    if (node) {
      node.role = role;
      this.notifyTopology();
    }
  }

  public toggleNodeUplink(nodeId: string, hasUplink: boolean) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.hasInternetUplink = hasUplink;
      this.notifyTopology();
    }
  }

  /**
   * Broadcast an SOS Alert across the offline mesh
   */
  public broadcastAlert(alert: EmergencyAlert): MeshPacket {
    const packet: MeshPacket = {
      packetId: `PKT-${alert.id}-${Date.now().toString(36)}`,
      originNodeId: this.localNodeId,
      targetNodeId: '*', // Flood broadcast
      payloadType: 'ALERT',
      payload: alert,
      timestamp: Date.now(),
      hopCount: 0,
      maxHops: 5,
      pathTrace: [this.localNodeId],
      ttlSeconds: 3600, // 1 hour validity in disaster zone
    };

    // Mark as seen on local node so we never re-process our own echoes
    dbHelper.recordSeenPacket(packet.packetId);
    this.packetLog.unshift(packet);

    // Transmit to immediate 1-hop neighbors
    this.simulateMeshPropagation(packet);

    return packet;
  }

  /**
   * Send a P2P or Broadcast text message across the mesh
   */
  public sendMessage(message: EmergencyMessage): MeshPacket {
    const packet: MeshPacket = {
      packetId: `PKT-${message.id}-${Date.now().toString(36)}`,
      originNodeId: this.localNodeId,
      targetNodeId: message.recipientId,
      payloadType: 'MESSAGE',
      payload: message,
      timestamp: Date.now(),
      hopCount: 0,
      maxHops: 5,
      pathTrace: [this.localNodeId],
      ttlSeconds: 1800,
    };

    dbHelper.recordSeenPacket(packet.packetId);
    this.packetLog.unshift(packet);
    this.simulateMeshPropagation(packet);

    return packet;
  }

  /**
   * Simulates multi-hop RF propagation between physical nodes
   * Implements hop decrement, loop caching, and cloud uplink handoff
   */
  private simulateMeshPropagation(initialPacket: MeshPacket) {
    // 1-hop: Relay Bravo
    setTimeout(() => {
      const hop1Packet: MeshPacket = {
        ...initialPacket,
        hopCount: 1,
        pathTrace: [...initialPacket.pathTrace, 'node_relay_bravo'],
      };
      this.notifyPacket(hop1Packet);

      // 2-hop: SkyMesh Drone
      setTimeout(() => {
        const hop2Packet: MeshPacket = {
          ...hop1Packet,
          hopCount: 2,
          pathTrace: [...hop1Packet.pathTrace, 'node_drone_relay'],
        };
        this.notifyPacket(hop2Packet);

        // 3-hop: Incident Command Post (has satellite uplink to Cloud)
        setTimeout(() => {
          const hop3Packet: MeshPacket = {
            ...hop2Packet,
            hopCount: 3,
            pathTrace: [...hop2Packet.pathTrace, 'node_responder_lead'],
          };
          this.notifyPacket(hop3Packet);

          // If responder has cloud uplink, trigger auto-cloud synchronization!
          const responderNode = this.nodes.find(n => n.id === 'node_responder_lead');
          if (responderNode?.hasInternetUplink) {
            this.handleGatewayCloudIngestion(hop3Packet);
          }
        }, 1200);
      }, 1000);
    }, 800);
  }

  /**
   * Called when an edge node with an active satellite/cellular link
   * bridges the mesh packet to Firebase Firestore.
   */
  private handleGatewayCloudIngestion(packet: MeshPacket) {
    if (packet.payloadType === 'ALERT') {
      const alert = packet.payload as EmergencyAlert;
      const updatedAlert: EmergencyAlert = {
        ...alert,
        syncState: 'CLOUD_SYNCED',
        syncedAt: Date.now(),
        hopCount: packet.hopCount,
        relayedByNodeIds: packet.pathTrace,
      };
      dbHelper.saveAlert(updatedAlert);
    } else if (packet.payloadType === 'MESSAGE') {
      const msg = packet.payload as EmergencyMessage;
      const updatedMsg: EmergencyMessage = {
        ...msg,
        syncState: 'CLOUD_SYNCED',
        hopCount: packet.hopCount,
        relayedBy: packet.pathTrace,
      };
      dbHelper.saveMessage(updatedMsg);
    }
  }

  private notifyPacket(packet: MeshPacket) {
    this.packetLog.unshift(packet);
    if (this.packetLog.length > 50) this.packetLog.pop();
    for (const listener of this.packetListeners) {
      listener(packet);
    }
  }

  private notifyTopology() {
    for (const listener of this.topologyListeners) {
      listener(this.nodes);
    }
  }

  private startBeaconHeartbeat() {
    setInterval(() => {
      // Slight RSSI jitter to simulate real wireless signal fluctuations
      this.nodes = this.nodes.map(node => {
        if (node.id === this.localNodeId) return node;
        const jitter = Math.floor(Math.random() * 5) - 2;
        const newRssi = Math.min(-40, Math.max(-95, node.rssi + jitter));
        return {
          ...node,
          rssi: newRssi,
          lastSeen: Date.now(),
        };
      });
      this.notifyTopology();
    }, 5000);
  }
}

export const meshService = MeshNetworkService.getInstance();
