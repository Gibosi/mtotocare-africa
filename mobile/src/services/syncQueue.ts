/**
 * Sync Queue Service
 * Manages offline action queue: User Updates → No Internet → Save Local → sync_queue
 * When internet returns: Pending → Uploading → Uploaded → Delete Queue Item
 */

import { getDatabase, toISO } from '../database';
import { getFirst, getAll } from '../database';

export type EntityType = 
  | 'children' 
  | 'vaccinations' 
  | 'growth_records' 
  | 'nutrition_plans' 
  | 'health_records' 
  | 'allergies' 
  | 'medications' 
  | 'appointments' 
  | 'users' 
  | 'files';

export type SyncOperation = 'create' | 'update' | 'delete';
export type SyncStatus = 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'FAILED';

export interface SyncQueueItem {
  id: number;
  entityType: EntityType;
  entityId: number | null;
  operation: SyncOperation;
  payload: string; // JSON string
  createdAt: string;
  attempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;
  status: SyncStatus;
  completedAt: string | null;
}

export interface QueueOptions {
  maxRetries?: number;     // Default: 5
  retryDelayMs?: number;   // Default: 5000 (exponential backoff)
}

/**
 * Sync Queue Manager
 */
class SyncQueueService {
  /**
   * Enqueue an action to be synced when online.
   */
  async enqueue(
    entityType: EntityType,
    operation: SyncOperation,
    payload: Record<string, any>,
    entityId?: number
  ): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING');`,
      [entityType, entityId || null, operation, JSON.stringify(payload), toISO()]
    );
    return result.lastInsertRowId;
  }

  /**
   * Get all pending items in the queue.
   */
  async getPending(): Promise<SyncQueueItem[]> {
    const db = await getDatabase();
    const rows = await getAll<any>(db, 'sync_queue', "status = 'PENDING' ORDER BY created_at");
    return rows.map(this.mapRow);
  }

  /**
   * Get queue statistics.
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    uploading: number;
    uploaded: number;
    failed: number;
  }> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ status: SyncStatus; count: number }>(
      `SELECT status, COUNT(*) as count FROM sync_queue GROUP BY status;`
    );
    const stats = { total: 0, pending: 0, uploading: 0, uploaded: 0, failed: 0 };
    rows.forEach(r => {
      stats.total += r.count;
      if (r.status === 'PENDING') stats.pending = r.count;
      if (r.status === 'UPLOADING') stats.uploading = r.count;
      if (r.status === 'UPLOADED') stats.uploaded = r.count;
      if (r.status === 'FAILED') stats.failed = r.count;
    });
    return stats;
  }

  /**
   * Mark an item as uploading.
   */
  async markUploading(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE sync_queue SET status = 'UPLOADING', attempts = attempts + 1, last_attempt_at = ? WHERE id = ?;`,
      [toISO(), id]
    );
  }

  /**
   * Mark an item as successfully uploaded.
   */
  async markUploaded(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE sync_queue SET status = 'UPLOADED', completed_at = ? WHERE id = ?;`,
      [toISO(), id]
    );
  }

  /**
   * Mark an item as failed.
   */
  async markFailed(id: number, error: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE sync_queue SET status = 'FAILED', last_error = ?, last_attempt_at = ? WHERE id = ?;`,
      [error, toISO(), id]
    );
  }

  /**
   * Reset failed item to pending (for retry).
   */
  async retryFailed(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE sync_queue SET status = 'PENDING', last_error = NULL WHERE id = ?;`,
      [id]
    );
  }

  /**
   * Delete a queue item.
   */
  async remove(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM sync_queue WHERE id = ?;`, [id]);
  }

  /**
   * Clear all uploaded items (cleanup).
   */
  async clearUploaded(): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(`DELETE FROM sync_queue WHERE status = 'UPLOADED';`);
    return result.changes;
  }

  /**
   * Clear entire queue (use with caution).
   */
  async clearAll(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM sync_queue;`);
  }

  private mapRow(row: any): SyncQueueItem {
    return {
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operation: row.operation,
      payload: row.payload,
      createdAt: row.created_at,
      attempts: row.attempts,
      lastAttemptAt: row.last_attempt_at,
      lastError: row.last_error,
      status: row.status,
      completedAt: row.completed_at,
    };
  }
}

export const syncQueue = new SyncQueueService();
