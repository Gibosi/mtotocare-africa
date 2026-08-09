/**
 * Repository Layer - Bridges API and Local DB
 * Each module has a repository that:
 * - Reads from local DB first (instant offline response)
 * - Triggers background sync to fetch updates
 * - Queues writes for sync when offline
 *
 * Following the spec:
 * ONLINE: Open Child → Load Local Data → Background API Request → New Data? → Update Local DB → Refresh UI
 * OFFLINE: Open Child → Read Local Database → Display Cached Information
 */

import { getDatabase, toISO, upsert, getAll, getFirst, markDirty } from '../database';
import { syncQueue } from './syncQueue';
import { connectivity } from './connectivity';
import { apiClient } from '../api/client';
import { Child, Vaccination, GrowthRecord, Appointment } from '../types';

/**
 * Generic repository pattern for any entity.
 */
abstract class BaseRepository<T extends { id: number }> {
  protected abstract table: string;
  protected abstract endpoint: string;
  
  /**
   * Load from local DB first.
   */
  async loadLocal(filters?: { where?: string; params?: any[] }): Promise<T[]> {
    const db = await getDatabase();
    return getAll<T>(db, this.table, filters?.where, filters?.params);
  }

  /**
   * Trigger background API sync.
   */
  async backgroundSync(): Promise<void> {
    if (!(await connectivity.isConnected())) return;
    try {
      const response = await apiClient.get(this.endpoint);
      const data = response.data?.data;
      if (!data) return;
      const items = Array.isArray(data) ? data : (data.content || [data]);
      if (items.length === 0) return;
      const db = await getDatabase();
      for (const item of items) {
        await upsert(db, this.table, { ...item, cached_at: toISO(), dirty: 0 });
      }
    } catch (err) {
      console.warn(`[${this.table}] Background sync failed:`, err);
    }
  }

  /**
   * Save (online or offline).
   */
  async save(data: Partial<T>, operation: 'create' | 'update' = 'create'): Promise<T> {
    const isOnline = await connectivity.isConnected();
    
    if (isOnline) {
      // Direct API call
      const response = operation === 'create'
        ? await apiClient.post(this.endpoint, data)
        : await apiClient.put(`${this.endpoint}/${data.id}`, data);
      return response.data.data;
    } else {
      // Queue for later sync
      const id = data.id as number || Date.now();
      await syncQueue.enqueue(
        this.table as any,
        operation,
        { ...data, id },
        id
      );
      
      // Save locally with dirty flag
      const db = await getDatabase();
      await upsert(db, this.table, {
        ...data,
        id,
        cached_at: toISO(),
        dirty: 1,
      });
      
      return { ...data, id } as T;
    }
  }
}

/**
 * Children Repository
 */
export class ChildrenRepository extends BaseRepository<Child> {
  protected table = 'children';
  protected endpoint = '/children';

  async loadForParent(parentId: number): Promise<Child[]> {
    return this.loadLocal({ 
      where: 'parent_id = ? ORDER BY date_of_birth DESC', 
      params: [parentId] 
    });
  }

  async addChild(data: Partial<Child>): Promise<Child> {
    return this.save(data, 'create');
  }
}

/**
 * Vaccinations Repository
 */
export class VaccinationsRepository extends BaseRepository<Vaccination> {
  protected table = 'vaccinations';
  protected endpoint = '/vaccinations';

  async loadForChild(childId: number): Promise<Vaccination[]> {
    return this.loadLocal({ 
      where: 'child_id = ? ORDER BY next_dose_due ASC', 
      params: [childId] 
    });
  }

  async getOverdue(): Promise<Vaccination[]> {
    return this.loadLocal({ 
      where: "status = 'OVERDUE' OR (status = 'PENDING' AND next_dose_due < date('now'))" 
    });
  }

  async getSchedules(): Promise<any[]> {
    return this.loadLocal({ where: 'active = 1' });
  }
}

/**
 * Growth Records Repository
 */
export class GrowthRepository extends BaseRepository<GrowthRecord> {
  protected table = 'growth_records';
  protected endpoint = '/growth';

  async loadForChild(childId: number): Promise<GrowthRecord[]> {
    return this.loadLocal({ 
      where: 'child_id = ? ORDER BY measurement_date ASC', 
      params: [childId] 
    });
  }

  async getLatest(childId: number): Promise<GrowthRecord | null> {
    return getFirst<GrowthRecord>(await getDatabase(), this.table, 
      'child_id = ? ORDER BY measurement_date DESC LIMIT 1', [childId]);
  }
}

/**
 * Appointments Repository
 */
export class AppointmentsRepository extends BaseRepository<Appointment> {
  protected table = 'appointments';
  protected endpoint = '/appointments';

  async loadForParent(parentId: number): Promise<Appointment[]> {
    return this.loadLocal({ 
      where: 'child_id IN (SELECT id FROM children WHERE parent_id = ?) ORDER BY appointment_datetime DESC', 
      params: [parentId] 
    });
  }
}

// Singleton instances
export const childrenRepo = new ChildrenRepository();
export const vaccinationsRepo = new VaccinationsRepository();
export const growthRepo = new GrowthRepository();
export const appointmentsRepo = new AppointmentsRepository();
