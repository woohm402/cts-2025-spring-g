# 과제 과정 및 결과물

<br/><br/>

## 개요

과제 주제의 이름은 `TTS` 였으나,
- text to speech 를 구현하면 원본 텍스트가 원본 음성의 데이터를 온전히 저장할 수 없다는 점,
- speech to speech 가 회사에서 만들고자 하는 방향성이라는 점

을 고려하여 speech to speech 로 구현했습니다. 또한 한국어 speech는 발음 품질이 아직 뛰어나지 않기도 하고, 한국어에서 한국어로 변환하는 것은 비즈니스적으로 큰 의미가 없는 것 같아 한국어 원본 음성을 넣으면 영어로 결과가 나오도록 구현했습니다.

<br/><br/>

## 구현 방식

1. 먼저 openai 에서 제공하는 [transcriptions api](https://platform.openai.com/docs/guides/speech-to-text#transcriptions) 를 사용하여 원본 mp3 파일을 아래와 같은 형태로 토큰화합니다.

```json
[
  {
    "id": 0,
    "seek": 0,
    "start": 0,
    "end": 5.400000095367432,
    "text": " 일단 핏감 자체가 너무 세련되게 예쁘고요.",
    "tokens": [
      50364,
      17304,
      1362,
      237,
      13664,
      5650,
      39881,
      6924,
      32143,
      254,
      3891,
      10487,
      1810,
      28424,
      12364,
      13,
      50634
    ],
    "temperature": 0,
    "avg_logprob": -0.23083333671092987,
    "compression_ratio": 1.5816023349761963,
    "no_speech_prob": 0.06743454188108444
  },
  ...
```

2. 그런 다음 openai에서 제공하는 [chat completion api](https://platform.openai.com/docs/api-reference/chat/create)를 사용하고 적절한 프롬프트를 통해 transcript된 데이터를 ssml로 변환하고, 번역까지 진행합니다. 이때 감정을 담을 수 있도록 프롬프트가 되어 있고, 실제로 `<prosody>` 나 `<emphasis>` 등을 사용하여 강조할 부분이나 더 빠르게, 크게 말할 부분 데이터가 들어 있는 것을 확인할 수 있습니다.

```html
<speak>
  <p>
    <s>
      <prosody rate="120%" pitch="+15%" volume="+3dB">First off, the fit is just so sleek and <emphasis level="strong">gorgeous!</emphasis></prosody>
    </s>
    <break strength="medium"/>
    <s>
      <prosody rate="125%" pitch="+10%">This is truly a product that I believe will be a trendsetter!</prosody>
    </s>
  </p>
  <break strength="medium"/>
  <p>
    <s>
```

3. 마지막으로 aws 에서 제공하는 [polly](https://aws.amazon.com/ko/polly/) 를 통해 ssml을 audio로 변환합니다.

<br/><br/>

## 결과물

메일에 첨부드린 `product.mov` 파일이 시연 영상입니다. 실제로는 이 뒤에 음성 퀄리티에 대한 정량적인 분석 모듈까지 붙어 있습니다.
speech to speech 의 원본 음성은 실제 비즈니스 데이터라고 생각되는 바바더닷컴 채널에 올라와 있던 [유튜브 쇼츠 영상](https://www.youtube.com/watch?v=s5on8Th5yzc&list=PLDyIf-F-OOdClE5OswoJxFXlebmeZKzF-&index=5)을 찾아 사용했고, 메일에 첨부드린 `source.mp3` 파일입니다. 시연 결과물은 메일에 첨부드린 `result.mp3` 에 들어 있습니다. `value` 나 `yes` 와 같은 강조하고 싶은 단어를 천천히, 크게 발음하는 것을 확인할 수 있고, 빠르게 발음하고 넘길 부분은 빠르게 말하는 것을 확인할 수 있습니다.

전체 소스코드는 [GitHub](https://github.com/woohm402/cts-2025-spring-g) 에서 확인하실 수 있습니다.

위 53초짜리 음성을 변환하는 데에 소모된 금액은 대략 0.01달러 이하 수준으로 확인됩니다.

<br/><br/>

## 향후 과제

- 먼저, 기술의 발전에 따라 TTS 서비스들의 퀄리티도 좋아지고 있고 더 많은 SSML 태그들을 지원하고 있기 때문에, 시간이 지날수록 더 풍부한 감정을 더 정확하게 전달할 수 있게 될 것 같습니다. 또한 token을 ssml로 변환하는 데에 사용했던 LLM 모델도 속도나 성능 측면에서 꾸준히 발전하는 중이기에, 발전하는 기술에 맞춰 프롬프트를 개선하고 새로운 방식을 적용한다면 품질이 훨씬 개선될 수 있을 것 같습니다.
- 또한 현재는 원본 음성과 싱크가 아주 잘 맞지는 않는데, 영상 전체를 번역해서 송출할 때에는 문장 단위로 토큰화하여 따로 ssml화하고 합치는 방식을 차용하면 더 나은 결과물이 나올 수 있을 것 같습니다.
- 또한 최종 목적은 라이브 스트리밍인데, 현재는 openai chat api를 사용하여 ssml로 변환하는 과정이 너무 오래 걸려 스트리밍에 사용하기는 어려워 보입니다. 차츰 LLM 모델의 속도가 개선된다면 이 스텝의 시간을 획기적으로 줄여 스트리밍에도 적용할 수 있을 것으로 보입니다.
