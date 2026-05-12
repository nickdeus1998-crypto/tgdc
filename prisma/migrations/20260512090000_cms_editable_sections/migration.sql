-- CMS fields and singleton tables required by the May 2026 website issue fixes.

-- About page editable quick stats and key achievements.
ALTER TABLE "About" ADD COLUMN "stats" JSON;
ALTER TABLE "About" ADD COLUMN "keyAchievements" JSON;

-- Services page editable mandate and call-to-action content.
ALTER TABLE "service_sections" ADD COLUMN "mandate" TEXT;
ALTER TABLE "service_sections" ADD COLUMN "mandateTitle" TEXT;
ALTER TABLE "service_sections" ADD COLUMN "mandateVisibleOnHomepage" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "service_sections" ADD COLUMN "ctaTitle" TEXT;
ALTER TABLE "service_sections" ADD COLUMN "ctaSubtitle" TEXT;
ALTER TABLE "service_sections" ADD COLUMN "ctaPrimaryLabel" TEXT;
ALTER TABLE "service_sections" ADD COLUMN "ctaPrimaryHref" TEXT;
ALTER TABLE "service_sections" ADD COLUMN "ctaSecondaryLabel" TEXT;
ALTER TABLE "service_sections" ADD COLUMN "ctaSecondaryHref" TEXT;

-- Sustainability editable tab copy.
CREATE TABLE "SustainabilityContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Impact highlights editable heading.
CREATE TABLE "ImpactHighlightSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sectionTitle" TEXT NOT NULL DEFAULT 'Project Impact Highlights',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Direct Use Projects page editable content.
CREATE TABLE "DirectUsePage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "introTitle" TEXT,
    "introContent" TEXT,
    "strategicProjects" JSON,
    "roadmap" JSON,
    "showUtilization" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
