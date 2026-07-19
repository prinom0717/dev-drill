-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('TYPO', 'INCORRECT_CONTENT', 'INSUFFICIENT_EXPLANATION', 'UNCLEAR_EXPRESSION', 'OTHER');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "QuestionIssue" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "issue_type" "IssueType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "admin_comment" TEXT,
    "fixed_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionIssue_question_id_idx" ON "QuestionIssue"("question_id");

-- CreateIndex
CREATE INDEX "QuestionIssue_user_id_idx" ON "QuestionIssue"("user_id");

-- CreateIndex
CREATE INDEX "QuestionIssue_status_idx" ON "QuestionIssue"("status");

-- AddForeignKey
ALTER TABLE "QuestionIssue" ADD CONSTRAINT "QuestionIssue_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionIssue" ADD CONSTRAINT "QuestionIssue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
