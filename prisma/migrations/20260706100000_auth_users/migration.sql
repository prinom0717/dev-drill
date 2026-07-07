-- PoC: reset user-related data and migrate to auth-enabled User schema

DELETE FROM "UserAnswer";
DELETE FROM "UserMark";
DELETE FROM "User";

ALTER TABLE "UserAnswer" DROP CONSTRAINT IF EXISTS "UserAnswer_user_id_fkey";
ALTER TABLE "UserMark" DROP CONSTRAINT IF EXISTS "UserMark_user_id_fkey";

DROP TABLE "User";

CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userid" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_userid_key" ON "User"("userid");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

ALTER TABLE "UserAnswer" DROP COLUMN "user_id";
ALTER TABLE "UserAnswer" ADD COLUMN "user_id" INTEGER NOT NULL;

ALTER TABLE "UserMark" DROP COLUMN "user_id";
ALTER TABLE "UserMark" ADD COLUMN "user_id" INTEGER NOT NULL;

CREATE INDEX "UserAnswer_user_id_idx" ON "UserAnswer"("user_id");
CREATE INDEX "UserMark_user_id_idx" ON "UserMark"("user_id");

ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserMark" ADD CONSTRAINT "UserMark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
