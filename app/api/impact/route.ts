import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'impact_baseline.json');
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    return NextResponse.json({
      projection: {
        clusterSize: data.clusterLevel.clusterSize,
        flaggedThisWeek: data.clusterLevel.flaggedThisWeek,
        projectedDropoutsWithoutIntervention: data.clusterLevel.projectedDropoutsWithoutIntervention,
        projectedDropoutsWithIntervention: data.clusterLevel.projectedDropoutsWithIntervention,
        preventionRate: data.clusterLevel.preventionRate,
        intervalLow: data.clusterLevel.intervalLow,
        intervalHigh: data.clusterLevel.intervalHigh,
      },
      nationalProjection: data.nationalLevel,
      citations: data.citations,
      methodology: data.methodology,
    });
  } catch (error) {
    console.error('Impact API error:', error);
    return NextResponse.json({ error: 'Failed to load impact data' }, { status: 500 });
  }
}
