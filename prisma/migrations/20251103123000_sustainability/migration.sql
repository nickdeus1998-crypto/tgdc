-- CreateTable SustainabilityProject
CREATE TABLE "SustainabilityProject" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "badgeColor" TEXT NOT NULL,
  "badgeTextColor" TEXT NOT NULL,
  "badgeBorderColor" TEXT NOT NULL,
  "isOpen" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

-- CreateTable SustainabilityPartner
CREATE TABLE "SustainabilityPartner" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "initial" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "badgeColor" TEXT NOT NULL,
  "badgeTextColor" TEXT NOT NULL,
  "badgeBorderColor" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

