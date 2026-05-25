/**
 * Telemetry Utility
 * Throttles high-frequency drone updates and logs metrics to reduce Appwrite bandwidth/writes.
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface DroneTelemetry {
  latitude: number;
  longitude: number;
  batteryLevel: number;
  status: string;
}

interface LastWriteState extends DroneTelemetry {
  timestamp: number;
}

// In-memory cache for tracking last writes
const lastWriteCache: Record<string, LastWriteState> = {};

/**
 * Calculates distance between two coordinates using the Haversine formula
 * Returns distance in METERS
 */
export function getDistance(from: Coordinate, to: Coordinate): number {
  const R = 6371e3; // Earth's radius in meters
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Metrics Tracker
 * Records performance metrics to calculate bandwidth/write savings.
 */
class MetricsTracker {
  private metrics = {
    writes_skipped: 0,
    writes_sent: 0,
    realtime_events_received: 0,
    poll_requests: 0,
  };
  public debugMode = true;

  logWriteSkipped(reason: string) {
    this.metrics.writes_skipped++;
    if (this.debugMode) {
      console.log(`📊 [Telemetry Metrics] Write SKIPPED: ${reason}. Skipped: ${this.metrics.writes_skipped}, Sent: ${this.metrics.writes_sent}`);
    }
  }

  logWriteSent(action: string) {
    this.metrics.writes_sent++;
    if (this.debugMode) {
      console.log(`📊 [Telemetry Metrics] Write SENT: ${action}. Skipped: ${this.metrics.writes_skipped}, Sent: ${this.metrics.writes_sent}`);
    }
  }

  logRealtimeEvent(channel: string) {
    this.metrics.realtime_events_received++;
    if (this.debugMode) {
      console.log(`📊 [Telemetry Metrics] Realtime Event: ${channel}. Total Events: ${this.metrics.realtime_events_received}`);
    }
  }

  logPollRequest(apiCall: string) {
    this.metrics.poll_requests++;
    if (this.debugMode) {
      console.log(`📊 [Telemetry Metrics] Poll Request: ${apiCall}. Total Polls: ${this.metrics.poll_requests}`);
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
  
  reset() {
    this.metrics = {
      writes_skipped: 0,
      writes_sent: 0,
      realtime_events_received: 0,
      poll_requests: 0,
    };
  }
}

export const metricsTracker = new MetricsTracker();

/**
 * Decides whether to allow or skip writing drone coordinates/telemetry to Appwrite.
 * 
 * Rules:
 * Allow write ONLY IF:
 * 1. forceWrite === true (takeoff, landing, user-triggered milestone updates)
 * 2. status changed (e.g. available <=> busy <=> offline)
 * 3. 15 seconds passed since last write
 * 4. distance moved > 50 meters
 * 5. battery delta > 2%
 */
export function shouldWritePosition(
  droneId: string,
  current: DroneTelemetry,
  forceWrite = false
): { shouldWrite: boolean; reason: string } {
  const now = Date.now();
  const lastState = lastWriteCache[droneId];

  // 1. Force Write Bypass
  if (forceWrite) {
    lastWriteCache[droneId] = { ...current, timestamp: now };
    return { shouldWrite: true, reason: 'force-write bypass' };
  }

  // First write is always allowed
  if (!lastState) {
    lastWriteCache[droneId] = { ...current, timestamp: now };
    return { shouldWrite: true, reason: 'initial registration' };
  }

  // 2. Status Changed
  if (current.status !== lastState.status) {
    lastWriteCache[droneId] = { ...current, timestamp: now };
    return { shouldWrite: true, reason: `status changed (${lastState.status} -> ${current.status})` };
  }

  // 3. Time Delta >= 15s
  const elapsedMs = now - lastState.timestamp;
  if (elapsedMs >= 15000) {
    lastWriteCache[droneId] = { ...current, timestamp: now };
    return { shouldWrite: true, reason: `time elapsed (${(elapsedMs / 1000).toFixed(1)}s >= 15s)` };
  }

  // 4. Distance Moved > 50m
  const distance = getDistance(
    { latitude: lastState.latitude, longitude: lastState.longitude },
    { latitude: current.latitude, longitude: current.longitude }
  );
  if (distance > 50) {
    lastWriteCache[droneId] = { ...current, timestamp: now };
    return { shouldWrite: true, reason: `distance threshold exceeded (${distance.toFixed(1)}m > 50m)` };
  }

  // 5. Battery Delta > 2%
  const batteryDelta = Math.abs(current.batteryLevel - lastState.batteryLevel);
  if (batteryDelta > 2) {
    lastWriteCache[droneId] = { ...current, timestamp: now };
    return { shouldWrite: true, reason: `battery delta exceeded (${batteryDelta}% > 2%)` };
  }

  // Otherwise, throttle (skip)
  return { 
    shouldWrite: false, 
    reason: `throttled (elapsed: ${(elapsedMs / 1000).toFixed(1)}s, dist: ${distance.toFixed(1)}m, batt delta: ${batteryDelta}%)` 
  };
}
