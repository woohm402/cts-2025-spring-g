import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

export const awsPollySsmlToSpeech = async ({ ssml }: { ssml: string }) => {
  const command = new SynthesizeSpeechCommand({
    Engine: 'standard',
    OutputFormat: 'mp3',
    TextType: 'ssml',
    Text: ssml,
    VoiceId: 'Joanna',
  });

  const pollyResponse = await new PollyClient({
    region: 'ap-northeast-2',
  }).send(command);

  if (!pollyResponse.AudioStream) throw new Error('No audio content from AWS Polly');

  const audioData = await pollyResponse.AudioStream.transformToByteArray();

  return audioData;
};
