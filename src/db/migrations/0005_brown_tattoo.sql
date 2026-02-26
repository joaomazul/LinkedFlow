DROP INDEX "posts_linkedin_post_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "posts_linkedin_post_id_idx" ON "posts" USING btree ("user_id","linkedin_post_id");