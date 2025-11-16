-- Add senderRole column to mark admin vs stakeholder messages
ALTER TABLE "StakeholderMessage" ADD COLUMN "senderRole" TEXT NOT NULL DEFAULT 'stakeholder';
