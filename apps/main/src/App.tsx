import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap, Amphora } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

enum Language {
  KOREAN = "KOREAN",
  ENGLISH = "ENGLISH",
}

enum Model {
  GCP = "GCP",
  AWS = "AWS",
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
<emphasis level="strong">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="moderate">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="none">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="reduced">I want something just like this.</emphasis>
<break time="1s"/>
</speak>`,
      [Language.ENGLISH]: `<speak>
<emphasis level="strong">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="moderate">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="none">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="reduced">I want something just like this.</emphasis>
<break time="1s"/>
</speak>`,
    },
    [Model.AWS]: {
      [Language.KOREAN]: `<speak>
<emphasis level="strong">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="moderate">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="none">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="reduced">I want something just like this.</emphasis>
<break time="1s"/>
</speak>`,
      [Language.ENGLISH]: `<speak>
        <prosody rate="fast" pitch="+10%">
          You won't believe this!
        </prosody>
        <break time="300ms"/>

        <prosody rate="medium">
          For today only...
        </prosody>
        <break time="400ms"/>

        <prosody rate="x-fast" pitch="+15%">
          Everything is up to seventy percent off!
        </prosody>
        <break time="300ms"/>

        <prosody rate="fast" pitch="+5%">
          Stocks are limited — so hurry!
        </prosody>
        <break time="200ms"/>

        <prosody rate="medium">
          Shop now and treat yourself.
        </prosody>
      </speak>`,
    },
  }[model][language];
};

const languages = [
  { name: Language.KOREAN, description: "한국인이 사용하는 언어" },
  { name: Language.ENGLISH, description: "미국인이 사용하는 언어" },
];

const models = [
  {
    name: Model.GCP,
    description: "Google Speech-to-Text",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    name: Model.AWS,
    description: "AWS Polly",
    icon: <Amphora className="h-5 w-5" />,
  },
];

export const App = () => {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[1]);
  const [input, setInput] = useState<string>("");
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
      const response = await fetch("/api/ssml-test", {
        body: JSON.stringify({
          ssml,
          type: selectedModel.name,
          language: selectedLanguage.name,
        }),
        method: "POST",
      });
      if (!response.ok) {
        const err = await response.json();
        const message =
          err != null &&
          typeof err === "object" &&
          "message" in err &&
          typeof err.message === "string"
            ? err.message
            : "실패: 알 수 없는 오류";
        toast(message);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
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
                    ? "border-2 border-primary"
                    : ""
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
                    ? "border-2 border-primary"
                    : ""
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
                "Run Model"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};
