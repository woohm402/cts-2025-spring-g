import textToSpeech from "@google-cloud/text-to-speech";
import { z } from "zod";

Bun.serve({
  fetch: async (request) => {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/ssml-test" && request.method === "POST") {
        const { ssml, language } = z
          .object({
            ssml: z.string(),
            type: z.enum(["GCP"]),
            language: z.enum(["ENGLISH", "KOREAN"]),
          })
          .parse(await request.json());

        const [response] =
          await new textToSpeech.TextToSpeechClient().synthesizeSpeech({
            input: { ssml: ssml },
            voice: {
              languageCode: { ENGLISH: "en-US", KOREAN: "ko-KR" }[language],
              ssmlGender: "FEMALE",
            },
            audioConfig: { audioEncoding: "MP3" },
          });

        if (!response.audioContent) throw new Error("No audio content");

        return new Response(response.audioContent, { status: 200 });
      } else {
        return new Response(null, { status: 403 });
      }
    } catch (err) {
      return new Response(
        JSON.stringify({
          message: err instanceof Error ? err.message : "Unknown error",
        }),
        { status: 500 },
      );
    }
  },
  port: 4000,
});
