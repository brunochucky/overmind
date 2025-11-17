
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { fileExists, deleteFile, getDownloadUrl } from '@/lib/s3';

export const dynamic = "force-dynamic";
export const runtime = 'nodejs'; // Force Node.js runtime for S3 access

const updateMeetingSchema = z.object({
  transcript: z.string().optional(),
  duration: z.number().optional(),
  audioPath: z.string().optional(),
  recap: z.string().optional(),
  highlights: z.string().optional(),
  status: z.enum(['PENDING', 'RECORDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Generate signed URL for S3 audio file if it exists
    let audioUrl = null;
    if (meeting.audioPath) {
      try {
        const exists = await fileExists(meeting.audioPath);
        if (exists) {
          // Generate signed URL valid for 1 hour
          audioUrl = await getDownloadUrl(meeting.audioPath, 3600);
        }
      } catch (error) {
        console.error('Error generating audio URL:', error);
      }
    }

    return NextResponse.json({ ...meeting, audioUrl });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateMeetingSchema.parse(body);

    const meeting = await prisma.meeting.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, get the meeting to check if it has an audio file
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Delete the audio file from S3 if it exists
    if (meeting.audioPath) {
      try {
        console.log('Deleting audio file from S3:', meeting.audioPath);
        await deleteFile(meeting.audioPath);
        console.log('Audio file deleted successfully from S3');
      } catch (error) {
        console.error('Error deleting audio file from S3:', error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete the meeting from database
    await prisma.meeting.delete({
      where: { id: params.id },
    });

    console.log('Meeting deleted successfully:', params.id);

    return NextResponse.json({ 
      success: true,
      message: 'Meeting deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}
