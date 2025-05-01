import textToSpeech from "@google-cloud/text-to-speech";
import { z } from "zod";
import {
  PollyClient,
  SynthesizeSpeechCommand,
  VoiceId,
} from "@aws-sdk/client-polly";

Bun.serve({
  fetch: async (request) => {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/ssml-test" && request.method === "POST") {
        const { ssml, language, type } = z
          .object({
            ssml: z.string(),
            type: z.enum(["GCP", "AWS"]),
            language: z.enum(["ENGLISH", "KOREAN"]),
          })
          .parse(await request.json());

        switch (type) {
          case "GCP":
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
          case "AWS":
            const voiceMap: Record<typeof language, VoiceId> = {
              ENGLISH: "Joanna",
              KOREAN: "Seoyeon",
            };

            const command = new SynthesizeSpeechCommand({
              Engine: "standard",
              OutputFormat: "mp3",
              TextType: "ssml",
              Text: ssml,
              VoiceId: voiceMap[language],
            });

            const pollyResponse = await new PollyClient({
              region: "ap-northeast-2",
            }).send(command);

            if (!pollyResponse.AudioStream)
              throw new Error("No audio content from AWS Polly");

            const audioData =
              await pollyResponse.AudioStream.transformToByteArray();

            return new Response(audioData, { status: 200 });
        }
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
