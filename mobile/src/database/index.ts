/**
 * Database Service - Local SQLite wrapper
 * Provides offline-first storage using expo-sqlite
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, initializeDatabase } from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Get the database instance (singleton).
 * Initializes on first call.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await initializeDatabase(db);
    dbInstance = db;
    return db;
  })();

  return initPromise;
}

/**
 * Close the database (for testing).
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    initPromise = null;
  }
}

/**
 * Helper: Convert a Date to ISO string.
 */
export function toISO(date?: Date | string | null): string {
  if (!date) return new Date().toISOString();
  if (typeof date === 'string') return date;
  return date.toISOString();
}

/**
 * Helper: Parse ISO string to Date.
 */
export function fromISO(date: string | null | undefined): Date | null {
  if (!date) return null;
  return new Date(date);
}

// ========== GENERIC REPOSITORY HELPERS ==========

/**
 * Insert or replace a single row.
 */
export async function upsert<T extends Record<string, any>>(
  db: SQLite.SQLiteDatabase,
  table: string,
  row: T
): Promise<void> {
  const keys = Object.keys(row);
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(k => row[k]);
  await db.runAsync(
    `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders});`,
    values
  );
}

/**
 * Insert or replace many rows in a single transaction.
 */
export async function bulkUpsert<T extends Record<string, any>>(
  db: SQLite.SQLiteDatabase,
  table: string,
  rows: T[]
): Promise<void> {
  if (rows.length === 0) return;
  const keys = Object.keys(rows[0]);
  const placeholders = keys.map(() => '?').join(', ');
  const stmt = `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  await db.withTransactionAsync(async () => {
    for (const row of rows) {
      await db.runAsync(stmt, keys.map(k => row[k]));
    }
  });
}

/**
 * Get all rows from a table.
 */
export async function getAll<T>(
  db: SQLite.SQLiteDatabase,
  table: string,
  where?: string,
  params?: any[]
): Promise<T[]> {
  let sql = `SELECT * FROM ${table}`;
  if (where) sql += ` WHERE ${where}`;
  const result = await db.getAllAsync<T>(sql, params || []);
  return result;
}

/**
 * Get first row matching criteria.
 */
export async function getFirst<T>(
  db: SQLite.SQLiteDatabase,
  table: string,
  where: string,
  params: any[]
): Promise<T | null> {
  const result = await db.getFirstAsync<T>(
    `SELECT * FROM ${table} WHERE ${where} LIMIT 1;`,
    params
  );
  return result || null;
}

/**
 * Delete a row by id.
 */
export async function deleteById(
  db: SQLite.SQLiteDatabase,
  table: string,
  id: number
): Promise<void> {
  await db.runAsync(`DELETE FROM ${table} WHERE id = ?;`, [id]);
}

/**
 * Mark an entity as needing sync (dirty bit).
 */
export async function markDirty(
  db: SQLite.SQLiteDatabase,
  table: string,
  id: number
): Promise<void> {
  await db.runAsync(`UPDATE ${table} SET dirty = 1 WHERE id = ?;`, [id]);
}
