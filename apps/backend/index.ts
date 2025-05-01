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
