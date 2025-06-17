import sys
import json
import librosa
import numpy as np

def extract_features(path):
    y, sr = librosa.load(path)

    # 기본 피치 (F0 추정)
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch_values = pitches[magnitudes > np.median(magnitudes)]
    pitch_avg = float(np.mean(pitch_values)) if len(pitch_values) > 0 else 0.0
    pitch_std = float(np.std(pitch_values)) if len(pitch_values) > 0 else 0.0

    # 스피치 속도 추정 (프레임 단위 에너지 활용)
    duration = librosa.get_duration(y=y, sr=sr)
    words_estimate = len(librosa.effects.split(y))  # 단순한 발화 구간 개수로 근사
    rate = float(words_estimate / duration) if duration > 0 else 0.0

    # 전체 에너지
    energy = float(np.mean(librosa.feature.rms(y=y)))

    # 결과 구성
    return {
        "pitch_avg": round(pitch_avg, 2),
        "pitch_std": round(pitch_std, 2),
        "speech_rate": round(rate, 2),
        "energy": round(energy, 4),
        "emotion": classify(pitch_avg, pitch_std, rate, energy),
    }

def classify(pitch, pitch_std, rate, energy):
    if pitch > 220 and rate > 5.0:
        return "Excited"
    elif rate < 3.5 and pitch < 200:
        return "Calm"
    elif pitch_std > 30:
        return "Surprised"
    elif pitch < 190 and energy < 0.02:
        return "Neutral"
    else:
        return "Friendly"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    path = sys.argv[1]
    result = extract_features(path)
    print(json.dumps(result))
