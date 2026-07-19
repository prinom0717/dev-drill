/*
  Warnings:

  - The `status` column on the `QuestionIssue` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `issue_type` on the `QuestionIssue` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "QuestionIssue" DROP COLUMN "issue_type",
ADD COLUMN     "issue_type" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OPEN';

-- DropEnum
DROP TYPE "IssueStatus";

-- DropEnum
DROP TYPE "IssueType";

-- CreateIndex
CREATE INDEX "QuestionIssue_status_idx" ON "QuestionIssue"("status");
