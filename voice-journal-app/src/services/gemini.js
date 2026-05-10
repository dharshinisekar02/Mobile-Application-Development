import { GROQ_API_KEY } from '../constants/keys';

// Step 1: Transcribe audio using Groq Whisper
async function transcribeAudio(audioUri) {
  console.log('[Groq] Fetching audio file...');
  const response = await fetch(audioUri);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  });
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'json');
  formData.append('language', 'en');

  console.log('[Groq] Transcribing audio...');
  const transcribeRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: formData,
  });

  if (!transcribeRes.ok) {
    const err = await transcribeRes.text();
    throw new Error(`Groq STT error ${transcribeRes.status}: ${err}`);
  }

  const data = await transcribeRes.json();
  console.log('[Groq] Transcript:', data.text);
  return data.text;
}

// Step 2: Process transcript with Llama 3
async function processTranscript(transcript) {
  console.log('[Groq] Processing with Llama...');

  const prompt = `You are an AI journal assistant. The user recorded a voice note and it was transcribed as:

"${transcript}"

Your tasks:
1. Rewrite it as a polished, warm diary entry (2–4 sentences, first person).
2. Detect the mood from exactly one of: Happy, Calm, Anxious, Sad, Excited, Frustrated.
3. Extract any reminders mentioned (e.g. "remind me to...", "I need to...").

Respond ONLY in this exact JSON format, no markdown, no extra text:
{
  "diary_entry": "polished diary entry here",
  "mood": "Happy",
  "reminders": [
    { "task": "Call mom", "time": "7:00 PM", "date": "Today" }
  ]
}

If no reminders are found, return "reminders": [].`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq LLM error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  console.log('[Groq] Raw LLM response:', raw);

  if (!raw) throw new Error('No response from Groq LLM');

  const clean = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    throw new Error(`JSON parse failed: ${e.message} — raw: ${clean.slice(0, 200)}`);
  }
}

// Main export — called from RecordScreen
export async function processVoiceEntry(audioUri) {
  if (!audioUri) throw new Error('Audio URI is null or undefined');

  // Step 1: Speech to text
  const transcript = await transcribeAudio(audioUri);
  if (!transcript) throw new Error('Transcript is empty');

  // Step 2: AI processing
  const result = await processTranscript(transcript);

  // Return combined result
  return {
    transcript,
    diary_entry: result.diary_entry,
    mood: result.mood,
    reminders: result.reminders ?? [],
  };
}