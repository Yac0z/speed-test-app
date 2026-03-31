import {
  pgTable,
  serial,
  varchar,
  doublePrecision,
  integer,
  timestamp,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';

export const speedTestResults = pgTable('speed_test_results', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp', { mode: 'date' }).defaultNow().notNull(),
  downloadMbps: doublePrecision('download_mbps').notNull(),
  uploadMbps: doublePrecision('upload_mbps').notNull(),
  pingMs: doublePrecision('ping_ms').notNull(),
  jitterMs: doublePrecision('jitter_ms').notNull(),
  serverId: varchar('server_id', { length: 255 }),
  serverName: varchar('server_name', { length: 255 }),
  serverLocation: varchar('server_location', { length: 255 }),
  ispName: varchar('isp_name', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  connectionType: varchar('connection_type', { length: 50 }),
  downloadSamples: jsonb('download_samples').$type<number[]>(),
  uploadSamples: jsonb('upload_samples').$type<number[]>(),
  pingSamples: jsonb('ping_samples').$type<number[]>(),
});

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  theme: varchar('theme', { length: 20 }).default('system').notNull(),
  defaultServerId: varchar('default_server_id', { length: 255 }),
  testDuration: integer('test_duration').default(10).notNull(),
  parallelConnections: integer('parallel_connections').default(4).notNull(),
  dataRetentionDays: integer('data_retention_days').default(90).notNull(),
  lastUpdated: timestamp('last_updated', { mode: 'date' })
    .defaultNow()
    .notNull(),
});

export const servers = pgTable('servers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  isActive: boolean('is_active').default(true).notNull(),
});
