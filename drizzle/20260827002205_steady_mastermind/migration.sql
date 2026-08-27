CREATE TABLE "subscribers" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"unsubscribe_token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
