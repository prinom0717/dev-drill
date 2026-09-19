-- Add audit fields to Question table
ALTER TABLE "Question"
ADD COLUMN "created_by" INT,
ADD COLUMN "updated_at" TIMESTAMP,
ADD COLUMN "updated_by" INT;

-- Add indexes for audit fields
CREATE INDEX "Question_created_by_idx" ON "Question"("created_by");
CREATE INDEX "Question_updated_by_idx" ON "Question"("updated_by");

-- Add foreign key constraints for audit fields
ALTER TABLE "Question"
ADD CONSTRAINT "Question_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Question"
ADD CONSTRAINT "Question_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
