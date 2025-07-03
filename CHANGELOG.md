# CHANGELOG

모든 주목할 만한 변경사항은 이 파일에 문서화됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [1.1.0] - 2024-12-19

### Added
- 🖼️ **상품 이미지 자동 추출 기능**
  - AI 분석 시 웹페이지에서 상품 이미지 자동 추출
  - Open Graph, Twitter Card, 상품 이미지 셀렉터 활용
  - 상대 URL을 절대 URL로 자동 변환
  - 로고, 아이콘 등 불필요한 이미지 필터링
- 📱 **이미지 미리보기 UI**
  - AI 분석 결과에서 상품 이미지 미리보기 표시
  - 의상 목록에서 각 아이템의 이미지 표시 (128px 높이)
  - 이미지 로딩 실패 시 대체 UI 제공
  - 반응형 이미지 레이아웃 구현
- 🎨 **AI 착장 생성 고도화**
  - 실제 의상 정보(브랜드, 상품명)를 활용한 정확한 착장 생성
  - 정자세(클래식 포즈) 전문 패션 포토그래피 스타일
  - 전신 촬영에 최적화된 세로형 비율 (1024x1792)
  - 프로페셔널 스튜디오 조명 및 배경 설정

### Enhanced
- 🔍 **웹페이지 분석 강화**
  - 다양한 쇼핑몰 구조에 대응하는 이미지 추출 로직
  - 이미지 크기 기반 상품 이미지 우선순위 정렬
  - 향상된 메타 정보 추출 (OG 태그, 상품 정보 셀렉터)
- 🎯 **사용자 경험 개선**
  - 의상 추가 시 이미지 자동 설정으로 편의성 향상
  - 시각적 의상 관리로 직관성 대폭 개선
  - AI 착장 생성 시 더욱 정확하고 현실적인 결과

### Technical Details
- ImageAnalysisResult 타입에 imageUrl 속성 추가
- ClothingItem 생성 시 AI 추출 이미지 URL 자동 설정
- 이미지 URL 검증 및 필터링 알고리즘 구현
- DALL-E 3 프롬프트 최적화로 전문적인 패션 포토그래피 생성

## [1.0.1] - 2024-12-19

### Fixed
- 🔧 **AI 의상 분석 기능 개선**
  - JSON 코드 블록 파싱 오류 수정 (```json ``` 마크다운 블록 제거)
  - GPT 응답 데이터 매핑 로직 개선
  - 폼 필드 자동 입력 기능 안정화
- 🚀 **사용자 경험 개선**
  - 별도 탭 열기 + 스크린샷 방식 제거
  - AIVATAR 서비스 내에서 완전한 AI 분석 처리
  - 불필요한 브라우저 권한 요청 제거
- ⚡ **성능 최적화**
  - GPT-4o-mini 모델 사용으로 응답 속도 향상
  - 사용하지 않는 스크린샷 관련 코드 제거
  - 메모리 사용량 최적화

### Technical Details
- OpenAI API 응답에서 마크다운 코드 블록 자동 제거
- 웹페이지 메타 정보 추출 로직 강화 (OG 태그, 상품 정보 셀렉터)
- 색상 매핑 알고리즘 개선 (한국어 색상명 지원)
- 에러 핸들링 및 폴백 메커니즘 강화

## [1.0.0] - 2024-12-19

### Added
- 🎉 **첫 번째 정식 릴리즈**
- 🖼️ **브라우저 스크린샷 기반 AI 의상 분석 기능**
  - Screen Capture API를 사용한 사용자 브라우저 직접 스크린샷 촬영
  - 외부 스크린샷 서비스 의존성 제거로 안정성 향상
  - iframe + html2canvas 폴백 방식 추가
  - GPT-4o Vision을 통한 실제 상품 이미지 시각적 분석
- 🤖 **완전한 AI 기반 의상 분석 시스템**
  - OpenAI GPT-4o를 통한 정확한 의상 카테고리 분류
  - 실제 상품 정보 자동 추출 (이름, 브랜드, 가격, 색상 등)
  - 3단계 폴백 시스템: 브라우저 스크린샷 → iframe 캡처 → 텍스트 분석
- 👗 **AI 착장 생성 기능**
  - GPT-4o Turbo를 통한 개인 맞춤형 코디 추천
  - DALL-E 3를 통한 착장 이미지 생성
  - 체형별 맞춤 스타일링 제안
- 📱 **완전한 사용자 인터페이스**
  - 단계별 설정 가이드 (AI 설정 → 성별 → 체형 → 프로필 → 의상 관리 → 코디 생성)
  - 반응형 디자인으로 모바일/데스크톱 최적화
  - 실시간 진행상황 표시 및 사용자 피드백
- 🔧 **기술적 기능**
  - 로컬 스토리지 기반 데이터 관리
  - TypeScript 완전 지원
  - 실시간 토스트 알림 시스템
  - 에러 핸들링 및 폴백 메커니즘
- 📊 **버전 관리 시스템**
  - Semantic Versioning 적용
  - 실시간 버전 정보 표시
  - 빌드 시간 추적
  - 자동 버전 업데이트 스크립트

### Technical Details
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI Integration**: OpenAI API (GPT-4o, GPT-4o-mini, DALL-E 3)
- **Build**: Vite, GitHub Pages 자동 배포
- **State Management**: React Hooks + Local Storage
- **UI Components**: Lucide React Icons, React Hook Form

### Security & Performance
- 클라이언트 사이드 API 키 관리
- 최적화된 번들 크기 (133KB gzipped)
- 빠른 로딩 속도 및 반응성
- 오류 복구 메커니즘

---

## 버전 관리 가이드

### Semantic Versioning 규칙
- **MAJOR (X.0.0)**: 호환되지 않는 API 변경
- **MINOR (0.X.0)**: 하위 호환되는 새로운 기능 추가
- **PATCH (0.0.X)**: 하위 호환되는 버그 수정

### 배포 명령어
```bash
# 패치 버전 업데이트 (버그 수정)
npm run version:patch

# 마이너 버전 업데이트 (새 기능)
npm run version:minor

# 메이저 버전 업데이트 (큰 변경사항)
npm run version:major

# 버전 업데이트 후 배포
npm run deploy:version
``` 