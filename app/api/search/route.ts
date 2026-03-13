import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface SearchResult {
  type: string;
  title: string;
  snippet: string;
  url: string;
  category?: string;
}

function truncateSnippet(text: string, query: string, maxLen = 120): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return text.slice(0, maxLen) + (text.length > maxLen ? '…' : '');
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 80);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet = snippet + '…';
  return snippet;
}

// Helper: search through a JSON-stored array for matching text
function searchJsonArray(jsonField: any, query: string): { title: string; snippet: string }[] {
  const results: { title: string; snippet: string }[] = [];
  const qLower = query.toLowerCase();
  let items: any[] = [];

  if (typeof jsonField === 'string') {
    try { items = JSON.parse(jsonField); } catch { return results; }
  } else if (Array.isArray(jsonField)) {
    items = jsonField;
  } else {
    return results;
  }

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    // Search all string fields in the object
    const searchableText = Object.values(item)
      .filter((v): v is string => typeof v === 'string')
      .join(' | ');
    if (searchableText.toLowerCase().includes(qLower)) {
      const title = item.title || item.name || item.year || 'About Us';
      const desc = item.description || item.timeAgo || searchableText;
      results.push({ title: String(title), snippet: truncateSnippet(String(desc), query) });
    }
    // Also search nested arrays (e.g., points[] in missionVision)
    if (Array.isArray(item.points)) {
      for (const point of item.points) {
        if (typeof point === 'string' && point.toLowerCase().includes(qLower)) {
          results.push({ title: item.title || 'About Us', snippet: truncateSnippet(point, query) });
          break;
        }
      }
    }
  }
  return results;
}

const LIMIT = 5;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  const typeFilter = req.nextUrl.searchParams.get('type')?.trim() || '';

  if (q.length < 2) {
    return NextResponse.json({ results: [], query: q });
  }

  try {
    const containsFilter = { contains: q };

    // Run all 15 queries in parallel
    const [
      news,
      geothermalSites,
      projects,
      tenders,
      services,
      faqs,
      sustainabilityProjects,
      sustainabilityPartners,
      informationItems,
      employees,
      impactHighlights,
      orgLeaders,
      announcements,
      repositoryItems,
      aboutData,
    ] = await Promise.all([
      // News
      (!typeFilter || typeFilter === 'news')
        ? prisma.news.findMany({
          where: { OR: [{ title: containsFilter }, { category: containsFilter }, { content: containsFilter }] },
          take: LIMIT, orderBy: { date: 'desc' },
        })
        : Promise.resolve([]),

      // Geothermal Sites
      (!typeFilter || typeFilter === 'geothermal')
        ? prisma.geothermalSite.findMany({
          where: { OR: [{ title: containsFilter }, { summary: containsFilter }, { zone: containsFilter }, { tag: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // Project Highlights
      (!typeFilter || typeFilter === 'project')
        ? prisma.projectHighlight.findMany({
          where: { OR: [{ title: containsFilter }, { location: containsFilter }, { category: containsFilter }, { description: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // Tenders
      (!typeFilter || typeFilter === 'tender')
        ? prisma.tender.findMany({
          where: { OR: [{ title: containsFilter }, { ref: containsFilter }, { category: containsFilter }, { scope: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // Services
      (!typeFilter || typeFilter === 'service')
        ? prisma.service.findMany({
          where: { OR: [{ title: containsFilter }, { content: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // FAQs
      (!typeFilter || typeFilter === 'faq')
        ? prisma.fAQ.findMany({
          where: { OR: [{ question: containsFilter }, { answer: containsFilter }] },
          take: LIMIT, orderBy: { order: 'asc' },
        })
        : Promise.resolve([]),

      // Sustainability Projects
      (!typeFilter || typeFilter === 'sustainability')
        ? prisma.sustainabilityProject.findMany({
          where: { OR: [{ name: containsFilter }, { description: containsFilter }, { location: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // Sustainability Partners
      (!typeFilter || typeFilter === 'partner')
        ? prisma.sustainabilityPartner.findMany({
          where: { OR: [{ name: containsFilter }, { category: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // Information Items
      (!typeFilter || typeFilter === 'information')
        ? prisma.informationItem.findMany({
          where: { OR: [{ title: containsFilter }, { description: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // Employees
      (!typeFilter || typeFilter === 'employee')
        ? prisma.employee.findMany({
          where: { OR: [{ name: containsFilter }, { position: containsFilter }, { department: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // Impact Highlights
      (!typeFilter || typeFilter === 'impact')
        ? prisma.impactHighlight.findMany({
          where: { OR: [{ title: containsFilter }, { catchy: containsFilter }, { description: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // Org Leaders
      (!typeFilter || typeFilter === 'leadership')
        ? prisma.orgLeader.findMany({
          where: { OR: [{ name: containsFilter }, { role: containsFilter }, { levelLabel: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // Announcements (active only)
      (!typeFilter || typeFilter === 'announcement')
        ? prisma.announcement.findMany({
          where: { isActive: true, OR: [{ title: containsFilter }, { content: containsFilter }] },
          take: LIMIT, orderBy: { createdAt: 'desc' },
        })
        : Promise.resolve([]),

      // Repository Items (documents)
      (!typeFilter || typeFilter === 'document')
        ? prisma.repositoryItem.findMany({
          where: { OR: [{ title: containsFilter }, { category: containsFilter }, { description: containsFilter }] },
          take: LIMIT,
        })
        : Promise.resolve([]),

      // About page (fetch for JSON field searching)
      (!typeFilter || typeFilter === 'about')
        ? prisma.about.findFirst()
        : Promise.resolve(null),
    ]);

    // Map results to unified format
    const results: SearchResult[] = [];

    for (const item of news) {
      results.push({ type: 'News', title: item.title, snippet: truncateSnippet(item.content, q), url: `/news/${item.id}`, category: item.category });
    }
    for (const item of geothermalSites) {
      results.push({ type: 'Geothermal Site', title: item.title, snippet: truncateSnippet(item.summary, q), url: `/geothermal-sites`, category: item.zone });
    }
    for (const item of projects) {
      results.push({ type: 'Project', title: item.title, snippet: truncateSnippet(item.description, q), url: `/projects/${item.slug}`, category: item.category });
    }
    for (const item of tenders) {
      results.push({ type: 'Tender', title: item.title, snippet: truncateSnippet(item.scope, q), url: `/procurement`, category: item.category });
    }
    for (const item of services) {
      results.push({ type: 'Service', title: item.title, snippet: truncateSnippet(item.content, q), url: `/services` });
    }
    for (const item of faqs) {
      results.push({ type: 'FAQ', title: item.question, snippet: truncateSnippet(item.answer, q), url: `/faqs` });
    }
    for (const item of sustainabilityProjects) {
      results.push({ type: 'Sustainability', title: item.name, snippet: truncateSnippet(item.description, q), url: `/sustainability`, category: item.status });
    }
    for (const item of sustainabilityPartners) {
      results.push({ type: 'Partner', title: item.name, snippet: truncateSnippet(item.category, q), url: `/sustainability`, category: item.category });
    }
    for (const item of informationItems) {
      results.push({ type: 'Info Center', title: item.title, snippet: truncateSnippet(item.description || '', q), url: `/information-center`, category: item.kind });
    }
    for (const item of employees) {
      results.push({ type: 'Employee', title: item.name, snippet: truncateSnippet(`${item.position}${item.department ? ' — ' + item.department : ''}`, q), url: `/about-us`, category: item.designation });
    }
    for (const item of impactHighlights) {
      results.push({ type: 'Impact', title: item.title, snippet: truncateSnippet(item.description, q), url: `/`, category: item.tag || undefined });
    }
    for (const item of orgLeaders) {
      results.push({ type: 'Leadership', title: item.name, snippet: truncateSnippet(`${item.role} — ${item.levelLabel}`, q), url: `/about-us`, category: item.levelLabel });
    }
    for (const item of announcements) {
      results.push({ type: 'Announcement', title: item.title, snippet: truncateSnippet(item.content, q), url: `/`, category: item.type });
    }
    for (const item of repositoryItems) {
      results.push({ type: 'Document', title: item.title, snippet: truncateSnippet(item.description || item.category, q), url: item.url, category: item.category });
    }

    // About page — search through JSON fields (missionVision, coreValues, timeline, background)
    if (aboutData) {
      const qLower = q.toLowerCase();
      if (aboutData.heroTitle && aboutData.heroTitle.toLowerCase().includes(qLower)) {
        results.push({ type: 'About Us', title: aboutData.heroTitle, snippet: truncateSnippet(aboutData.heroSubtitle || aboutData.heroTitle, q), url: '/about-us' });
      }
      if (aboutData.heroSubtitle && aboutData.heroSubtitle.toLowerCase().includes(qLower) &&
        !(aboutData.heroTitle && aboutData.heroTitle.toLowerCase().includes(qLower))) {
        results.push({ type: 'About Us', title: 'About TGDC', snippet: truncateSnippet(aboutData.heroSubtitle, q), url: '/about-us' });
      }

      const jsonSearches: { field: any; category: string }[] = [
        { field: aboutData.missionVision, category: 'Mission & Vision' },
        { field: aboutData.coreValues, category: 'Core Values' },
        { field: aboutData.timeline, category: 'Timeline' },
        { field: aboutData.background, category: 'Background' },
      ];

      for (const { field, category } of jsonSearches) {
        const matches = searchJsonArray(field, q);
        for (const match of matches.slice(0, 3)) {
          results.push({ type: 'About Us', title: match.title, snippet: match.snippet, url: '/about-us', category });
        }
      }
    }

    return NextResponse.json({ results, query: q });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
