-- CreateTable
CREATE TABLE "Exam" (
    "id" SERIAL NOT NULL,
    "exam_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamChapter" (
    "id" SERIAL NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "chapter_title" TEXT NOT NULL,
    "coverage" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "question_type" TEXT NOT NULL,
    "acceptable_answers" JSONB,
    "created_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" INTEGER,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "user_answer" TEXT,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMark" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "mark_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "UserMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RejectedQuestion" (
    "id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "answer" INTEGER NOT NULL,
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RejectedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionIssue" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "admin_comment" TEXT,
    "fixed_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "issue_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "exam_id" INTEGER,

    CONSTRAINT "QuestionIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamChapter_exam_id_idx" ON "ExamChapter"("exam_id");

-- CreateIndex
CREATE INDEX "Question_chapter_id_idx" ON "Question"("chapter_id");
CREATE INDEX "Question_created_by_idx" ON "Question"("created_by");
CREATE INDEX "Question_updated_by_idx" ON "Question"("updated_by");

-- CreateIndex
CREATE INDEX "UserAnswer_user_id_idx" ON "UserAnswer"("user_id");
CREATE INDEX "UserAnswer_question_id_idx" ON "UserAnswer"("question_id");
CREATE INDEX "UserAnswer_answered_at_idx" ON "UserAnswer"("answered_at");
CREATE INDEX "UserAnswer_user_id_answered_at_idx" ON "UserAnswer"("user_id", "answered_at");
CREATE INDEX "UserAnswer_question_id_answered_at_idx" ON "UserAnswer"("question_id", "answered_at");
CREATE INDEX "UserAnswer_user_id_question_id_idx" ON "UserAnswer"("user_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_userid_key" ON "User"("userid");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserMark_user_id_idx" ON "UserMark"("user_id");
CREATE INDEX "UserMark_question_id_idx" ON "UserMark"("question_id");

-- CreateIndex
CREATE INDEX "RejectedQuestion_chapter_id_idx" ON "RejectedQuestion"("chapter_id");

-- CreateIndex
CREATE INDEX "QuestionIssue_exam_id_idx" ON "QuestionIssue"("exam_id");
CREATE INDEX "QuestionIssue_question_id_idx" ON "QuestionIssue"("question_id");
CREATE INDEX "QuestionIssue_user_id_idx" ON "QuestionIssue"("user_id");
CREATE INDEX "QuestionIssue_status_idx" ON "QuestionIssue"("status");

-- AddForeignKey
ALTER TABLE "ExamChapter" ADD CONSTRAINT "ExamChapter_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "ExamChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMark" ADD CONSTRAINT "UserMark_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserMark" ADD CONSTRAINT "UserMark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionIssue" ADD CONSTRAINT "QuestionIssue_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionIssue" ADD CONSTRAINT "QuestionIssue_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionIssue" ADD CONSTRAINT "QuestionIssue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;