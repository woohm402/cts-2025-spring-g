import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Zap, Brain, Bot, BarChart } from "lucide-react";

const models = [
  {
    id: "whisper",
    name: "Whisper",
    description: "다양한 언어를 지원하는 범용 음성 인식 모델",
    icon: <Sparkles className="h-5 w-5" />,
    category: "audio",
    tags: ["다국어 지원", "정확성", "잡음 처리"],
  },
  {
    id: "google-speech",
    name: "Google Speech-to-Text",
    description: "실시간 스트리밍과 사전 녹음된 오디오 모두 지원하는 모델",
    icon: <Zap className="h-5 w-5" />,
    category: "audio",
    tags: ["빠른 처리", "실시간", "API 통합"],
  },
  {
    id: "microsoft-azure",
    name: "Microsoft Azure Speech",
    description: "기업용 음성 인식 솔루션으로 정확도와 확장성 제공",
    icon: <Brain className="h-5 w-5" />,
    category: "audio",
    tags: ["기업용", "사용자 지정", "다양한 도메인"],
  },
  {
    id: "assembly-ai",
    name: "Assembly AI",
    description: "감정 분석과 요약 기능을 제공하는 고급 음성 인식 모델",
    icon: <Bot className="h-5 w-5" />,
    category: "audio",
    tags: ["감정 분석", "콘텐츠 요약", "맞춤형"],
  },
  {
    id: "korean-stt",
    name: "한국어 특화 STT",
    description: "한국어에 최적화된 음성 인식 모델로 방언과 억양도 정확히 인식",
    icon: <BarChart className="h-5 w-5" />,
    category: "audio",
    tags: ["한국어 특화", "방언 인식", "고정밀도"],
  },
];

export const App = () => {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleModelSelect = (model: (typeof models)[0]) => {
    setSelectedModel(model);
    setOutput("");
  };

  const handleRunModel = async () => {
    setIsLoading(true);
    setOutput("");

    // Simulate API call with timeout
    setTimeout(() => {
      setOutput(
        `This is a simulated response from ${selectedModel.name}:\n\nQuantum computing is like having a super-powered calculator that can try many answers at once instead of one at a time. Regular computers use bits (0s and 1s), but quantum computers use "qubits" that can be 0, 1, or both simultaneously - a bit like being in multiple places at once. This special property lets quantum computers solve certain complex problems much faster than regular computers.`,
      );
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="grid gap-6 grid-cols-3 px-8 py-6">
      <div className="col-span-1">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Models</h2>
          <div className="grid gap-3">
            {models.map((model) => (
              <Card
                key={model.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedModel.id === model.id ? "border-2 border-primary" : ""
                }`}
                onClick={() => handleModelSelect(model)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {model.icon}
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <CardDescription>{model.description}</CardDescription>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {model.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedModel.icon}
              {selectedModel.name}
            </CardTitle>
            <CardDescription>{selectedModel.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="test" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="test">Test Model</TabsTrigger>
                <TabsTrigger value="settings">Model Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="test" className="space-y-4">
                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-medium">Input</h3>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text here..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button
                  onClick={handleRunModel}
                  disabled={isLoading || !input.trim()}
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
                {output && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-medium">Output</h3>
                    <div className="rounded-md border bg-muted/50 p-4">
                      <pre className="whitespace-pre-wrap text-sm">
                        {output}
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="settings">
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium">Model Parameters</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure parameters for {selectedModel.name}. These
                      settings affect the model's output.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">
                          Temperature
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          defaultValue="0.7"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Precise</span>
                          <span>Creative</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Max Length
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="4000"
                          step="100"
                          defaultValue="2000"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Short</span>
                          <span>Long</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Selected model:{" "}
              <span className="font-medium">{selectedModel.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setOutput("")}>
              Clear Output
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
