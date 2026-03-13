import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const row: any = await prisma.$queryRawUnsafe(
            'SELECT content FROM SustainabilityContent WHERE id = 1'
        );
        const content = row?.[0]?.content ? JSON.parse(row[0].content) : {};
        return NextResponse.json(content);
    } catch {
        return NextResponse.json({});
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const now = new Date().toISOString();
        await prisma.$executeRawUnsafe(
            `INSERT INTO SustainabilityContent (id, content, createdAt, updatedAt)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET content=excluded.content, updatedAt=excluded.updatedAt`,
            JSON.stringify(body),
            now,
            now
        );
        return NextResponse.json(body);
    } catch (e: any) {
        return NextResponse.json({ error: e?.message }, { status: 500 });
    }
}
