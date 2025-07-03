# CHANGELOG

모든 주목할 만한 변경사항은 이 파일에 문서화됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

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