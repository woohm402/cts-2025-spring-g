import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Amphora, Cloud, Loader2, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

enum Language {
  KOREAN = 'KOREAN',
  ENGLISH = 'ENGLISH',
}

enum Model {
  GCP = 'GCP',
  AWS = 'AWS',
  AZURE = 'AZURE',
}

const getDefaultSsml = ({
  language,
  model,
}: {
  language: Language;
  model: Model;
}) => {
  return {
    [Model.GCP]: {
      [Language.KOREAN]: `<speak>
<emphasis level="strong">봄 시즌 특별 세일이 시작되었습니다!</emphasis>
<break time="500ms"/>
<emphasis level="moderate">인기 브랜드 전품목 할인 진행중</emphasis>
<break time="400ms"/>
<emphasis level="reduced">수천 가지의 상품을 둘러보세요</emphasis>
<break time="300ms"/>
<emphasis level="strong">최대 50% 할인!</emphasis>
<break time="400ms"/>
<emphasis level="moderate">이 특별한 기회를 놓치지 마세요.</emphasis>
</speak>`,
      [Language.ENGLISH]: `<speak>
<emphasis level="strong">Welcome to our Amazing Spring Sale!</emphasis>
<break time="500ms"/>
<emphasis level="moderate">All your favorite brands are now on discount.</emphasis>
<break time="400ms"/>
<emphasis level="reduced">Browse through thousands of items</emphasis>
<break time="300ms"/>
<emphasis level="strong">at up to 50% off!</emphasis>
<break time="400ms"/>
<emphasis level="moderate">Don't miss out on these incredible deals.</emphasis>
</speak>`,
    },
    [Model.AWS]: {
      [Language.KOREAN]: `<speak>
        <prosody rate="medium" pitch="+5%">
          봄 신상품 컬렉션이 도착했습니다!
        </prosody>
        <break time="400ms"/>

        <prosody rate="fast" pitch="+15%">
          최대 70% 할인의 놀라운 기회를 잡으세요!
        </prosody>
        <break time="300ms"/>

        <prosody rate="medium" pitch="+10%">
          유명 브랜드부터 트렌디한 신상품까지, 단독 특가
        </prosody>
        <break time="400ms"/>

        <prosody rate="x-fast" pitch="+20%">
          한정 수량으로 준비된 특별한 혜택!
        </prosody>
        <break time="300ms"/>

        <prosody rate="medium" pitch="+5%">
          지금 바로 쇼핑을 시작해보세요.
        </prosody>
      </speak>`,
      [Language.ENGLISH]: `<speak>
        <prosody rate="medium" pitch="+5%">
          Welcome to our spectacular Spring Collection!
        </prosody>
        <break time="400ms"/>

        <prosody rate="fast" pitch="+15%">
          Get ready for incredible deals up to 70% off!
        </prosody>
        <break time="300ms"/>

        <prosody rate="medium" pitch="+10%">
          Designer brands, latest trends, and exclusive items
        </prosody>
        <break time="400ms"/>

        <prosody rate="x-fast" pitch="+20%">
          Limited time offer - Don't miss out!
        </prosody>
        <break time="300ms"/>

        <prosody rate="medium" pitch="+5%">
          Shop now and transform your wardrobe today.
        </prosody>
      </speak>`,
    },
    [Model.AZURE]: {
      [Language.KOREAN]: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ko-KR">
      <voice name="ko-KR-SunHiNeural">
        <prosody rate="medium" pitch="high">
          <emphasis level="strong">봄맞이 럭셔리 세일 페스티벌!</emphasis>
        </prosody>
        <break time="400ms"/>

        <prosody rate="fast" pitch="+10%">
          전 상품 최대 60% 할인 진행중
        </prosody>
        <break time="300ms"/>

        <emphasis level="moderate">
          <prosody rate="medium" pitch="+5%">
            명품 브랜드부터 시즌 신상품까지
          </prosody>
        </emphasis>
        <break time="400ms"/>

        <prosody volume="loud" rate="medium">
          <emphasis level="strong">오직 이번 주말만!</emphasis>
        </prosody>
        <break time="300ms"/>

        <prosody rate="slow" pitch="low">
          지금 바로 방문하셔서 특별한 혜택을 누리세요.
        </prosody>
        </voice>
      </speak>`,
      [Language.ENGLISH]: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="en-US-JennyMultilingualNeural">
        <prosody rate="medium" pitch="high">
          <emphasis level="strong">Luxury Spring Sale Festival!</emphasis>
        </prosody>
        <break time="400ms"/>

        <prosody rate="fast" pitch="+10%">
          Up to 60% off on all items
        </prosody>
        <break time="300ms"/>

        <emphasis level="moderate">
          <prosody rate="medium" pitch="+5%">
            From luxury brands to seasonal new arrivals
          </prosody>
        </emphasis>
        <break time="400ms"/>

        <prosody volume="loud" rate="medium">
          <emphasis level="strong">This weekend only!</emphasis>
        </prosody>
        <break time="300ms"/>

        <prosody rate="slow" pitch="low">
          Visit now and enjoy these exclusive benefits.
        </prosody>
        </voice>
      </speak>`,
    },
  }[model][language];
};

const languages = [
  { name: Language.KOREAN, description: '한국인이 사용하는 언어' },
  { name: Language.ENGLISH, description: '미국인이 사용하는 언어' },
];

const models = [
  {
    name: Model.GCP,
    description: 'Google Speech-to-Text',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    name: Model.AWS,
    description: 'AWS Polly',
    icon: <Amphora className="h-5 w-5" />,
  },
  {
    name: Model.AZURE,
    description: 'Azure Text-to-Speech',
    icon: <Cloud className="h-5 w-5" />,
  },
];

export const App = () => {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[1]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const ssml =
    input ||
    getDefaultSsml({
      language: selectedLanguage.name,
      model: selectedModel.name,
    });

  const handleRunModel = async () => {
    const audioContext = new AudioContext();
    setIsLoading(true);
    try {
      const response = await fetch('/api/ssml-test', {
        body: JSON.stringify({
          ssml,
          type: selectedModel.name,
          language: selectedLanguage.name,
        }),
        method: 'POST',
      });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      } else {
        const err = await response.json();
        const message =
          err != null &&
          typeof err === 'object' &&
          'message' in err &&
          typeof err.message === 'string'
            ? err.message
            : '실패: 알 수 없는 오류';
        toast(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 grid-cols-3 px-8 py-6 min-h-dvh">
      <div className="flex flex-col gap-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Languages</h2>
          <div className="grid gap-3">
            {languages.map((language) => (
              <Card
                key={language.name}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedLanguage.name === language.name
                    ? 'border-2 border-primary'
                    : ''
                }`}
                onClick={() => setSelectedLanguage(language)}
              >
                <CardHeader>
                  <CardTitle>{language.name}</CardTitle>
                  <CardDescription>{language.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Models</h2>
          <div className="grid gap-3">
            {models.map((model) => (
              <Card
                key={model.name}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedModel.name === model.name
                    ? 'border-2 border-primary'
                    : ''
                }`}
                onClick={() => setSelectedModel(model)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {model.icon} {model.name}
                  </CardTitle>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-2 h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">SSML 입력</CardTitle>
            <CardDescription>
              선택: {selectedModel.name}, {selectedLanguage.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="my-4 flex-1 flex flex-col">
              <h3 className="mb-2 text-sm font-medium">Input</h3>
              <Textarea
                value={ssml}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text here..."
                className="flex-1 font-[consolas] resize-none"
              />
            </div>
            <Button
              onClick={handleRunModel}
              disabled={isLoading || !ssml}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Run Model'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};
