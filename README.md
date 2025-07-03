# AIVATAR - AI 기반 3D 코디 추천 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-purple.svg)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.169.0-green.svg)](https://threejs.org/)

> 나만의 3D 아바타를 만들고 개인 맞춤형 코디를 추천받는 AI 기반 패션 플랫폼

## 🌟 주요 기능

### 🎯 5단계 맞춤 설정
1. **성별 선택** - 남성/여성 체형 특성 반영
2. **체형 분석** - 6가지 체형 유형 (슬렌더, 애슬레틱, 펜어형, 애플형, 모래시계형, 직사각형)
3. **신체 정보** - 키, 몸무게, 개인 정보 입력
4. **3D 아바타** - 현실적인 마네킹 형태의 개인 맞춤 아바타
5. **스타일링** - 카테고리별 의류 선택 및 실시간 3D 렌더링

### 👤 현실적인 3D 아바타
- **정교한 인체 모델링**: 사람의 실제 비율과 형태를 반영한 현실적 마네킹
- **성별별 체형 차이**: 남성/여성 고유의 신체 특징 구현
- **체형별 세부 조정**: 어깨, 허리, 엉덩이 등 부위별 정밀한 비율 적용
- **부드러운 애니메이션**: 자연스러운 회전과 움직임 효과

### 👗 스마트 의류 시스템
- **카테고리별 단일 선택**: 상의, 하의, 신발, 아우터, 액세서리 각 카테고리에서 하나씩 선택
- **실시간 3D 렌더링**: 선택한 의류가 즉시 3D 아바타에 반영
- **12가지 색상 지원**: 화이트, 블랙, 네이비, 그레이, 베이지, 브라운, 연청, 진청, 로즈골드, 골드, 실버, 올리브
- **브랜드 정보**: 나이키, 아디다스, 유니클로, 자라 등 유명 브랜드 아이템

### 🎨 사용자 경험
- **반응형 디자인**: 모든 디바이스에서 최적화된 인터페이스
- **직관적 네비게이션**: 5단계 진행 상황 표시 및 사이드바 메뉴
- **실시간 미리보기**: 선택 사항이 즉시 3D 아바타에 반영

## 🚀 기술 스택

### Frontend
- **React 18.3.1** - 모던 React 18 기능 활용
- **TypeScript 5.5.3** - 타입 안전성 보장
- **Vite 6.0.1** - 빠른 개발 환경과 최적화된 번들링
- **TailwindCSS 3.4.17** - 유틸리티 퍼스트 CSS 프레임워크

### 3D Graphics & Animation
- **Three.js 0.169.0** - 고성능 3D 그래픽 라이브러리
- **React Three Fiber 8.17.10** - React용 Three.js 선언적 인터페이스
- **React Three Drei 9.119.0** - 3D 도구 및 유틸리티

### 개발 도구
- **ESLint** - 코드 품질 및 일관성 관리
- **PostCSS** - CSS 후처리 및 최적화
- **TypeScript Strict Mode** - 엄격한 타입 검사

## 📦 설치 및 실행

```bash
# 저장소 복제
git clone https://github.com/your-username/aivatar.git
cd aivatar

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 🌐 배포

이 프로젝트는 GitHub Pages를 통해 자동 배포됩니다.

- **라이브 데모**: [https://your-username.github.io/aivatar/](https://your-username.github.io/aivatar/)
- **배포 브랜치**: `gh-pages`
- **자동 배포**: `main` 브랜치에 푸시 시 자동으로 빌드 및 배포

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
