ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_url" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "theme" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "theme" SET DEFAULT 'dark';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "language" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "language" SET DEFAULT 'pt-BR';--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "unipile_account_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "unipile_dsn" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "linkedin_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "linkedin_slug" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "avatar_url" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "headline" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ALTER COLUMN "status" SET DEFAULT 'ok';--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "linkedin_url" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "linkedin_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "linkedin_slug" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "role" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "role" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "company" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "avatar_url" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "headline" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "color" SET DATA TYPE varchar(7);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ALTER COLUMN "initials" SET DATA TYPE varchar(3);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "linkedin_post_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "video_url" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "article_url" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "article_title" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "post_url" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "comment_status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "comment_status" SET DEFAULT 'idle';--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "style_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "source" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "source" SET DEFAULT 'ai';--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "selected_option_index" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "status" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "linkedin_comment_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "fail_reason" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "comment_styles" ALTER COLUMN "style_key" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "comment_styles" ALTER COLUMN "label" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "comment_styles" ALTER COLUMN "icon" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "comment_styles" ALTER COLUMN "description" SET DATA TYPE varchar(300);--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "name" SET DEFAULT 'Minha Persona';--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "is_active" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "is_active" SET DEFAULT 'true';--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "persona_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "role" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "company" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "niche" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "tone" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "app_settings" ALTER COLUMN "active_linkedin_account_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "app_settings" ALTER COLUMN "default_style_key" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "app_settings" ALTER COLUMN "default_style_key" SET DEFAULT 'positivo';--> statement-breakpoint
ALTER TABLE "app_settings" ALTER COLUMN "comment_language" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "app_settings" ALTER COLUMN "comment_language" SET DEFAULT 'pt-BR';--> statement-breakpoint
CREATE UNIQUE INDEX "cs_user_style_unique" ON "comment_styles" USING btree ("user_id","style_key");