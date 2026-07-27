-- AlterTable
ALTER TABLE "Question"
ALTER COLUMN "answer" TYPE TEXT
USING "answer"::text,
ALTER COLUMN "answer" SET NOT NULL;

ALTER TABLE "Question"
ADD COLUMN "acceptable_answers" JSONB;