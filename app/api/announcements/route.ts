import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET() {
    try {
        // Fetch from both sources:
        // 1. Dedicated Announcement model (admin-created announcements)
        // 2. News items with category 'announcement' / 'alert' (same as homepage floating widget)

        const [dedicated, newsAnnouncements] = await Promise.all([
            prisma.announcement.findMany({
                where: { isActive: true, isPublic: true },
                orderBy: [
                    { scheduledDate: 'desc' },
                    { createdAt: 'desc' },
                ],
            }),
            prisma.news.findMany({
                where: {
                    category: {
                        in: ['announcement', 'Announcement', 'alert', 'Alert'],
                    },
                },
                orderBy: { date: 'desc' },
            }),
        ]);

        // Normalize news items into the same shape
        const fromNews = newsAnnouncements.map((n: any) => ({
            id: `news-${n.id}`,
            title: n.title,
            content: n.content,
            type: n.category || 'Announcement',
            priority: 'Normal',
            scheduledDate: n.date ? n.date.toISOString() : null,
            createdAt: n.createdAt.toISOString(),
            coverImage: n.coverImage || null,
            source: 'news',
        }));

        const fromDedicated = dedicated.map((a: any) => ({
            id: `ann-${a.id}`,
            title: a.title,
            content: a.content,
            type: a.type,
            priority: a.priority,
            scheduledDate: a.scheduledDate ? a.scheduledDate.toISOString() : null,
            createdAt: a.createdAt.toISOString(),
            coverImage: null,
            source: 'announcement',
        }));

        // Merge and sort by date descending
        const all = [...fromDedicated, ...fromNews].sort((a, b) => {
            const da = new Date(a.scheduledDate || a.createdAt).getTime();
            const db = new Date(b.scheduledDate || b.createdAt).getTime();
            return db - da;
        });

        return NextResponse.json(all);
    } catch (e) {
        console.error('Public announcements fetch error', e);
        return NextResponse.json([], { status: 500 });
    } finally {
    }
}
