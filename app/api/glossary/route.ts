import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GlossaryTerm } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const terms = await GlossaryTerm.find({}).sort({ term: 1 });
    return NextResponse.json(terms, { status: 200 });
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    return NextResponse.json({ error: 'Internal server error while fetching glossary' }, { status: 500 });
  }
}
