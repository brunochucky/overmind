import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import { uploadFile } from "@/lib/s3";

// Force Node.js runtime for S3 access
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      console.error("Deepgram API key not configured");
      return NextResponse.json(
        { error: "Deepgram API key not configured" },
        { status: 500 }
      );
    }

    const deepgram = createClient(apiKey);
    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob;
    const language = (formData.get("language") as string) || "en-US";
    const meetingId = formData.get("meetingId") as string;

    console.log("Transcription request received:", {
      hasAudio: !!audioFile,
      audioSize: audioFile?.size,
      language,
      meetingId,
    });

    if (!audioFile) {
      console.error("No audio file provided");
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    if (!meetingId) {
      console.error("Meeting ID is required");
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    console.log("Audio buffer created, size:", buffer.length);

    // Upload audio file to S3
    // const audioFileName = `uploads/${meetingId}-${Date.now()}.webm`;
    // console.log("Uploading audio file to S3 as:", audioFileName);

    // const audioPath = await uploadFile(buffer, audioFileName);
    // console.log("Audio file uploaded successfully to S3:", audioPath);

    const audioPath = "/";

    // Transcribe audio with specified language
    console.log("Starting Deepgram transcription...");
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-2",
        language: language,
        smart_format: true,
        punctuate: true,
        utterances: true,
      }
    );

    if (error) {
      console.error("Deepgram transcription error:", error);
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 500 }
      );
    }

    const transcript =
      result.results?.channels[0]?.alternatives[0]?.transcript || "";
    console.log(
      "Transcription completed, transcript length:",
      transcript.length
    );

    return NextResponse.json({ transcript, audioPath });
  } catch (error) {
    console.error("Error in transcription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
