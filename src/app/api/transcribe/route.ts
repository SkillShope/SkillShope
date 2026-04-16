import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB (Whisper limit)

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "Transcription not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio");

  if (!audio || !(audio instanceof Blob)) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  if (audio.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Audio file too large (max 25 MB)" }, { status: 400 });
  }

  // Forward to OpenAI Whisper
  const whisperForm = new FormData();
  whisperForm.append("file", audio, "recording.webm");
  whisperForm.append("model", "whisper-1");
  whisperForm.append("language", "en");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: whisperForm,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Transcribe] Whisper API error:", response.status, errorText);
    return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
  }

  const result = await response.json();
  return NextResponse.json({ text: result.text });
}
