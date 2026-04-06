DROP INDEX "idx_room_members_room_id";--> statement-breakpoint
DROP INDEX "idx_room_members_room_id_user_id";--> statement-breakpoint
DROP INDEX "idx_rooms_created_at_id";--> statement-breakpoint
DROP INDEX "idx_messages_room_id_created_at";--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_edited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_rooms_created_at_id" ON "rooms" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_messages_room_id_created_at" ON "messages" USING btree ("room_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "edited_at";