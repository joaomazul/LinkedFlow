-- Converte o índice regular em unique index para permitir upsert diário de analytics
-- Necessário para o onConflictDoUpdate em analytics-syncer.ts funcionar corretamente
DROP INDEX IF EXISTS "analytics_snapshots_type_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "analytics_snapshots_type_idx" ON "analytics_snapshots" USING btree ("user_id","snapshot_type","snapshot_date");
