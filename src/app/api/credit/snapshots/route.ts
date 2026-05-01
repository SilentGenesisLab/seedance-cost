import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { collectCreditSnapshots } from '@/lib/credit-service';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fetchRun = await collectCreditSnapshots();

  return NextResponse.json({ fetchRun });
}
