CREATE TABLE "admin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pcs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"ip_address" text,
	"mac_address" text,
	"status" text DEFAULT 'offline' NOT NULL,
	"last_ping" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pc_id" integer NOT NULL,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp,
	"assigned_minutes" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'renter' NOT NULL,
	"balance_minutes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
