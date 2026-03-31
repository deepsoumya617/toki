ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "idx_room_members_user_id";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_room_members_room_id_user_id" ON "room_members" USING btree ("room_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_rooms_created_at_id" ON "rooms" USING btree ("created_at","id");