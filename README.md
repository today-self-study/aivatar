# AIVATAR - AI 착장 생성 & 스타일링 플랫폼

[![Version](https://img.shields.io/badge/Version-1.1.0-brightgreen.svg)](https://github.com/today-self-study/aivatar/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green.svg)](https://openai.com/)
[![DALL-E](https://img.shields.io/badge/DALL--E-3-orange.svg)](https://openai.com/dall-e-3)

> **AI가 생성하는 완벽한 착장!** 🎨✨  
> 개인 맞춤형 의상 분석부터 전문적인 패션 포토그래피 스타일의 착장 생성까지, 모든 것을 AI가 해결합니다.

## 🌟 핵심 기능

### 🤖 **AI 의상 분석 & 이미지 추출**
- **URL 한 번으로 모든 것 완료**: 쇼핑몰 URL만 입력하면 AI가 상품 정보를 완벽 분석
- **자동 이미지 추출**: 웹페이지에서 상품 이미지를 자동으로 찾아서 추출
- **스마트 카테고리 분류**: 상의, 하의, 아우터, 신발, 액세서리 자동 분류
- **브랜드 & 가격 인식**: AI가 브랜드명과 예상 가격까지 자동 분석

### 🎨 **전문적인 AI 착장 생성**
- **정자세 패션 포토그래피**: 클래식하고 전문적인 정자세 스타일
- **프로페셔널 스튜디오 품질**: 완벽한 조명과 배경으로 고품질 이미지 생성
- **실제 의상 정보 활용**: 등록된 브랜드와 상품명을 기반으로 정확한 착장 생성
- **최적화된 비율**: 전신 촬영에 최적화된 세로형 비율 (1024x1792)

### 📱 **시각적 의상 관리**
- **이미지 미리보기**: 모든 의상 아이템에 실제 상품 이미지 표시
- **직관적인 컬렉션**: 카테고리별로 체계적인 의상 관리
- **브라우저 캐시**: 개인 의상 컬렉션을 안전하게 로컬 저장

### 🎯 **개인 맞춤 설정**
- **체형 기반 분석**: 6가지 체형 유형별 맞춤 추천
- **성별별 특화**: 남성/여성 체형 특성을 반영한 정확한 분석
- **신체 정보 반영**: 키, 몸무게를 고려한 개인 맞춤 착장

## 🚀 라이브 데모

**🌐 [AIVATAR 바로 체험하기](https://today-self-study.github.io/aivatar/)**

### 📸 주요 화면

| 의상 분석 | 이미지 추출 | 착장 생성 |
|----------|------------|----------|
| ![의상 분석](docs/images/analysis.png) | ![이미지 추출](docs/images/extraction.png) | ![착장 생성](docs/images/generation.png) |

## 🔥 최신 업데이트 (v1.1.0)

### ✨ 새로운 기능
- 🖼️ **상품 이미지 자동 추출**: Open Graph, Twitter Card, 상품 셀렉터 활용
- 📱 **이미지 미리보기 UI**: 분석 결과와 의상 목록에서 실시간 이미지 표시
- 🎨 **AI 착장 생성 고도화**: 정자세 전문 패션 포토그래피 스타일
- 🔍 **향상된 웹페이지 분석**: 다양한 쇼핑몰 구조 대응

### 🎯 개선된 사용자 경험
- ⚡ **더 빠른 분석**: GPT-4o-mini 활용으로 텍스트 분석 속도 향상
- 🎪 **시각적 관리**: 의상 목록에서 이미지 썸네일로 직관적 관리
- 🎭 **현실적인 착장**: 실제 의상 정보를 활용한 정확한 AI 생성

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
  "OpenAI GPT-4o": "의상 분석",
  "OpenAI GPT-4o-mini": "빠른 텍스트 처리",
  "DALL-E 3": "착장 이미지 생성",
  "Web Scraping": "상품 이미지 추출"
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

### 🎯 **1단계: AI 설정**
- OpenAI API Key 입력
- 모든 AI 기능의 기본 설정

### 👤 **2단계: 개인 정보**
- 성별 선택 (남성/여성)
- 체형 분석 (6가지 유형)
- 신체 정보 입력 (키, 몸무게)

### 👕 **3단계: 의상 추가**
```
🔗 쇼핑몰 URL 입력
    ↓
🤖 AI 자동 분석
    ↓  
🖼️ 이미지 자동 추출
    ↓
📝 정보 자동 입력
    ↓
✅ 의상 등록 완료
```

### 🎨 **4단계: 착장 생성**
- 원하는 의상 아이템들 선택
- AI가 전문적인 패션 포토그래피 스타일로 착장 생성
- 정자세로 촬영된 고품질 이미지 제공

## 🎯 체형별 맞춤 분석

| 체형 | 특징 | AI 추천 스타일 |
|------|------|----------------|
| 🏃‍♂️ **슬렌더** | 날씬한 체형 | 볼륨감 있는 레이어드 룩 |
| 💪 **애슬레틱** | 근육질 체형 | 핏이 좋은 테일러드 룩 |
| 🍐 **펜어형** | 하체 발달 | 상체 포인트 A라인 룩 |
| 🍎 **애플형** | 상체 발달 | 허리 라인 강조 룩 |
| ⏳ **모래시계형** | 허리 잘록 | 몸매 라인 살린 핏 룩 |
| 📐 **직사각형** | 균등한 체형 | 곡선 만들기 룩 |

## 🔧 고급 설정

### 🎨 AI 착장 생성 커스터마이징
```typescript
// 착장 생성 옵션
const outfitOptions = {
  pose: "정자세 (클래식 포즈)",
  style: "전문 패션 포토그래피",
  lighting: "프로페셔널 스튜디오",
  background: "깔끔한 단색 배경",
  ratio: "1024x1792 (세로형)"
}
```

### 🖼️ 이미지 추출 설정
```typescript
// 이미지 추출 우선순위
const extractionPriority = [
  "Open Graph 이미지 (og:image)",
  "Twitter Card 이미지",
  "상품 이미지 셀렉터",
  "크기 기반 필터링"
]
```

## 📊 성능 최적화

### ⚡ 빠른 로딩
- **코드 스플리팅**: 필요한 컴포넌트만 로드
- **이미지 지연 로딩**: 스크롤 시 이미지 로드
- **캐시 활용**: 브라우저 로컬 스토리지 최적화

### 🔄 API 최적화
- **GPT-4o-mini**: 텍스트 분석용 빠른 모델
- **GPT-4o**: 복잡한 의상 분석용 정확한 모델
- **DALL-E 3**: 고품질 이미지 생성

## 🌐 배포 정보

- **라이브 서비스**: [https://today-self-study.github.io/aivatar/](https://today-self-study.github.io/aivatar/)
- **배포 플랫폼**: GitHub Pages
- **자동 배포**: `npm run deploy` 명령어
- **PWA 지원**: 모바일 앱처럼 설치 가능

## 📝 버전 관리

### 현재 버전: **v1.1.0** 🎉

```bash
# 버전 업데이트 명령어
npm run version:patch   # 1.1.0 → 1.1.1 (버그 수정)
npm run version:minor   # 1.1.0 → 1.2.0 (새 기능)
npm run version:major   # 1.1.0 → 2.0.0 (큰 변경)

# 버전 업데이트 후 자동 배포
npm run deploy:version
```

### 📚 변경 기록
자세한 변경사항은 [CHANGELOG.md](./CHANGELOG.md)에서 확인하세요.

## 🤝 기여하기

1. **Fork** 저장소
2. **Feature 브랜치** 생성 (`git checkout -b feature/amazing-feature`)
3. **변경사항 커밋** (`git commit -m 'Add amazing feature'`)
4. **브랜치에 Push** (`git push origin feature/amazing-feature`)
5. **Pull Request** 생성

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

## 🙋‍♂️ 지원

- 📧 **이메일**: [support@aivatar.com](mailto:support@aivatar.com)
- 🐛 **버그 리포트**: [GitHub Issues](https://github.com/today-self-study/aivatar/issues)
- 💡 **기능 제안**: [GitHub Discussions](https://github.com/today-self-study/aivatar/discussions)

---

<div align="center">

**✨ AIVATAR로 당신만의 완벽한 착장을 AI와 함께 만들어보세요! ✨**

[🚀 지금 시작하기](https://today-self-study.github.io/aivatar/) | [📖 문서 보기](docs/) | [🎨 예시 보기](examples/)

</div>
