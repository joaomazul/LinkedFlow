CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text,
	"email" text,
	"name" text,
	"avatar_url" text,
	"sidebar_collapsed" boolean DEFAULT false,
	"theme" text DEFAULT 'dark',
	"language" text DEFAULT 'pt-BR',
	"ai_generations_today" integer DEFAULT 0,
	"ai_generations_reset_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "linkedin_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"unipile_account_id" text NOT NULL,
	"unipile_dsn" text NOT NULL,
	"linkedin_id" text,
	"linkedin_slug" text,
	"name" text NOT NULL,
	"email" text,
	"avatar_url" text,
	"headline" text,
	"status" text DEFAULT 'ok' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"last_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "linkedin_accounts_unipile_account_id_unique" UNIQUE("unipile_account_id")
);
--> statement-breakpoint
CREATE TABLE "monitored_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"linkedin_url" text NOT NULL,
	"linkedin_id" text,
	"linkedin_slug" text,
	"name" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"company" text,
	"avatar_url" text,
	"headline" text,
	"follower_count" integer,
	"connection_count" integer,
	"color" text NOT NULL,
	"initials" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"last_fetched_at" timestamp with time zone,
	"last_post_at" timestamp with time zone,
	"new_posts_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"linkedin_post_id" text NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"html_text" text,
	"image_urls" jsonb DEFAULT '[]'::jsonb,
	"video_url" text,
	"article_url" text,
	"article_title" text,
	"post_url" text,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"reposts_count" integer DEFAULT 0 NOT NULL,
	"views_count" integer,
	"comment_status" text DEFAULT 'idle' NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"posted_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"text" text NOT NULL,
	"style_id" text NOT NULL,
	"source" text DEFAULT 'ai' NOT NULL,
	"generated_options" text[],
	"selected_option_index" text,
	"was_edited" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"linkedin_comment_id" text,
	"posted_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"fail_reason" text,
	"post_text_snapshot" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment_styles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"style_key" text NOT NULL,
	"label" text NOT NULL,
	"icon" text NOT NULL,
	"description" text NOT NULL,
	"prompt" text NOT NULL,
	"default_prompt" text,
	"active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text DEFAULT 'Minha Persona' NOT NULL,
	"is_active" text DEFAULT 'true' NOT NULL,
	"persona_name" text,
	"role" text,
	"company" text,
	"niche" text,
	"tone" text,
	"goals" text,
	"avoid" text,
	"custom_prompt" text,
	"compiled_prompt" text,
	"compiled_at" timestamp with time zone,
	"previous_compiled_prompt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"active_linkedin_account_id" text,
	"default_style_key" text DEFAULT 'positivo',
	"auto_refresh_enabled" boolean DEFAULT true NOT NULL,
	"auto_refresh_interval" integer DEFAULT 600,
	"comment_language" text DEFAULT 'pt-BR' NOT NULL,
	"generation_count" integer DEFAULT 3 NOT NULL,
	"notify_new_posts" boolean DEFAULT false NOT NULL,
	"notify_on_reply" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "linkedin_accounts" ADD CONSTRAINT "linkedin_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitored_profiles" ADD CONSTRAINT "monitored_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_profile_id_monitored_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."monitored_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_profile_id_monitored_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."monitored_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_styles" ADD CONSTRAINT "comment_styles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personas" ADD CONSTRAINT "personas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mp_user_id_idx" ON "monitored_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mp_linkedin_id_idx" ON "monitored_profiles" USING btree ("linkedin_id");--> statement-breakpoint
CREATE INDEX "mp_active_idx" ON "monitored_profiles" USING btree ("user_id","active");--> statement-breakpoint
CREATE INDEX "posts_user_id_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_profile_id_idx" ON "posts" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_linkedin_post_id_idx" ON "posts" USING btree ("linkedin_post_id");--> statement-breakpoint
CREATE INDEX "posts_posted_at_idx" ON "posts" USING btree ("posted_at");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("user_id","comment_status");--> statement-breakpoint
CREATE INDEX "posts_feed_idx" ON "posts" USING btree ("user_id","is_hidden","posted_at");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_post_id_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "comments_status_idx" ON "comments" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "comments_posted_at_idx" ON "comments" USING btree ("posted_at");--> statement-breakpoint
CREATE INDEX "comments_history_idx" ON "comments" USING btree ("user_id","status","posted_at");--> statement-breakpoint
CREATE INDEX "cs_user_id_idx" ON "comment_styles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cs_order_idx" ON "comment_styles" USING btree ("user_id","active","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "cs_style_key_idx" ON "comment_styles" USING btree ("user_id","style_key");--> statement-breakpoint
CREATE INDEX "personas_user_id_idx" ON "personas" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "personas_active_idx" ON "personas" USING btree ("user_id","is_active");