import {
  PollyClient,
  SynthesizeSpeechCommand,
  type VoiceId,
} from '@aws-sdk/client-polly';
import type { EngineFunction } from '@repo/protocol';

export const awsEngine: EngineFunction = async ({ ssml, language }) => {
  const voiceMap: Record<typeof language, VoiceId> = {
    ENGLISH: 'Joanna',
    KOREAN: 'Seoyeon',
  };

  const command = new SynthesizeSpeechCommand({
    Engine: 'standard',
    OutputFormat: 'mp3',
    TextType: 'ssml',
    Text: ssml,
    VoiceId: voiceMap[language],
  });

  const pollyResponse = await new PollyClient({
    region: 'ap-northeast-2',
  }).send(command);

  if (!pollyResponse.AudioStream)
    throw new Error('No audio content from AWS Polly');

  const audioData = await pollyResponse.AudioStream.transformToByteArray();

  return audioData;
};
