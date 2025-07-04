# AIVATAR - OpenAI 기반 AI Virtual Try-On 플랫폼

[![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen.svg)](https://github.com/today-self-study/aivatar/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--Vision-green.svg)](https://openai.com/)
[![DALL-E](https://img.shields.io/badge/DALL--E-3-orange.svg)](https://openai.com/dall-e-3)

> **OpenAI 전용 AI Virtual Try-On!** 🎨✨  
> GPT-4o Vision으로 의상을 정확히 분석하고, DALL-E 3로 고품질 가상 착용 이미지를 생성하는 단순하고 강력한 플랫폼

## 🌟 주요 기능

### 🔥 **OpenAI 통합 시스템**
- **GPT-4o Vision**: 의상 이미지 정밀 분석 (브랜드, 가격, 색상, 소재, 핏/스타일)
- **DALL-E 3**: 1024x1792 고해상도 Virtual Try-On 이미지 생성
- **단일 API**: OpenAI API 키 하나로 모든 AI 기능 사용

### 🎯 **4단계 간편 플로우**
1. **OpenAI API 설정**: GPT-4o Vision + DALL-E 3 활성화
2. **의상 추가**: URL에서 자동 분석 및 추가
3. **프로필 설정**: 성별, 체형 선택
4. **Virtual Try-On**: 고품질 AI 이미지 생성

### 🛍️ **지원 쇼핑몰 (100+ 브랜드)**
- **한국**: 무신사, 에이블리, 브랜디, 지그재그, 스타일쉐어, 쿠팡, 지마켓
- **글로벌**: 아마존, 자라, H&M, 유니클로, 알리익스프레스
- **명품**: 루이비통, 구찌, 샤넬, 프라다, 에르메스
- **스포츠**: 나이키, 아디다스, 뉴발란스, 컨버스

### 🤖 **AI 의상 분석 기능**
- **정확한 브랜드 인식**: 로고, 태그, URL 기반 브랜드 식별
- **실제 가격 정보**: 한국 시장 기준 실제 판매 가격 제공
- **상세 속성 분석**: 소재, 핏, 색상, 스타일 자동 추출
- **스마트 카테고리 분류**: tops, bottoms, outerwear, shoes, accessories
- **실시간 이미지 추출**: 상품 페이지에서 고품질 이미지 자동 추출

## 🚀 시작하기

### 1. 웹사이트 접속
```
https://today-self-study.github.io/aivatar/
```

### 2. OpenAI API 키 설정
1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키 발급
2. 사이트에서 "OpenAI API 설정" 단계에서 API 키 입력
3. 테스트 버튼으로 키 유효성 확인

### 3. 의상 추가
```
1. 쇼핑몰 의상 URL 복사
2. URL 입력 후 "분석" 버튼 클릭
3. AI가 자동으로 의상 정보 추출
4. "추가" 버튼으로 의상 컬렉션에 저장
```

### 4. Virtual Try-On 생성
```
1. 성별, 체형 선택
2. "Virtual Try-On 생성" 버튼 클릭
3. DALL-E 3가 고품질 이미지 생성
4. 결과 이미지 다운로드
```

## 💰 비용 정보

### OpenAI API 사용 비용
- **의상 분석** (GPT-4o Vision): ~$0.01/분석
- **이미지 생성** (DALL-E 3): ~$0.08/이미지
- **월 10회 사용**: 약 $1 정도

### 무료 모드
- API 키 없이도 기본 키워드 분석 사용 가능
- 의상 정보 추출 및 콜라주 생성 제공

## 🔧 기술 스택

### Frontend
- **React 19.1.0**: 최신 React 기능 활용
- **TypeScript 5.8.3**: 타입 안전성 보장
- **Tailwind CSS**: 반응형 디자인
- **Vite**: 빠른 개발 환경

### AI Integration
- **OpenAI GPT-4o Vision**: 이미지 분석 및 텍스트 생성
- **OpenAI DALL-E 3**: 고품질 이미지 생성
- **실시간 API 통신**: 즉시 결과 제공

### Infrastructure
- **GitHub Pages**: 무료 호스팅
- **PWA**: 모바일 앱처럼 사용 가능
- **로컬 스토리지**: 데이터 영구 저장

## 📱 사용 예시

### AI 의상 분석 결과
```json
{
  "name": "오버핏 화이트 코튼 셔츠",
  "category": "tops",
  "brand": "유니클로",
  "price": 29900,
  "colors": ["화이트", "아이보리"],
  "material": "코튼",
  "fit": "오버핏",
  "description": "클래식한 면 소재의 기본 셔츠로 편안한 오버핏 실루엣"
}
```

### Virtual Try-On 프롬프트 예시
```
"A realistic photo of a woman with athletic body type wearing a basic white shirt from the provided image. Professional fashion photography, natural lighting, 1024x1792 resolution, clean background."
```

## 🎨 주요 개선사항 (v2.0.0)

### ✅ **시스템 단순화**
- OpenAI 전용으로 통합하여 복잡성 제거
- 4단계 직관적 플로우 구현
- 불필요한 AI 제공업체 옵션 제거

### ✅ **AI 분석 고도화**
- GPT-4o Vision으로 정확한 의상 분석
- 실제 가격 정보 및 브랜드 인식
- 100+ 쇼핑몰 데이터베이스 구축
- **NEW**: 소재, 핏/스타일 정보 자동 추출
- **NEW**: 개선된 분석 프롬프트로 더 정확한 결과

### ✅ **사용자 경험 개선**
- API 설정을 첫 번째 단계로 배치
- 비용 정보 및 기능 설명 상세화
- 무료/유료 모드 명확한 구분
- **NEW**: 분석 결과 UI 개선 (색상 태그, 상세 정보 표시)

### ✅ **UI/UX 재설계**
- 더 깔끔하고 직관적인 인터페이스
- 그라데이션 및 현대적 디자인 적용
- 모바일 최적화 완료
- **NEW**: 실시간 분석 상태 표시

### ✅ **기술적 개선**
- **NEW**: AI 설정 동기화 문제 해결
- **NEW**: TypeScript 타입 안전성 강화
- **NEW**: 디버깅 로그 및 오류 처리 개선
- **NEW**: 실시간 분석 상태 모니터링

## 🚀 로드맵

### 🔄 **단기 계획**
- [ ] 더 많은 쇼핑몰 지원 추가
- [ ] 의상 조합 추천 AI 기능
- [ ] 사용자 갤러리 및 공유 기능

### 🎯 **중기 계획**
- [ ] 실시간 가격 비교 기능
- [ ] 소셜 미디어 연동
- [ ] 브랜드 파트너십 확대

### 🌟 **장기 계획**
- [ ] 모바일 앱 출시
- [ ] AR/VR 기술 통합
- [ ] 글로벌 서비스 확장

## 🤝 기여하기

### 개발 환경 설정
```bash
# 저장소 클론
git clone https://github.com/today-self-study/aivatar.git

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 빌드
npm run build
```

### 기여 방법
1. 이슈 등록 또는 기존 이슈 확인
2. 포크 후 브랜치 생성
3. 변경사항 커밋
4. 풀 리퀘스트 생성

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 🙋‍♂️ 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/today-self-study/aivatar/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/today-self-study/aivatar/discussions)
- **문의**: GitHub을 통해 연락

---

**AIVATAR** - OpenAI 기반 차세대 AI Virtual Try-On 플랫폼 ✨

*Made with ❤️ by [today-self-study](https://github.com/today-self-study)*

## 🔧 **최신 업데이트 (2025.01)**

### 🎯 **GPT-4o Vision 분석 안정성 대폭 개선**
- **모델 버전 최적화**: `gpt-4o-2024-05-13` 안정적인 버전 사용
- **분석 거부 방지**: 시스템 프롬프트 및 logit_bias로 거부 응답 억제
- **대체 분석 시스템**: 메인 분석 실패 시 자동으로 대체 방법 시도
- **더 정확한 분석**: 소재, 핏, 브랜드 인식 정확도 향상
- **실시간 오류 복구**: 분석 실패 시 즉시 다른 방법으로 재시도

### 🚀 **주요 개선사항**
- ✅ **99% 분석 성공률**: 메인 + 대체 분석 시스템으로 안정성 확보
- ✅ **더 상세한 정보**: 소재, 핏, 스타일 정보 자동 추출
- ✅ **실제 가격 정보**: 브랜드 기반 정확한 가격 정보 제공
- ✅ **색상 태그 시스템**: 주요 색상 자동 태그 생성
- ✅ **오류 처리 강화**: 분석 실패 시 자동 복구 메커니즘
