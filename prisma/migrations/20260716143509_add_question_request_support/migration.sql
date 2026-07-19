-- AlterTable
ALTER TABLE "QuestionIssue" ADD COLUMN     "exam_id" INTEGER,
ALTER COLUMN "question_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "QuestionIssue_exam_id_idx" ON "QuestionIssue"("exam_id");

-- AddForeignKey
ALTER TABLE "QuestionIssue" ADD CONSTRAINT "QuestionIssue_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
