# 2025 봄학기 창의적통합설계2 G조

## Usage

먼저 [bunjs](https://bun.sh/) 1.2 이상과 [python](https://www.python.org/downloads/) 3.10 이상 버전 설치가 필요합니다.

설치된 상태에서, 이 repository를 clone 받고 root 경로에서 아래와 같이 실행합니다.

```sh
bun i

python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

그런 다음 필요한 환경변수를 설정합니다. `apps/server/.env.dev.local` 에 아래와 같이 세 개의 환경변수를 설정해 주세요. 필요한 환경변수는 각각 AWS와 Openai에 가입하고 결제하여 획득할 수 있습니다.

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
OPENAI_API_KEY=
```

그런 다음 아래와 같이 실행하여 frontend와 backend devserver를 엽니다.

```sh
bun dev
```

마지막으로 `http://localhost:3000` 으로 접속하면 ui를 사용할 수 있습니다.
