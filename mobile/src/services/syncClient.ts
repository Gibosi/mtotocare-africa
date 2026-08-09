/**
 * Sync Client - Network calls for the batch sync endpoint
 * 
 * Calls POST /api/sync/batch with queued operations
 * Receives: results + delta data for local cache update
 */

import { apiClient } from '../api/client';

export interface BatchSyncRequest {
  deviceId: string;
  clientId: string;
  appVersion: string;
  clientTimestamp: string;
  lastSyncTime: string | null;
  operations: SyncOperation[];
}

export interface SyncOperation {
  clientOperationId: string;
  operationType: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  clientEntityId: string;
  serverEntityId?: number;
  payload: Record<string, any>;
  clientTimestamp: string;
}

export interface BatchSyncResponse {
  success: boolean;
  data: {
    syncId: string;
    serverTimestamp: string;
    results: OperationResult[];
    totalUploaded: number;
    totalDownloaded: number;
    conflictsResolved: number;
    delta: DeltaData;
  };
}

export interface OperationResult {
  clientOperationId: string;
  status: 'SUCCESS' | 'FAILED' | 'CONFLICT';
  errorMessage?: string;
  serverEntityId?: number;
  entity?: any;
}

export interface DeltaData {
  children?: any[];
  vaccinations?: any[];
  growthRecords?: any[];
  healthRecords?: any[];
  appointments?: any[];
  notifications?: any[];
  vaccinationSchedule?: any[];
  deletedChildIds?: number[];
  deletedVaccinationIds?: number[];
  deletedAppointmentIds?: number[];
}

export const syncClient = {
  /**
   * Send a batch sync to the server.
   * Returns the server response with results + delta.
   */
  async batchSync(request: BatchSyncRequest): Promise<BatchSyncResponse> {
    const response = await apiClient.post('/sync/batch', request);
    return response.data;
  },

  /**
   * Get sync info (last sync time, server time).
   */
  async getSyncInfo(): Promise<{ lastSyncTime: string; serverTime: string }> {
    const response = await apiClient.get('/sync/info');
    return response.data.data;
  },
};
