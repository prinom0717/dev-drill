-- AlterTable
ALTER TABLE "UserMark" ADD COLUMN     "mark_type" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "MarkConfig" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "mark_type_1" TEXT NOT NULL DEFAULT 'チェック1',
    "mark_type_2" TEXT NOT NULL DEFAULT 'チェック2',
    "mark_type_3" TEXT NOT NULL DEFAULT 'チェック3',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarkConfig_user_id_key" ON "MarkConfig"("user_id");

-- CreateIndex
CREATE INDEX "MarkConfig_user_id_idx" ON "MarkConfig"("user_id");

-- CreateIndex
CREATE INDEX "UserMark_user_id_question_id_mark_type_idx" ON "UserMark"("user_id", "question_id", "mark_type");

-- AddForeignKey
ALTER TABLE "MarkConfig" ADD CONSTRAINT "MarkConfig_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
