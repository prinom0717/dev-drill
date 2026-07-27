-- AlterTable
ALTER TABLE "Question"
ALTER COLUMN "question_type" TYPE TEXT
USING "question_type"::text,
ALTER COLUMN "question_type" SET NOT NULL;

-- DropEnum
DROP TYPE "QuestionType";