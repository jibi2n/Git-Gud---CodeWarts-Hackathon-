import { NextResponse } from 'next/server';
import { accessControlService } from '@/lib/services/accessControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const matrix = accessControlService.getMatrix();
    return NextResponse.json(matrix);
  } catch (error) {
    console.error('Access scope API error:', error);
    return NextResponse.json({ error: 'Failed to load access scope' }, { status: 500 });
  }
}
