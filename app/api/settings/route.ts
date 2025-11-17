
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  highlightContext: z.string().min(1),
});

export async function GET() {
  try {
    let settings = await prisma.appSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.appSettings.create({
        data: {
          highlightContext: 'interview with company about needs and opportunities',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Try to update existing settings first
    let settings = await prisma.appSettings.findFirst();
    
    if (settings) {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: validatedData,
      });
    } else {
      // Create new settings if none exist
      settings = await prisma.appSettings.create({
        data: validatedData,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
