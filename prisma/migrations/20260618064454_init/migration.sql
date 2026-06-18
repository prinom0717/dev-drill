-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('choice');

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
    "question_type" "QuestionType" NOT NULL,
    "question_text" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "answer" INTEGER NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" INTEGER NOT NULL,
    "user_answer" TEXT,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "pass" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMark" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" INTEGER NOT NULL,
    "mark_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamChapter_exam_id_idx" ON "ExamChapter"("exam_id");

-- CreateIndex
CREATE INDEX "Question_chapter_id_idx" ON "Question"("chapter_id");

-- CreateIndex
CREATE INDEX "UserAnswer_user_id_idx" ON "UserAnswer"("user_id");

-- CreateIndex
CREATE INDEX "UserAnswer_question_id_idx" ON "UserAnswer"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserMark_user_id_idx" ON "UserMark"("user_id");

-- CreateIndex
CREATE INDEX "UserMark_question_id_idx" ON "UserMark"("question_id");

-- AddForeignKey
ALTER TABLE "ExamChapter" ADD CONSTRAINT "ExamChapter_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "ExamChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMark" ADD CONSTRAINT "UserMark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMark" ADD CONSTRAINT "UserMark_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
