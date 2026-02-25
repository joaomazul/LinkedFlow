ALTER TABLE "monitored_profiles" ADD COLUMN "linkedin_profile_id" varchar(255);--> statement-breakpoint
ALTER TABLE "monitored_profiles" ADD COLUMN "public_identifier" varchar(255);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "author_name" varchar(255);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "author_headline" varchar(500);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "author_avatar_url" varchar(2048);--> statement-breakpoint
CREATE INDEX "mp_linkedin_profile_id_idx" ON "monitored_profiles" USING btree ("linkedin_profile_id");