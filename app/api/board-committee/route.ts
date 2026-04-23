import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const records = await prisma.boardCommittee.findMany({
      where: { isActive: true },
      orderBy: [{ levelOrder: 'asc' }, { columnOrder: 'asc' }, { id: 'asc' }],
    });
    const groups = records.reduce<Record<number, { label: string; members: typeof records }>>((acc, member) => {
      const key = member.levelOrder;
      if (!acc[key]) {
        acc[key] = { label: member.levelLabel, members: [] as typeof records };
      }
      acc[key].members.push(member);
      return acc;
    }, {});
    const levels = Object.keys(groups)
      .map((order) => ({
        order: Number(order),
        label: groups[Number(order)].label,
        members: groups[Number(order)].members,
      }))
      .sort((a, b) => a.order - b.order);
    return NextResponse.json({ levels });
  } catch (error) {
    console.error('GET /api/board-committee error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
