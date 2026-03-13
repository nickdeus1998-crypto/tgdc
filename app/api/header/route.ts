import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET() {
    try {
        const settings = await prisma.headerSettings.findFirst();
        return NextResponse.json(settings || {}, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching header settings:', error);
        return NextResponse.json({ error: 'Failed to fetch header settings', details: error.message }, { status: 500 });
    } finally {
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const existing = await prisma.headerSettings.findFirst();

        // Destructure to remove fields that should not be manually updated
        const { id, createdAt, updatedAt, ...updateData } = data;

        let settings;
        if (existing) {
            settings = await prisma.headerSettings.update({
                where: { id: existing.id },
                data: updateData,
            });
        } else {
            settings = await prisma.headerSettings.create({
                data: updateData,
            });
        }

        return NextResponse.json(settings, { status: 200 });
    } catch (error: any) {
        console.error('Error saving header settings:', error);
        return NextResponse.json({ error: 'Failed to save header settings', details: error.message }, { status: 500 });
    } finally {
    }
}
