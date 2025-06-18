import librosa
import numpy as np
import json
import sys
import whisper
import tempfile

def extract_features(path):
    y, sr = librosa.load(path)

    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    max_magnitudes = np.max(magnitudes, axis=0)
    threshold = np.percentile(max_magnitudes, 75)

    pitch_values = []
    for t in range(pitches.shape[1]):
        if max_magnitudes[t] > threshold:
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)

    pitch_values = np.array(pitch_values)
    pitch_avg = float(np.mean(pitch_values)) if len(pitch_values) > 0 else 0.0
    pitch_std = float(np.std(pitch_values)) if len(pitch_values) > 0 else 0.0

    duration = librosa.get_duration(y=y, sr=sr)
    try:
        model = whisper.load_model("base")
        result = model.transcribe(path, language="en")
        words = result["text"].split()
        rate = float(len(words) / duration) if duration > 0 else 0.0
    except Exception as e:
        print(f"⚠️ Whisper failed to transcribe {path}: {e}", file=sys.stderr)
        rate = 0.0

    energy = float(np.mean(librosa.feature.rms(y=y)))

    return {
        "pitch_avg": round(pitch_avg, 2),
        "pitch_std": round(pitch_std, 2),
        "speech_rate": round(rate, 2),
        "energy": round(energy, 4),
        "emotion": classify(pitch_avg, pitch_std, rate, energy),
    }

def classify(pitch, pitch_std, rate, energy):
    if pitch > 340 and pitch_std > 110 and rate > 2.5:
        return "Surprised"
    elif pitch < 320 and pitch_std < 105 and rate < 1.9 and energy < 0.085:
        return "Calm"
    else:
        return "Neutral"

if __name__ == "__main__":
    try:
        audio_bytes = sys.stdin.buffer.read()
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio.flush()
            result = extract_features(temp_audio.name)
            print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
