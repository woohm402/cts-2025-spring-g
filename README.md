# 2025 봄학기 창의적통합설계2 G조 프로젝트: 감정표현이 포함된 TTS

## User Manual

### Installation

먼저 아래 도구들이 설치되어 있어야 합니다.
- [bunjs](https://bun.sh/docs/installation) 1.2.0 버전
  - 쉘에서 `curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.0"` 명령어로 설치할 수 있습니다.
  - 이슈가 있다면, 링크한 사이트에서 다운로드 방법을 확인할 수 있습니다.
- [python](https://www.python.org/downloads/) 3.10 버전
  - 링크한 사이트에서 다운로드 방법을 확인할 수 있습니다.

그런 다음 이 repository를 clone 받고 root 경로에서 아래와 같이 실행합니다.

```sh
bun i                             # TypeScript/JavaScript 관련 패키지 설치

python3 -m venv venv              # 파이썬 패키지 설치 및 실행을 위한 가상환경 생성
source venv/bin/activate          # 생성한 가상환경 사용
pip3 install -r requirements.txt  # 필요한 파이썬 패키지들 설치
```

그런 다음 필요한 환경변수를 설정해야 합니다. `./apps/server/.env.dev.local` 파일을 생성하고 아래와 같이 세 개의 환경변수를 설정해 주세요.

필요한 환경변수는 각각 AWS와 Openai에 가입하고 결제하여 획득할 수 있습니다.
- [AWS에서 AWS_ACCESS_KEY_ID 와 AWS_SECRET_ACCESS_KEY 발급받는 법](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/id_users_create.html)
- [OpenAI에서 API_KEY 발급받는 법](https://platform.openai.com/account/api-keys)

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
OPENAI_API_KEY=
```

그런 다음 아래와 같이 실행하여 frontend와 backend devserver를 엽니다.

```sh
bun dev
```

마지막으로 브라우저를 열고 (Chrome 100버전 이상을 권장합니다) `http://localhost:3000` 으로 접속하면 ui를 사용할 수 있습니다.

### Usage

[데모 영상](https://youtu.be/falOKbLqbiA)을 함께 참고해 주시면 도움이 될 수 있습니다.

#### 접속

처음 접속하면 다음과 같은 ui를 확인할 수 있습니다.

<img width="811" src="https://github.com/user-attachments/assets/992c97e3-dea6-4b40-87fb-c6b4b19e477d" />

#### 파일 업로드 및 실행

`Drop your file here` 부분에 파일을 드래그앱드롭으로 넣고, `Run` 버튼을 클릭합니다.

<img width="782" alt="Image" src="https://github.com/user-attachments/assets/534cb68b-7747-4756-be76-da8ca0ba38d7" />

#### transcription, 생성된 ssml, 제작된 오디오 파일 조회

아래와 같이 페이지 하단에 transcription, ssml, 오디오 파일을 조회할 수 있습니다.

<img width="782" alt="Image" src="https://github.com/user-attachments/assets/a0f73a8e-0b27-42c8-b8b6-f7ae11c65af5" />

#### 분석 및 분석 결과 조회

오디오 파일 하단의 `Analyze Generated Audio` 버튼을 클릭하면 잠시 후 분석 결과가 하단에 노출됩니다.

<img width="966" alt="Image" src="https://github.com/user-attachments/assets/07243239-75dc-4202-91e7-2cd6903169ab" />
