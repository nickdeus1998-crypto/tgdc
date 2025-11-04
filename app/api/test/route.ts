// app/api/test/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    // Fetch all test records
    const tests = await prisma.test.findMany();
    return NextResponse.json(
      {
        message: 'Test endpoint working',
        data: tests,
      },
      { status: 200 }
    );
  } catch (error) {  
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Create a test record
    const test = await prisma.test.create({
      data: {
        message: 'Test message created at ' + new Date().toISOString(),
      },
    });
    return NextResponse.json(
      {
        message: 'Test record created',
        data: test,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating test record:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}