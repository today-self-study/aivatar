# AIVATAR - AI 기반 맞춤 코디 추천 플랫폼

[![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen.svg)](https://github.com/today-self-study/aivatar/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-purple.svg)](https://vitejs.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-green.svg)](https://openai.com/)

> AI를 활용한 개인 맞춤형 코디 추천 서비스. 성별, 체형, 신체 정보를 기반으로 완벽한 스타일링을 제안합니다.

## 🌟 주요 기능

### 🎯 6단계 맞춤 설정
1. **AI 설정** - OpenAI API Key 설정
2. **성별 선택** - 남성/여성 체형 특성 반영
3. **체형 분석** - 6가지 체형 유형 (슬렌더, 애슬레틱, 펜어형, 애플형, 모래시계형, 직사각형)
4. **신체 정보** - 키, 몸무게 입력
5. **의상 관리** - AI 분석을 통한 의상 추가 및 컬렉션 관리
6. **AI 코디 생성** - 선택한 의상들로 AI가 완벽한 코디 생성

### 🤖 AI 기반 의상 분석
- **URL 기반 분석**: 쇼핑몰 URL을 입력하면 AI가 상품 정보 자동 추출
- **자동 카테고리 분류**: 상의, 하의, 아우터, 신발, 액세서리 자동 분류
- **브랜드 및 가격 추정**: AI가 브랜드명과 예상 가격 자동 분석
- **색상 및 태그 생성**: 상품의 색상과 스타일 태그 자동 생성

### 👗 스마트 의류 관리 시스템
- **브라우저 캐시 저장**: 로컬 스토리지를 활용한 개인 의상 컬렉션 관리
- **카테고리별 관리**: 상의, 하의, 신발, 아우터, 액세서리 체계적 분류
- **다양한 색상 지원**: 화이트, 블랙, 네이비, 그레이, 베이지, 브라운 등 12가지 색상
- **브랜드 정보**: 나이키, 아디다스, 유니클로, 자라 등 유명 브랜드 아이템 지원

### 🎨 사용자 경험
- **반응형 디자인**: 모든 디바이스에서 최적화된 인터페이스
- **직관적 네비게이션**: 6단계 진행 상황 표시 및 사이드바 메뉴
- **실시간 피드백**: AI 분석 결과와 코디 추천을 즉시 확인

## 🚀 기술 스택

### Frontend
- **React 19.1.0** - 모던 React 19 기능 활용
- **TypeScript 5.8.3** - 타입 안전성 보장
- **Vite 7.0.0** - 빠른 개발 환경과 최적화된 번들링
- **TailwindCSS 3.4.17** - 유틸리티 퍼스트 CSS 프레임워크

### AI & API 통합
- **OpenAI GPT-4** - 의상 분석 및 코디 추천 AI 모델
- **DALL-E 3** - AI 기반 착장 이미지 생성
- **React Hook Form** - 폼 상태 관리 및 유효성 검사
- **Zod** - 스키마 기반 데이터 검증

### 개발 도구
- **ESLint** - 코드 품질 및 일관성 관리
- **PostCSS** - CSS 후처리 및 최적화
- **TypeScript Strict Mode** - 엄격한 타입 검사

## 📦 설치 및 실행

```bash
# 저장소 복제
git clone https://github.com/today-self-study/aivatar.git
cd aivatar

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# GitHub Pages 배포
npm run deploy
```

## 📋 버전 관리

이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

### 현재 버전: v1.0.0

### 버전 업데이트 방법

```bash
# 패치 버전 업데이트 (버그 수정: 1.0.0 → 1.0.1)
npm run version:patch

# 마이너 버전 업데이트 (새 기능: 1.0.0 → 1.1.0)
npm run version:minor

# 메이저 버전 업데이트 (큰 변경사항: 1.0.0 → 2.0.0)
npm run version:major

# 버전 업데이트 후 배포
npm run deploy:version
```

### 버전 히스토리
버전별 상세 변경사항은 [CHANGELOG.md](./CHANGELOG.md)에서 확인할 수 있습니다.

### 배포 상태 확인
- 서비스 우측 하단에서 현재 배포된 버전과 빌드 시간을 확인할 수 있습니다
- 각 배포마다 고유한 빌드 타임스탬프가 표시됩니다

## 🌐 배포

이 프로젝트는 GitHub Pages를 통해 배포됩니다.

- **라이브 데모**: [https://today-self-study.github.io/aivatar/](https://today-self-study.github.io/aivatar/)
- **배포 브랜치**: `gh-pages`
- **배포 방식**: `npm run deploy` 명령어를 통한 수동 배포
- **빌드 도구**: Vite를 사용한 최적화된 프로덕션 빌드

## 📱 PWA 지원

AIVATAR는 Progressive Web App으로 구현되어 있습니다:

- **오프라인 지원**: 서비스 워커를 통한 캐싱
- **설치 가능**: 홈 화면에 앱 아이콘 추가
- **반응형 디자인**: 모바일 최적화
- **푸시 알림**: 개인 맞춤 알림 (향후 구현 예정)

## 🎯 사용 방법

### 1. 성별 선택
- 남성 또는 여성 선택
- 선택한 성별에 따라 체형 특성이 달라집니다

### 2. 체형 분석
- **슬렌더**: 날씬한 체형
- **애슬레틱**: 근육질 체형
- **펜어형**: 하체가 발달한 체형
- **애플형**: 상체가 발달한 체형
- **모래시계형**: 허리가 잘록한 체형
- **직사각형**: 전체적으로 균등한 체형

### 3. 신체 정보 입력
- 키 (cm)
- 몸무게 (kg)
- 개인 정보 (선택사항)

### 4. 3D 아바타 확인
- 입력한 정보를 바탕으로 생성된 개인 맞춤 3D 아바타
- 마우스로 회전하여 다양한 각도에서 확인 가능

### 5. 스타일링
- 각 카테고리에서 원하는 의류 선택
- 선택한 의류가 실시간으로 3D 아바타에 반영
- 색상별 차이 확인 가능

## 🔧 개발 가이드

### 프로젝트 구조
```
aivatar/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── Avatar3D.tsx    # 3D 아바타 렌더링
│   │   ├── GenderSelector.tsx
│   │   ├── BodyTypeSelector.tsx
│   │   ├── UserProfileForm.tsx
│   │   └── ClothingList.tsx
│   ├── data/               # 정적 데이터
│   │   ├── bodyTypes.ts
│   │   ├── categories.ts
│   │   └── clothingItems.ts
│   ├── hooks/              # 커스텀 훅
│   │   └── useLocalStorage.ts
│   ├── types/              # TypeScript 타입 정의
│   │   └── index.ts
│   ├── utils/              # 유틸리티 함수
│   │   └── index.ts
│   └── App.tsx             # 메인 애플리케이션
├── public/                 # 정적 파일
│   ├── icons/             # PWA 아이콘
│   ├── favicon.svg        # 파비콘
│   └── site.webmanifest   # PWA 매니페스트
└── dist/                  # 빌드 결과물
```

### 3D 아바타 구현 세부사항

#### 신체 부위별 모델링
- **머리**: 구체 형태, 얼굴 특징 포함
- **목**: 원통형, 성별별 길이 차이
- **몸통**: 원통형, 성별별 가슴/허리 비율
- **팔**: 상완, 팔꿈치, 전완, 손으로 세분화
- **다리**: 허벅지, 무릎, 정강이, 발목, 발로 세분화

#### 재질 및 조명
- **MeshStandardMaterial**: 현실적인 반사와 그림자
- **다중 조명**: 앰비언트, 디렉셔널, 포인트 라이트
- **그림자 매핑**: 자연스러운 그림자 효과

#### 성능 최적화
- **useMemo**: 재질 재사용으로 렌더링 성능 최적화
- **LOD(Level of Detail)**: 거리에 따른 세밀도 조정
- **인스턴싱**: 반복되는 형태의 효율적 렌더링

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#4F46E5` (인디고)
- **Secondary**: `#06B6D4` (시안)
- **Accent**: `#EC4899` (핑크)
- **Neutral**: `#6B7280` (그레이)

### 타이포그래피
- **제목**: `font-bold text-2xl`
- **부제목**: `font-semibold text-lg`
- **본문**: `font-medium text-base`
- **캡션**: `font-normal text-sm`

### 컴포넌트 스타일
- **버튼**: 둥근 모서리, 호버 효과
- **카드**: 그림자, 둥근 모서리
- **입력 필드**: 테두리, 포커스 효과

## 📊 성능 지표

### 빌드 최적화
- **코드 분할**: 동적 import를 통한 청크 분리
- **트리 쉐이킹**: 사용하지 않는 코드 제거
- **압축**: Gzip 압축으로 전송 크기 최적화

### 3D 렌더링 성능
- **60 FPS**: 부드러운 3D 애니메이션
- **반응형 캔버스**: 화면 크기에 따른 해상도 조정
- **메모리 관리**: 효율적인 geometry 및 material 관리

## 🔮 향후 계획

### 단기 목표
- [ ] 더 많은 의류 브랜드 추가
- [ ] 머리 스타일 및 헤어 색상 옵션
- [ ] 피부 톤 선택 기능
- [ ] 배경 환경 변경 옵션

### 중기 목표
- [ ] AI 기반 코디 추천 알고리즘
- [ ] 사용자 계정 및 저장 기능
- [ ] 소셜 공유 기능
- [ ] 실제 쇼핑몰 연동

### 장기 목표
- [ ] AR/VR 지원
- [ ] 실시간 피팅 시뮬레이션
- [ ] 개인 맞춤 의류 추천
- [ ] 가상 패션쇼 기능

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. 이슈를 생성하여 문제점이나 개선사항을 제안해주세요
2. Fork 후 기능 브랜치를 만들어 개발해주세요
3. 커밋 메시지는 명확하고 구체적으로 작성해주세요
4. Pull Request를 생성하여 코드 리뷰를 요청해주세요

### 개발 가이드라인
- TypeScript 엄격 모드 준수
- ESLint 규칙 준수
- 컴포넌트 단위 테스트 작성
- 반응형 디자인 고려

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 👥 팀

- **개발자**: AIVATAR Team
- **디자인**: AIVATAR Team
- **3D 모델링**: AIVATAR Team

---

💡 **AIVATAR**로 나만의 스타일을 찾아보세요! 🚀
