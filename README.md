# AIVATAR - OpenAI 기반 AI Virtual Try-On 플랫폼

[![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen.svg)](https://github.com/today-self-study/aivatar/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--Vision-green.svg)](https://openai.com/)
[![DALL-E](https://img.shields.io/badge/DALL--E-3-orange.svg)](https://openai.com/dall-e-3)

> **OpenAI 전용 AI Virtual Try-On!** 🎨✨  
> GPT-4o Vision으로 의상을 정확히 분석하고, DALL-E 3로 고품질 가상 착용 이미지를 생성하는 단순하고 강력한 플랫폼

## 🎯 주요 기능

### 🤖 AI 기반 의상 분석
- **현재 화면에서 즉시 처리**: 별도 탭이나 화면 공유 없이 현재 화면에서 바로 분석
- **iframe + html2canvas 기술**: 다양한 프록시 서버를 통한 안정적인 페이지 캡처
- **GPT-4o Vision 분석**: 실제 상품 이미지를 시각적으로 분석하여 정확한 정보 추출
- **자동 등록 시스템**: 분석 완료 후 자동으로 의상 목록에 추가 (토글 가능)
- **다층 폴백 시스템**: iframe 방식 실패 시 Screen Capture API로 자동 전환

### 🛍️ 스마트 쇼핑 통합
- **100+ 브랜드 지원**: 무신사, 쿠팡, 아마존 등 주요 쇼핑몰 자동 인식
- **실시간 가격 정보**: 실제 상품 가격 자동 추출 및 표시
- **브랜드 자동 인식**: 페이지 메타데이터 분석을 통한 정확한 브랜드 추출
- **상품 이미지 추출**: 고해상도 상품 이미지 자동 추출 및 미리보기

### 🎨 AI 착장 생성
- **마네킹 기반 생성**: 심플하고 중성적인 마네킹으로 의상에 집중
- **실제 의상 정보 활용**: 브랜드, 색상, 스타일 완전 일치하는 착장 생성
- **개인 맞춤 추천**: 성별, 체형별 맞춤형 코디 제안
- **고해상도 이미지**: 전문적인 제품 카탈로그 품질의 이미지 생성

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

### 🎯 **의상 분석 자동 등록 시스템 구축**
- **원클릭 자동 등록**: 분석 완료 시 자동으로 의상 목록에 추가 (사용자 선택 가능)
- **실시간 분석 상태**: 분석 과정 시각적 피드백 및 진행 상황 표시
- **스마트 UI**: 자동 등록 on/off 토글, 분석 품질 리포트 제공

### 🏷️ **브랜드 정보 추출 정확도 혁신**
- **다층 브랜드 분석**: 메타 태그, JSON-LD, 페이지 제목, 텍스트 분석
- **100+ 브랜드 데이터베이스**: 한국/글로벌 주요 브랜드 자동 인식
- **도메인 기반 검증**: URL과 브랜드 정보 교차 검증으로 정확도 향상
- **AI 인식 상태 표시**: 브랜드 인식 품질 실시간 표시

### 🚀 **사용자 경험 대폭 개선**
- **분석 품질 리포트**: 이미지, 브랜드, 가격 인식 상태 시각화
- **색상 코딩 시스템**: 분석 결과 품질을 색상으로 구분 표시
- **아이콘 기반 UI**: 직관적인 아이콘으로 정보 구조화
- **비동기 처리**: 더 빠른 분석 및 응답 속도 개선
