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
import { Loader2, Zap } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

const defaultSsml = `
<speak>
<emphasis level="strong">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="moderate">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="none">I want something just like this.</emphasis>
<break time="1s"/>
<emphasis level="reduced">I want something just like this.</emphasis>
<break time="1s"/>
</speak>
`;

const models = [
  {
    name: "Google Speech-to-Text",
    description: "실시간 스트리밍과 사전 녹음된 오디오 모두 지원하는 모델",
    icon: <Zap className="h-5 w-5" />,
  },
];

export const App = () => {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [input, setInput] = useState(defaultSsml);
  const [isLoading, setIsLoading] = useState(false);

  const handleModelSelect = (model: (typeof models)[0]) => {
    setSelectedModel(model);
  };

  const handleRunModel = () => {
    const audioContext = new AudioContext();
    setIsLoading(true);
    fetch("/api/ssml-test", {
      body: JSON.stringify({ ssml: input, type: "GCP", language: "ENGLISH" }),
      method: "POST",
    })
      .then((res) => res.arrayBuffer())
      .then((res) => audioContext.decodeAudioData(res))
      .then((res) => {
        const source = audioContext.createBufferSource();
        source.buffer = res;
        source.connect(audioContext.destination);
        source.start();
      })
      .catch((err) => {
        console.error(err);
        toast("실패");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="grid gap-6 grid-cols-3 px-8 py-6">
      <div className="col-span-1">
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
                    className="min-h-32 font-[consolas]"
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
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};
