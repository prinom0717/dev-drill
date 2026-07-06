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

-- CreateIndex
CREATE INDEX "RejectedQuestion_chapter_id_idx" ON "RejectedQuestion"("chapter_id");
