import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJwt, getJwtSecret } from '@/app/lib/auth';

function isAdmin(request: Request) {
    const cookie = request.headers.get('cookie') || '';
    const m = cookie.match(/(?:^|; )user_token=([^;]+)/);
    const token = m ? decodeURIComponent(m[1]) : null;
    const payload = token ? verifyJwt(token, getJwtSecret()) : null;
    return payload?.role === 'admin';
}

export async function GET() {
    try {
        const row = await prisma.sustainabilityContent.findUnique({
            where: { id: 1 }
        });
        const content = row?.content ? JSON.parse(row.content) : {};
        return NextResponse.json(content);
    } catch (e: any) {
        // If table doesn't exist yet, return empty object gracefully
        console.error('GET /api/sustainability/content error:', e?.message || e);
        return NextResponse.json({});
    }
}

export async function POST(req: Request) {
    try {
        if (!isAdmin(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('POST /api/sustainability/content - saving tab content');

        const updated = await prisma.sustainabilityContent.upsert({
            where: { id: 1 },
            update: {
                content: JSON.stringify(body),
                updatedAt: new Date(),
            },
            create: {
                id: 1,
                content: JSON.stringify(body),
            },
        });

        console.log('POST /api/sustainability/content - saved successfully');
        return NextResponse.json(JSON.parse(updated.content));
    } catch (e: any) {
        const message = e?.message || 'Unknown error';
        console.error('POST /api/sustainability/content error:', message);

        // Check if it's a table-not-found error and give a clear message
        if (message.includes('no such table') || message.includes('does not exist') || message.includes('P2021')) {
            return NextResponse.json(
                { error: 'SustainabilityContent table not found. Please run: npx prisma db push' },
                { status: 500 }
            );
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
