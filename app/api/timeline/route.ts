import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { TimelineEvent } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const events = await TimelineEvent.find({}).sort({ date: 1 });
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 });
  }
}
