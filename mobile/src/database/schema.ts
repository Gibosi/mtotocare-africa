/**
 * Local SQLite Database Schema (Drift-style)
 * Mirrors the backend MySQL schema for offline-first functionality
 *
 * Tables:
 * - users, children, vaccinations, growth_records, nutrition_plans
 * - health_records, allergies, medications, prescriptions, diagnoses
 * - appointments, notifications, ai_conversations, file_uploads
 * - sync_queue (offline action queue)
 * - schema_metadata (migrations tracker)
 */

import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'mtotocare.db';
export const DATABASE_VERSION = 1;

export const SCHEMA_STATEMENTS = [
  // Schema version tracking
  `CREATE TABLE IF NOT EXISTS schema_metadata (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  );`,

  // Users
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    profile_picture_url TEXT,
    preferred_language TEXT DEFAULT 'en',
    email_verified INTEGER DEFAULT 0,
    phone_verified INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    roles TEXT,
    last_login_at TEXT,
    cached_at TEXT NOT NULL,
    dirty INTEGER DEFAULT 0
  );`,

  // Children
  `CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL,
    blood_group TEXT,
    birth_weight_kg REAL,
    birth_height_cm REAL,
    profile_picture_url TEXT,
    national_id TEXT,
    age_in_months INTEGER,
    full_name TEXT,
    cached_at TEXT NOT NULL,
    dirty INTEGER DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id);`,

  // Vaccinations
  `CREATE TABLE IF NOT EXISTS vaccinations (
    id INTEGER PRIMARY KEY,
    child_id INTEGER NOT NULL,
    schedule_id INTEGER NOT NULL,
    vaccine_code TEXT,
    vaccine_name TEXT,
    description TEXT,
    dose_number INTEGER,
    recommended_age_weeks INTEGER,
    administered_at TEXT,
    next_dose_due TEXT,
    administered_by TEXT,
    clinic_name TEXT,
    batch_number TEXT,
    notes TEXT,
    status TEXT DEFAULT 'PENDING',
    certificate_url TEXT,
    overdue INTEGER DEFAULT 0,
    cached_at TEXT NOT NULL,
    dirty INTEGER DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS idx_vacc_child ON vaccinations(child_id);`,
  `CREATE INDEX IF NOT EXISTS idx_vacc_status ON vaccinations(status);`,

  // Growth records
  `CREATE TABLE IF NOT EXISTS growth_records (
    id INTEGER PRIMARY KEY,
    child_id INTEGER NOT NULL,
    measurement_date TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    height_cm REAL NOT NULL,
    head_circumference_cm REAL,
    muac_cm REAL,
    bmi REAL,
    nutrition_status TEXT,
    notes TEXT,
    cached_at TEXT NOT NULL,
    dirty INTEGER DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS idx_growth_child ON growth_records(child_id);`,

  // Nutrition plans
  `CREATE TABLE IF NOT EXISTS nutrition_plans (
    id INTEGER PRIMARY KEY,
    child_id INTEGER NOT NULL,
    plan_date TEXT NOT NULL,
    meal_type TEXT,
    meal_name TEXT NOT NULL,
    description TEXT,
    ingredients TEXT,
    calories_kcal INTEGER,
    protein_g REAL,
    carbs_g REAL,
    fat_g REAL,
    notes TEXT,
    cached_at TEXT NOT NULL,
    dirty INTEGER DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS idx_nutrition_child ON nutrition_plans(child_id);`,

  // Health records (includes allergies, medications, etc. as polymorphic)
  `CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY,
    child_id INTEGER NOT NULL,
    record_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    record_date TEXT NOT NULL,
    doctor_name TEXT,
    clinic_name TEXT,
    document_url TEXT,
    severity TEXT,
    cached_at TEXT NOT NULL,
    dirty INTEGER DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS idx_health_child ON health_records(child_id);`,
  `CREATE INDEX IF NOT EXISTS idx_health_type ON health_records(record_type);`,

  // Appointments
  `CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY,
    child_id INTEGER NOT NULL,
    doctor_id INTEGER,
    appointment_datetime TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type TEXT,
    clinic_name TEXT,
    clinic_address TEXT,
    reason TEXT,
    notes TEXT,
    status TEXT DEFAULT 'SCHEDULED',
    cancellation_reason TEXT,
    cached_at TEXT NOT NULL,
    dirty INTEGER DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS idx_appt_child ON appointments(child_id);`,
  `CREATE INDEX IF NOT EXISTS idx_appt_datetime ON appointments(appointment_datetime);`,

  // Notifications
  `CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id INTEGER,
    scheduled_for TEXT NOT NULL,
    sent_at TEXT,
    read_at TEXT,
    channel TEXT,
    status TEXT DEFAULT 'PENDING',
    cached_at TEXT NOT NULL,
    dirty INTEGER DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_notif_status ON notifications(status);`,

  // AI conversations
  `CREATE TABLE IF NOT EXISTS ai_conversations (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    child_id INTEGER,
    session_id TEXT,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    intent TEXT,
    language TEXT DEFAULT 'en',
    response_time_ms INTEGER,
    cached_at TEXT NOT NULL,
    dirty INTEGER DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS idx_ai_user ON ai_conversations(user_id);`,

  // Vaccination schedule (template)
  `CREATE TABLE IF NOT EXISTS vaccination_schedule (
    id INTEGER PRIMARY KEY,
    vaccine_code TEXT UNIQUE NOT NULL,
    vaccine_name TEXT NOT NULL,
    description TEXT,
    recommended_age_weeks INTEGER NOT NULL,
    doses_required INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1
  );`,

  // Sync Queue (offline actions)
  `CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    operation TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TEXT,
    last_error TEXT,
    status TEXT DEFAULT 'PENDING',
    completed_at TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_queue_status ON sync_queue(status);`,
  `CREATE INDEX IF NOT EXISTS idx_queue_created ON sync_queue(created_at);`,

  // File upload queue
  `CREATE TABLE IF NOT EXISTS file_upload_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    local_uri TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_category TEXT,
    content_type TEXT,
    file_size INTEGER,
    related_entity_type TEXT,
    related_entity_id INTEGER,
    created_at TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    last_error TEXT
  );`,

  // AI offline library (cached health articles)
  `CREATE TABLE IF NOT EXISTS health_library (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT,
    language TEXT DEFAULT 'en',
    cached_at TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_library_category ON health_library(category);`,
];

/**
 * Initialize the local database.
 * Creates all tables if they don't exist.
 */
export async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  for (const stmt of SCHEMA_STATEMENTS) {
    await db.execAsync(stmt);
  }
  
  // Record schema version
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR IGNORE INTO schema_metadata (version, applied_at) VALUES (?, ?);`,
    [DATABASE_VERSION, now]
  );
}

/**
 * Drop all tables - for testing/reset only.
 */
export async function dropAllTables(db: SQLite.SQLiteDatabase): Promise<void> {
  const tables = [
    'schema_metadata', 'sync_queue', 'file_upload_queue', 'health_library',
    'users', 'children', 'vaccinations', 'growth_records', 'nutrition_plans',
    'health_records', 'appointments', 'notifications', 'ai_conversations',
    'vaccination_schedule'
  ];
  for (const t of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${t};`);
  }
}
