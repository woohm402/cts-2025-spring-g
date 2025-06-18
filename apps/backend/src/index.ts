import { spawn } from 'child_process';
import OpenAI from 'openai';
import { z } from 'zod';
import { awsPollySsmlToSpeech } from './lib/awsPollySsmlToSpeech';

type DB = {
  transcription: string;
  ssml: string;
  audio: Uint8Array<ArrayBufferLike>;
};
let db: Partial<DB> = {};

Bun.serve({
  fetch: async (request) => {
    const url = new URL(request.url);

    try {
      if (url.pathname === '/api/session' && request.method === 'POST') {
        const formData = await request.formData();
        const audioFile = formData.get('file');
        if (!(audioFile instanceof File)) throw new Error('no file');
        handleSts(audioFile);
        return new Response(null, { status: 204 });
      }
      if (url.pathname === '/api/session/transcription' && request.method === 'GET')
        return new Response(JSON.stringify({ transcription: db.transcription ?? null }), { status: 200 });
      if (url.pathname === '/api/session/ssml' && request.method === 'GET')
        return new Response(JSON.stringify({ ssml: db.ssml ?? null }), { status: 200 });
      if (url.pathname === '/api/session/audio' && request.method === 'GET')
        return new Response(db.audio ?? null, { status: 200 });
      if (url.pathname === '/api/session/analyze' && request.method === 'POST') return generateAnalysis();

      return new Response(null, { status: 404 });
    } catch (err) {
      console.error(err);
      return new Response(null, { status: 500 });
    }
  },
  port: 4000,
});

const handleSts = async (file: File) => {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: z.string().parse(import.meta.env.OPENAI_API_KEY),
  });

  console.info('start');

  db = {};

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'verbose_json',
  });

  const segments = transcription.segments;

  console.info('transcribed');
  db.transcription = JSON.stringify(segments);

  if (segments === undefined) throw new Error();

  // Build a prompt for OpenAI to convert the segments to SSML with translation and emotional cues
  const prompt = `Translate the following Korean transcript segments to English and convert to SSML format with appropriate pauses based on timestamps. Include emotional cues for an American show host delivery style with high energy and enthusiasm: ${segments.map((seg) => `Text: "${seg.text}" (${seg.start}s to ${seg.end}s)`).join('\n')}`;

  // Step 3: Send to OpenAI to generate SSML with translation and emotion
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert at translating Korean to English and converting speech to SSML format. The input will be Korean speech segments that need to be translated to English. Create SSML that makes the speech sound like a natural, enthusiastic American show host with appropriate emotions.\n\nTranslate the Korean content to natural, idiomatic English that sounds like an American show host would say it. Then structure this content with the following standard SSML tags that work with AWS Polly:\n\n1. <prosody rate="x%" pitch="x%" volume="x%"> for adjusting speech characteristics (e.g., rate="120%", pitch="+10%", volume="+6dB")\n2. <emphasis level="strong/moderate/reduced"> for emphasis\n3. <break strength="none/x-weak/weak/medium/strong/x-strong" time="[number]s/[number]ms"/> for pauses\n4. <say-as interpret-as="characters/spell-out/cardinal/ordinal/fraction/unit/date/time/telephone/address"> for special pronunciation\n5. <p> and <s> for paragraph and sentence structure\n\nMake the delivery energetic and engaging with varied intonation typical of American show hosts. For a show host style:\n- Use moderate to fast speaking rates with prosody rate="110%" to 130%"\n- Vary pitch for excitement with prosody pitch="+10%" to "+20%"\n- Use emphasis tags on key words\n- Insert strategic pauses before important points\n- Structure content in clear sentences and paragraphs\n\nIMPORTANT: Do NOT include markdown code formatting or any XML declaration in your response. Return ONLY the valid SSML content with the root <speak> element. I will pass your exact response directly to AWS Polly, so it must be pure, valid SSML with no additional formatting or explanation.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  let ssml = completion.choices[0].message.content;

  if (ssml === null) throw new Error('no ssml created');

  // Clean up the SSML response - remove any markdown code formatting
  if (ssml.includes('```xml')) {
    ssml = ssml.replace(/```xml\s*/, '').replace(/\s*```\s*$/, '');
  } else if (ssml.includes('```')) {
    ssml = ssml.replace(/```\s*/, '').replace(/\s*```\s*$/, '');
  }

  // Ensure we have a valid SSML document
  if (!ssml.trim().startsWith('<speak')) {
    ssml = `<speak>${ssml}</speak>`;
  }

  console.info('ssml', ssml);
  db.ssml = ssml;

  // Step 4: Send the SSML to AWS Polly
  const result = await awsPollySsmlToSpeech({ ssml });
  console.info('result', result);
  db.audio = result;
};

const generateAnalysis = async () => {
  try {
    if (!db.audio) {
      return new Response(JSON.stringify({ error: 'No audio data available' }), { status: 400 });
    }

    const result = await new Promise((resolve, reject) => {
      const python = spawn('python3', ['/analysis/analyze.py']);
      let data = '';

      if (db.audio) {
        python.stdin.write(Buffer.from(db.audio));
      } else {
        throw new Error('Audio data is undefined');
      }
      python.stdin.end();

      python.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });

      python.stderr.on('data', (err) => {
        console.error('stderr:', err.toString());
      });

      python.on('close', () => {
        try {
          console.info('Raw output from Python:', data);
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (_) {
          reject(new Error('Failed to parse analysis result'));
        }
      });
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error('Analysis error:', err);
    return new Response(JSON.stringify({ error: 'Analysis failed' }), { status: 500 });
  }
};
