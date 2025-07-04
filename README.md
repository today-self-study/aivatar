# AIVATAR - AI Virtual Try-On & 스타일링 플랫폼

[![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen.svg)](https://github.com/today-self-study/aivatar/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--Vision-green.svg)](https://openai.com/)
[![Replicate](https://img.shields.io/badge/Replicate-Virtual--Try--On-purple.svg)](https://replicate.com/)
[![LightX](https://img.shields.io/badge/LightX-AI--Fashion-orange.svg)](https://lightx.editor/)

> **실제 의상을 입어보는 AI Virtual Try-On!** 🎨✨  
> GPT-4o Vision으로 의상을 정확히 분석하고, 실제 의상 이미지를 AI 모델에 직접 전달하여 사실적인 가상 착용 이미지를 생성합니다.

## 🌟 핵심 기능

### 🤖 **GPT-4o Vision 기반 의상 분석**
- **실제 AI 의상 분석**: OpenAI GPT-4o Vision 모델로 의상 이미지 정밀 분석
- **정확한 브랜드 인식**: 100+ 브랜드/쇼핑몰 데이터베이스 기반 브랜드 자동 인식
- **실제 가격 추정**: 도메인별 실제 가격 데이터로 정확한 가격 정보 제공
- **상세 의상 정보**: 이름, 카테고리, 브랜드, 가격, 색상, 스타일 설명 자동 추출

### 🖼️ **실제 의상 이미지 기반 AI 생성**
- **의상 이미지 직접 전달**: 텍스트 설명이 아닌 실제 의상 이미지를 AI에 전달
- **Base64 이미지 변환**: URL에서 이미지를 추출하여 AI 모델에 직접 입력
- **다중 AI 모델 지원**: OpenAI DALL-E 3, Replicate, LightX 등 최신 AI 모델 활용
- **이미지 전처리**: 크기 조정, 배경 제거, 품질 최적화 자동 처리

### 🎯 **고급 Virtual Try-On 시스템**
- **OpenAI DALL-E 3**: 1024x1792 고해상도 패션 포트레이트 생성
- **Replicate Virtual Try-On**: 최신 가상 착용 전문 모델 활용
- **LightX AI Fashion**: 실시간 패션 시뮬레이션 API 연동
- **개인 사진 업로드**: 본인 사진으로 더 정확한 Virtual Try-On 가능

### 🛠️ **스마트 이미지 추출**
- **다중 방법 이미지 추출**: HTML 파싱, 도메인별 패턴, URL 분석 등
- **주요 쇼핑몰 지원**: 아마존, 쿠팡, 무신사, 지마켓 등 100+ 사이트
- **Open Graph/Twitter Card**: 메타 태그 기반 고품질 이미지 우선 추출
- **이미지 크기 기반 선별**: 더 큰 이미지를 우선적으로 선택

## 🚀 라이브 데모

**🌐 [AIVATAR Virtual Try-On 체험하기](https://today-self-study.github.io/aivatar/)**

## 🔥 최신 업데이트 (v2.0.0)

### ✨ 혁신적인 기능
- 🧠 **GPT-4o Vision 분석**: 실제 AI가 의상 이미지를 보고 정확한 정보 추출
- 💰 **실제 가격 분석**: 100+ 브랜드/쇼핑몰의 실제 가격 데이터베이스 구축
- 🎯 **4단계 플로우**: API 설정 → 의상 추가 → 프로필 설정 → Virtual Try-On
- 🔧 **API 우선 설정**: 의상 분석에 AI가 필요하므로 API 설정을 첫 단계로 이동

### 🎯 향상된 사용자 경험
- ⚡ **즉시 AI 분석**: URL 입력 즉시 GPT-4o가 의상 정보 자동 추출
- 🎪 **상세한 의상 정보**: 브랜드, 실제 가격, 색상, 스타일 설명까지 제공
- 🎭 **스마트 오류 처리**: AI 분석 실패 시 자동 fallback 시스템
- 📱 **embedded 설정 모드**: 첫 단계에서 바로 API 설정 가능

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
  "OpenAI GPT-4o Vision": "의상 이미지 분석 및 정보 추출",
  "OpenAI DALL-E 3": "고품질 Virtual Try-On 이미지 생성",
  "Replicate": "전문 Virtual Try-On 모델",
  "LightX": "실시간 패션 시뮬레이션"
}
```

### 🔧 개발 도구
```json
{
  "ESLint": "코드 품질 관리",
  "PostCSS": "CSS 최적화",
  "React Hook Form": "폼 상태 관리",
  "Canvas API": "클라이언트 사이드 이미지 처리"
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

### 🔧 **1단계: AI 설정**
- **OpenAI API Key**: GPT-4o Vision 의상 분석 + DALL-E 3 이미지 생성
- **Replicate API Key**: 전문 Virtual Try-On 모델 (선택사항)
- **LightX API Key**: 빠른 패션 시뮬레이션 (선택사항)
- **무료 모드**: API 키 없이도 기본 키워드 분석 사용 가능

### 👕 **2단계: 의상 추가**
```
🔗 쇼핑몰 URL 입력
    ↓
🖼️ 실제 의상 이미지 자동 추출 (다중 방법)
    ↓  
🤖 GPT-4o Vision으로 의상 분석
    ↓
📊 브랜드, 가격, 색상, 스타일 정보 추출
    ↓
💾 상세 정보와 함께 의상 컬렉션에 추가
```

### 👤 **3단계: 프로필 설정**
- 성별 선택 (남성/여성)
- 체형 분석 (6가지 유형)
- AI 생성 최적화를 위한 개인 정보

### 🎨 **4단계: Virtual Try-On 생성**
- 추가된 의상 아이템들 확인
- AI가 실제 의상 이미지를 분석하여 착용 이미지 생성
- 개인 체형에 맞는 사실적인 Virtual Try-On 결과 제공

## 🎯 AI 분석 기능 상세

### 🧠 **GPT-4o Vision 분석**
```typescript
// AI 분석 결과 예시
{
  "name": "유니클로 화이트 오버핏 셔츠",
  "category": "tops",
  "brand": "유니클로", 
  "price": 35000,
  "colors": ["화이트", "아이보리"],
  "description": "깔끔한 오버핏 디자인의 기본 셔츠"
}
```

### 💰 **실제 가격 데이터베이스**
- **한국 쇼핑몰**: 쿠팡(32,000원), 무신사(68,000원), 지그재그(35,000원) 등
- **글로벌 브랜드**: 유니클로(35,000원), 자라(65,000원), H&M(28,000원) 등
- **럭셔리 브랜드**: 구찌(1,200,000원), 프라다(1,500,000원) 등
- **스포츠 브랜드**: 나이키(95,000원), 아디다스(85,000원) 등

### 🛍️ **지원 쇼핑몰 (100+)**
- **한국**: 쿠팡, 지마켓, 옥션, 무신사, 에이블리, 브랜디, 지그재그
- **글로벌**: 아마존, 이베이, 알리익스프레스, 타오바오
- **패션**: H&M, 유니클로, 자라, 망고, 포에버21, COS
- **럭셔리**: 구찌, 프라다, 샤넬, 루이비통, 에르메스, 디올

## 🔧 고급 설정

### 🎨 Virtual Try-On 옵션
```typescript
// AI 생성 설정
const tryOnOptions = {
  provider: "openai" | "replicate" | "lightx" | "fallback",
  quality: "high" | "medium" | "low",
  style: "realistic" | "artistic" | "professional",
  resolution: "1024x1792" | "512x512",
  personImage: "uploaded" | "default" | "avatar"
}
```

### 🧠 AI 분석 설정
```typescript
// GPT-4o Vision 분석 옵션
const analysisOptions = {
  model: "gpt-4o",
  maxTokens: 800,
  temperature: 0.1,
  detail: "high",
  fallbackMode: true
}
```

## 📊 성능 최적화

### ⚡ AI 분석 최적화
- **병렬 처리**: 이미지 추출과 AI 분석 동시 진행
- **캐싱 시스템**: 분석 결과 로컬 저장으로 재분석 방지
- **Fallback 시스템**: AI 분석 실패 시 키워드 기반 분석 자동 전환
- **배치 처리**: 여러 의상 동시 분석으로 속도 향상

### 🖼️ 이미지 처리 최적화
- **다중 추출 방법**: HTML 파싱, 도메인 패턴, URL 분석 순차 시도
- **이미지 검증**: 로드 가능성 사전 확인으로 오류 방지
- **크기 기반 선별**: 더 큰 이미지 우선 선택으로 품질 향상
- **CORS 프록시**: 크로스 도메인 이미지 접근 문제 해결

## 🔮 로드맵

### 🎯 **v2.1.0 (예정)**
- [ ] 더 많은 AI 모델 지원 (Midjourney, Stable Diffusion)
- [ ] 실시간 가격 비교 기능
- [ ] 사용자 리뷰 및 평점 시스템
- [ ] 소셜 공유 기능

### 🎯 **v2.2.0 (예정)**
- [ ] 모바일 앱 개발
- [ ] AR Virtual Try-On 기능
- [ ] 개인 스타일 추천 AI
- [ ] 쇼핑몰 API 직접 연동

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/today-self-study/aivatar](https://github.com/today-self-study/aivatar)

라이브 데모: [https://today-self-study.github.io/aivatar/](https://today-self-study.github.io/aivatar/)

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
