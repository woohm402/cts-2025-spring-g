import { awsEngine } from '@repo/aws';
import { azureEngine } from '@repo/azure';
import { gcpEngine } from '@repo/gcp';
import { z } from 'zod';

Bun.serve({
  fetch: (request) => {
    try {
      const url = new URL(request.url);

      if (url.pathname === '/api/ssml-test' && request.method === 'POST')
        return handleSsmlTest(request);

      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return handleAnalyze(request);
      }

      return new Response(null, { status: 403 });
    } catch (err) {
      return new Response(
        JSON.stringify({
          message: err instanceof Error ? err.message : 'Unknown error',
        }),
        { status: 500 },
      );
    }
  },
  port: 4000,
});

const handleSsmlTest = async (request: Request): Promise<Response> => {
  const { ssml, language, type } = z
    .object({
      ssml: z.string(),
      type: z.enum(['GCP', 'AWS', 'AZURE']),
      language: z.enum(['ENGLISH', 'KOREAN']),
    })
    .parse(await request.json());

  switch (type) {
    case 'GCP':
      return new Response(await gcpEngine({ language, ssml }, null), {
        status: 200,
      });
    case 'AWS':
      return new Response(await awsEngine({ ssml, language }, null), {
        status: 200,
      });
    case 'AZURE':
      return new Response(
        await azureEngine(
          { ssml, language },
          {
            AZURE_SPEECH_KEY: z
              .string()
              .parse(import.meta.env.AZURE_SPEECH_KEY),
          },
        ),
        { status: 200 },
      );
  }
};

const handleAnalyze = async (request: Request): Promise<Response> => {
  try {
    const { audio } = await request.json();
    const filename = `audio_${Date.now()}.wav`;
    const filepath = `./tmp/${filename}`;

    // Ensure tmp directory exists
    await Bun.write(filepath, Buffer.from(audio, 'base64'));

    const result = await Bun.spawn([
      'python3',
      'apps/backend/analysis/analyze.py',
      filepath,
    ]);
    const stdout = result.stdout;
    const stderr = result.stderr;

    await Bun.write(filepath, new Uint8Array()); // Overwrite to clear

    // Ensure the type cast for stderr
    if (stderr && String(stderr).length > 0) {
      return new Response(JSON.stringify({ error: String(stderr) }), {
        status: 500,
      });
    }

    return new Response(String(stdout), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
      { status: 500 },
    );
  }
};
