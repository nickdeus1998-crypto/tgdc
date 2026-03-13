import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


const DEFAULTS = { label: 'Methodology Details', link: '/information-center', visible: true };

export async function GET() {
    try {
        const row = await prisma.siteSetting.findUnique({ where: { key: 'methodology_button' } });
        if (row) {
            try { return NextResponse.json(JSON.parse(row.value)); } catch { /* fallback */ }
        }
        return NextResponse.json(DEFAULTS);
    } catch {
        return NextResponse.json(DEFAULTS);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const value = JSON.stringify({
            label: body.label || DEFAULTS.label,
            link: body.link || DEFAULTS.link,
            visible: body.visible !== false,
        });

        await prisma.siteSetting.upsert({
            where: { key: 'methodology_button' },
            update: { value },
            create: { key: 'methodology_button', value },
        });

        return NextResponse.json(JSON.parse(value));
    } catch (error) {
        console.error('POST /api/methodology-button error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
