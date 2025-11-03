import { NextRequest, NextResponse } from 'next/server';
import { scheduleDareCleanup } from '@/lib/dare-logic';

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be called by a cron job or manually
    await scheduleDareCleanup();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Dare cleanup completed successfully' 
    });
  } catch (error) {
    console.error('Error in dare cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup dares' },
      { status: 500 }
    );
  }
}
