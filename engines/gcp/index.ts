import textToSpeech from '@google-cloud/text-to-speech';
import type { EngineFunction } from '@repo/protocol';

export const gcpEngine: EngineFunction = async ({ ssml, language }) => {
  const [response] =
    await new textToSpeech.TextToSpeechClient().synthesizeSpeech({
      input: { ssml: ssml },
      voice: {
        languageCode: { ENGLISH: 'en-US', KOREAN: 'ko-KR' }[language],
        ssmlGender: 'FEMALE',
      },
      audioConfig: { audioEncoding: 'MP3' },
    });

  if (!response.audioContent) throw new Error('No audio content');

  return response.audioContent;
};
