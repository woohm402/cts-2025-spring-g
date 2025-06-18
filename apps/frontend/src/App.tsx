import { type ChangeEvent, useEffect, useRef, useState } from 'react';

export const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [ssml, setSsml] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<unknown>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setIsProcessing(true);
    setTranscription(null);
    setSsml(null);
    setAudioUrl(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      await fetch('/api/session', {
        method: 'POST',
        body: formData,
      });

      setIsUploading(false);
      startPolling();
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const startPolling = () => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(() => {
      pollResults();
    }, 2000);
  };

  const pollResults = async () => {
    try {
      // Poll for transcription
      if (!transcription) {
        const transcriptionRes = await fetch('/api/session/transcription');
        const transcriptionData = await transcriptionRes.json();
        if (transcriptionData.transcription) {
          setTranscription(transcriptionData.transcription);
        }
      }

      // Poll for SSML
      if (!ssml) {
        const ssmlRes = await fetch('/api/session/ssml');
        const ssmlData = await ssmlRes.json();
        if (ssmlData.ssml) {
          setSsml(ssmlData.ssml);
        }
      }

      // Poll for audio
      if (!audioUrl) {
        const audioRes = await fetch('/api/session/audio');
        if (audioRes.status === 200 && audioRes.headers.get('content-length') !== '0') {
          const audioBlob = await audioRes.blob();
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setIsProcessing(false);

          // Stop polling when we have the audio
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Error polling results:', error);
    }
  };

  useEffect(() => {
    // Cleanup function to clear interval when component unmounts
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Speech-to-Speech Converter</h1>

      <div className="mb-6 p-4 border rounded">
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Upload MP3 File
            <input
              type="file"
              accept=".mp3,audio/*"
              onChange={handleFileChange}
              className="block w-full border rounded p-2"
              disabled={isUploading || isProcessing}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading || isProcessing}
          className={`px-4 py-2 rounded ${
            !file || isUploading || isProcessing
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isUploading ? 'Uploading...' : isProcessing ? 'Processing...' : 'Run'}
        </button>
      </div>

      {isProcessing && !isUploading && (
        <div className="mb-6 p-4 border rounded">
          <p className="font-medium mb-2">Processing your audio...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full animate-pulse w-full" />
          </div>
        </div>
      )}

      {transcription && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Transcription</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap overflow-auto max-h-60">
            {JSON.stringify(JSON.parse(transcription), null, 2)}
          </pre>
        </div>
      )}

      {ssml && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">SSML Markup</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap overflow-auto max-h-60">{ssml}</pre>
        </div>
      )}

      {audioUrl && (
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Generated Audio</h2>
          <audio ref={audioRef} src={audioUrl} controls={true} className="w-full" />

          <button
            type="button"
            onClick={async () => {
              const res = await fetch(audioUrl);
              const blob = await res.blob();
              const arrayBuffer = await blob.arrayBuffer();
              const base64Audio = btoa(
                new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
              );

              const analysisRes = await fetch('/api/session/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio }),
              });

              const result = await analysisRes.json();
              setAnalysis(result);
            }}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Analyze Generated Audio
          </button>
        </div>
      )}

      {analysis ? (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Analysis Result</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap overflow-auto max-h-60">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
};
