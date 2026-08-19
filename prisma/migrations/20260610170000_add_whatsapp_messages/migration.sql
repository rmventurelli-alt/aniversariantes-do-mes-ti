-- CreateTable
CREATE TABLE "whatsapp_message_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "whatsapp_send_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "birthdayPersonId" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" DATETIME,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatsapp_send_logs_birthdayPersonId_fkey" FOREIGN KEY ("birthdayPersonId") REFERENCES "birthday_people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "whatsapp_message_templates_active_idx" ON "whatsapp_message_templates"("active");

-- CreateIndex
CREATE INDEX "whatsapp_send_logs_birthdayPersonId_year_idx" ON "whatsapp_send_logs"("birthdayPersonId", "year");

-- CreateIndex
CREATE INDEX "whatsapp_send_logs_status_idx" ON "whatsapp_send_logs"("status");

-- CreateIndex
CREATE INDEX "whatsapp_send_logs_sentAt_idx" ON "whatsapp_send_logs"("sentAt");
