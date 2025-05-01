import type { EngineFunction, Language } from '@repo/protocol';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export const azureEngine: EngineFunction<{ AZURE_SPEECH_KEY: string }> = async (
  { ssml, language },
  { AZURE_SPEECH_KEY },
) => {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    AZURE_SPEECH_KEY,
    'koreacentral',
  );

  const voiceNameMap: Record<Language, string> = {
    ENGLISH: 'en-US-JennyMultilingualNeural',
    KOREAN: 'ko-KR-SunHiNeural',
  };

  const languageMap: Record<Language, string> = {
    ENGLISH: 'en-US',
    KOREAN: 'ko-KR',
  };

  speechConfig.speechSynthesisVoiceName = voiceNameMap[language];
  speechConfig.speechSynthesisLanguage = languageMap[language];

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  const result = await new Promise<sdk.SpeechSynthesisResult>(
    (resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          synthesizer.close();
          resolve(result);
        },
        (error) => {
          synthesizer.close();
          reject(error);
        },
      );
    },
  );

  if (!result.audioData) throw new Error(result.errorDetails);

  return result.audioData;
};
