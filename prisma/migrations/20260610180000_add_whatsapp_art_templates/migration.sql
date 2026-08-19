-- CreateTable
CREATE TABLE "whatsapp_art_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- AlterTable
ALTER TABLE "whatsapp_send_logs" ADD COLUMN "imagePath" TEXT;

-- CreateIndex
CREATE INDEX "whatsapp_art_templates_active_idx" ON "whatsapp_art_templates"("active");
