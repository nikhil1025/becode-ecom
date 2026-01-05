-- CreateTable
CREATE TABLE "contact_replies" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailSentAt" TIMESTAMP(3),

    CONSTRAINT "contact_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_replies_contactId_idx" ON "contact_replies"("contactId");

-- CreateIndex
CREATE INDEX "contact_replies_adminId_idx" ON "contact_replies"("adminId");

-- CreateIndex
CREATE INDEX "contact_replies_sentAt_idx" ON "contact_replies"("sentAt");

-- AddForeignKey
ALTER TABLE "contact_replies" ADD CONSTRAINT "contact_replies_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_replies" ADD CONSTRAINT "contact_replies_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
