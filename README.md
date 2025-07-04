# AIVATAR - AI Virtual Try-On & 스타일링 플랫폼

[![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen.svg)](https://github.com/today-self-study/aivatar/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-DALL--E--3-green.svg)](https://openai.com/)
[![Replicate](https://img.shields.io/badge/Replicate-Virtual--Try--On-purple.svg)](https://replicate.com/)
[![LightX](https://img.shields.io/badge/LightX-AI--Fashion-orange.svg)](https://lightx.editor/)

> **실제 의상을 입어보는 AI Virtual Try-On!** 🎨✨  
> 의상 이미지를 AI 모델에 직접 전달하여 사실적인 가상 착용 이미지를 생성합니다.

## 🌟 핵심 기능

### 🖼️ **실제 의상 이미지 기반 AI 생성**
- **의상 이미지 직접 전달**: 텍스트 설명이 아닌 실제 의상 이미지를 AI에 전달
- **Base64 이미지 변환**: URL에서 이미지를 추출하여 AI 모델에 직접 입력
- **다중 AI 모델 지원**: OpenAI DALL-E 3, Replicate, LightX 등 최신 AI 모델 활용
- **이미지 전처리**: 크기 조정, 배경 제거, 품질 최적화 자동 처리

### 🎯 **고급 Virtual Try-On 시스템**
- **OpenAI DALL-E 3 이미지 편집**: 마스크 기반 정밀 의상 합성
- **Replicate Virtual Try-On**: 최신 가상 착용 전문 모델 활용
- **LightX AI Fashion**: 실시간 패션 시뮬레이션 API 연동
- **개인 사진 업로드**: 본인 사진으로 더 정확한 Virtual Try-On 가능

### 🤖 **스마트 이미지 분석**
- **자동 이미지 추출**: 쇼핑몰 URL에서 상품 이미지 자동 추출
- **이미지 유효성 검사**: 로드 가능한 이미지만 선별하여 사용
- **다중 이미지 처리**: 여러 의상을 동시에 조합하여 코디 생성
- **실시간 미리보기**: 분석된 의상 이미지 즉시 확인 가능

### 🎨 **전문적인 AI 착장 생성**
- **사실적인 착용 이미지**: 실제 의상 디테일을 그대로 반영
- **체형별 맞춤 생성**: 개인 체형에 맞는 착용 모습 시뮬레이션
- **프로페셔널 품질**: 스튜디오 촬영 수준의 고품질 이미지
- **무료 모드 지원**: API 키 없이도 기본 기능 사용 가능

## 🚀 라이브 데모

**🌐 [AIVATAR Virtual Try-On 체험하기](https://today-self-study.github.io/aivatar/)**

### 📸 주요 화면

| 의상 이미지 분석 | Virtual Try-On 생성 | 결과 이미지 |
|----------------|-------------------|------------|
| ![의상 분석](docs/images/analysis.png) | ![Virtual Try-On](docs/images/tryon.png) | ![결과](docs/images/result.png) |

## 🔥 최신 업데이트 (v2.0.0)

### ✨ 혁신적인 기능
- 🖼️ **실제 의상 이미지 직접 전달**: 텍스트 설명 대신 실제 의상 이미지를 AI에 입력
- 🎨 **다중 AI 모델 지원**: OpenAI, Replicate, LightX 등 최신 Virtual Try-On 모델
- 📸 **개인 사진 업로드**: 본인 사진으로 더 정확한 가상 착용 체험
- 🔄 **실시간 이미지 처리**: Base64 변환, 크기 조정, 품질 최적화 자동 처리

### 🎯 향상된 사용자 경험
- ⚡ **즉시 이미지 검증**: 업로드한 URL의 이미지 유효성 실시간 확인
- 🎪 **상세한 진행 상황**: AI 생성 과정을 단계별로 표시
- 🎭 **사용자 친화적 오류 처리**: 명확한 오류 메시지와 해결 방법 제시
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 최적화

## 🛠️ 기술 스택

### 🎨 Frontend
```json
{
  "React": "19.1.0",
  "TypeScript": "5.8.3", 
  "Vite": "7.0.0",
  "TailwindCSS": "3.4.17"
}
```

### 🤖 AI & API
```json
{
  "OpenAI DALL-E 3": "이미지 편집 기반 Virtual Try-On",
  "Replicate": "전문 Virtual Try-On 모델",
  "LightX": "실시간 패션 시뮬레이션",
  "Canvas API": "클라이언트 사이드 이미지 처리"
}
```

### 🔧 개발 도구
```json
{
  "ESLint": "코드 품질 관리",
  "PostCSS": "CSS 최적화",
  "React Hook Form": "폼 상태 관리",
  "Zod": "데이터 검증"
}
```

## 📦 빠른 시작

### 1️⃣ 설치
```bash
# 저장소 복제
git clone https://github.com/today-self-study/aivatar.git
cd aivatar

# 의존성 설치
npm install
```

### 2️⃣ 개발 서버 실행
```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

### 3️⃣ 프로덕션 빌드
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 4️⃣ 배포
```bash
# GitHub Pages 배포
npm run deploy
```

## 📋 사용 가이드

### 🎯 **1단계: AI 설정 (선택사항)**
- OpenAI API Key 입력 (더 사실적인 결과)
- Replicate API Key 입력 (전문 Virtual Try-On)
- LightX API Key 입력 (빠른 처리)
- 무료 모드도 사용 가능

### 👤 **2단계: 개인 정보**
- 성별 선택 (남성/여성)
- 체형 분석 (6가지 유형)
- 개인 사진 업로드 (선택사항)

### 👕 **3단계: 의상 추가**
```
🔗 쇼핑몰 URL 또는 이미지 URL 입력
    ↓
🖼️ 실제 의상 이미지 자동 추출
    ↓  
✅ 이미지 유효성 검사
    ↓
📝 의상 정보 자동 분석
    ↓
💾 의상 컬렉션에 추가
```

### 🎨 **4단계: Virtual Try-On 생성**
- 원하는 의상 아이템들 선택
- AI가 실제 의상 이미지를 분석
- 개인 체형에 맞는 가상 착용 이미지 생성
- 사실적인 Virtual Try-On 결과 제공

## 🎯 AI 모델별 특징

| AI 모델 | 특징 | 장점 | 사용 사례 |
|---------|------|------|----------|
| 🎨 **OpenAI DALL-E 3** | 이미지 편집 기반 | 높은 품질, 정밀한 합성 | 전문적인 패션 포토그래피 |
| 🔄 **Replicate** | Virtual Try-On 전문 | 사실적인 착용감 | 실제 착용 시뮬레이션 |
| ⚡ **LightX** | 빠른 처리 속도 | 실시간 생성 | 빠른 미리보기 |
| 🆓 **무료 모드** | API 키 불필요 | 접근성 좋음 | 기본 기능 체험 |

## 🔧 고급 설정

### 🎨 Virtual Try-On 옵션
```typescript
// AI 생성 설정
const tryOnOptions = {
  provider: "openai" | "replicate" | "lightx" | "fallback",
  quality: "high" | "medium" | "low",
  style: "realistic" | "artistic" | "professional",
  personImage: "uploaded" | "default" | "avatar"
}
```

### 🖼️ 이미지 처리 설정
```typescript
// 이미지 전처리 옵션
const imageProcessing = {
  maxWidth: 512,
  maxHeight: 512,
  format: "jpeg" | "png",
  quality: 0.8,
  removeBackground: true,
  resize: true
}
```

## 📊 성능 최적화

### ⚡ 이미지 처리 최적화
- **병렬 처리**: 여러 의상 이미지 동시 처리
- **캐시 활용**: 처리된 이미지 로컬 캐시 저장
- **지연 로딩**: 필요한 시점에만 이미지 로드
- **압축 최적화**: 품질 유지하면서 용량 최소화

### 🔄 API 최적화
- **요청 큐잉**: API 호출 순서 최적화
- **에러 핸들링**: 실패 시 자동 재시도
- **타임아웃 관리**: 적절한 대기 시간 설정
- **폴백 시스템**: API 실패 시 대체 방안 제공

## 🎯 체형별 맞춤 분석

| 체형 | 특징 | AI 추천 스타일 |
|------|------|----------------|
| 🏃‍♂️ **슬렌더** | 날씬한 체형 | 볼륨감 있는 레이어드 룩 |
| 💪 **애슬레틱** | 근육질 체형 | 핏이 좋은 테일러드 룩 |
| 🍐 **펜어형** | 하체 발달 | 상체 포인트 A라인 룩 |
| 🍎 **애플형** | 상체 발달 | 허리 라인 강조 룩 |
| ⏳ **모래시계형** | 허리 잘록 | 몸매 라인 살린 핏 룩 |
| 📐 **직사각형** | 균등한 체형 | 곡선 만들기 룩 |

## 🔐 개인정보 보호

### 🛡️ 보안 기능
- **로컬 저장**: 모든 개인 정보는 브라우저에만 저장
- **API 키 암호화**: 설정된 API 키는 안전하게 보관
- **이미지 처리**: 업로드된 이미지는 메모리에서만 처리
- **자동 삭제**: 세션 종료 시 임시 데이터 자동 삭제

## 🤝 기여하기

### 📝 개발 가이드
```bash
# 개발 환경 설정
npm run dev

# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 테스트 실행
npm test
```

### 🐛 버그 리포트
이슈 발생 시 [GitHub Issues](https://github.com/today-self-study/aivatar/issues)에 다음 정보와 함께 제보해주세요:
- 사용 중인 AI 모델
- 입력한 의상 URL
- 오류 메시지
- 브라우저 정보

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- **OpenAI**: DALL-E 3 이미지 편집 API 제공
- **Replicate**: Virtual Try-On 모델 플랫폼 제공
- **LightX**: 실시간 패션 AI API 제공
- **React 팀**: 강력한 UI 라이브러리 제공
- **TypeScript 팀**: 타입 안전성 보장

---

**AIVATAR**로 당신만의 완벽한 Virtual Try-On을 경험해보세요! 🎨✨

[![GitHub stars](https://img.shields.io/github/stars/today-self-study/aivatar?style=social)](https://github.com/today-self-study/aivatar/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/today-self-study/aivatar?style=social)](https://github.com/today-self-study/aivatar/network/members)
