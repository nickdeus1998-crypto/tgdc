import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET() {
    try {
        // Using raw SQL to avoid potential caching issues in dev server
        const faqs: any[] = await prisma.$queryRawUnsafe('SELECT * FROM FAQ ORDER BY "order" ASC, createdAt DESC');
        return NextResponse.json(faqs);
    } catch (error) {
        console.error('GET /api/faqs error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
    }
}
