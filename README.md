# Aivatar - 3D 마네킹 기반 코디 추천 PWA

## 🎯 프로젝트 개요

Aivatar는 3D 마네킹 기반의 개인 맞춤형 코디 추천 PWA(Progressive Web App)입니다. 사용자의 성별, 체형, 신체 정보를 기반으로 현실적인 3D 아바타를 생성하고, 다양한 의류를 실제로 착용해볼 수 있는 가상 피팅 서비스를 제공합니다.

## 🌐 Live Demo

**배포 완료!** 아래 링크에서 실제 서비스를 체험해보세요:

**🔗 [https://today-self-study.github.io/aivatar/](https://today-self-study.github.io/aivatar/)**

## ✨ 주요 기능

### 1. 5단계 사용자 맞춤 설정
- **성별 선택**: 남성/여성 선택으로 체형 분석 정확도 향상
- **체형 선택**: 6가지 체형 중 사용자와 가장 유사한 체형 선택
- **신체 정보 입력**: 키, 몸무게 입력으로 개인 맞춤 아바타 생성
- **3D 아바타 보기**: 실시간 3D 아바타 미리보기
- **의류 선택**: 카테고리별 의류 선택 및 가상 피팅

### 2. 현실적인 3D 아바타
- **성별별 체형 차이**: 남성/여성 신체 비율 반영
- **체형별 세부 조정**: 6가지 체형(slender, athletic, pear, apple, hourglass, rectangle) 지원
- **신체 부위별 세분화**: 머리, 목, 몸통, 허리, 엉덩이, 다리, 팔, 발 등 상세 렌더링

### 3. 카테고리별 의류 선택
- **카테고리 제한**: 각 카테고리(상의, 하의, 신발, 액세서리, 아우터)에서 하나씩만 선택 가능
- **실시간 3D 렌더링**: 선택한 의류가 즉시 아바타에 반영
- **실제 색상 반영**: 의류의 실제 색상(화이트, 블랙, 네이비 등) 매핑

### 4. 의류 데이터베이스
- **브랜드별 의류**: Uniqlo, Zara, Levi's, COS 등 유명 브랜드 의류
- **상세 정보**: 가격, 사이즈, 색상, 브랜드, 구매 링크 제공
- **추천 시스템**: 인기 아이템 추천 배지 표시

### 5. 사용자 인터페이스
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **사이드바 네비게이션**: 단계별 진행 상황 표시
- **프로그레스 바**: 설정 완료 정도 시각화
- **실시간 미리보기**: 우측 패널에서 아바타 실시간 확인

## 🛠️ 기술 스택

### Frontend
- **React 18**: 최신 React 버전 사용
- **TypeScript**: 타입 안전성 보장
- **Vite**: 빠른 빌드 및 개발 서버
- **TailwindCSS**: 유틸리티 기반 스타일링

### 3D 렌더링
- **Three.js**: 3D 그래픽 엔진
- **React Three Fiber**: React용 Three.js 래퍼
- **@react-three/drei**: Three.js 헬퍼 라이브러리

### PWA 기능
- **Vite PWA Plugin**: PWA 자동 설정
- **Service Worker**: 오프라인 지원
- **Web App Manifest**: 앱 설치 지원

### 상태 관리
- **React Hooks**: useState, useEffect 활용
- **Local Storage**: 사용자 설정 영구 저장
- **Custom Hooks**: 로컬 스토리지 훅 구현

## 📦 설치 및 실행

```bash
# 프로젝트 클론
git clone https://github.com/today-self-study/aivatar.git
cd aivatar

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: #3B82F6 (파란색)
- **Secondary**: #6B7280 (회색)
- **Accent**: #F59E0B (노란색)
- **Success**: #10B981 (초록색)
- **Error**: #EF4444 (빨간색)

### 컴포넌트 구조
```
src/
├── components/
│   ├── Avatar3D.tsx          # 3D 아바타 렌더링
│   ├── BodyTypeSelector.tsx  # 체형 선택 컴포넌트
│   ├── ClothingList.tsx      # 의류 목록 컴포넌트
│   ├── GenderSelector.tsx    # 성별 선택 컴포넌트
│   └── UserProfileForm.tsx   # 사용자 프로필 폼
├── data/
│   ├── bodyTypes.ts          # 체형 데이터
│   ├── categories.ts         # 카테고리 데이터
│   └── clothingItems.ts      # 의류 아이템 데이터
├── hooks/
│   └── useLocalStorage.ts    # 로컬 스토리지 훅
├── types/
│   └── index.ts              # 타입 정의
└── utils/
    └── index.ts              # 유틸리티 함수
```

## 🔧 주요 기능 구현

### 1. 3D 아바타 시스템
- **React Three Fiber**: 선언적 3D 렌더링
- **성별별 체형 비율**: 남성/여성 신체 비율 차이 반영
- **체형별 조정**: 6가지 체형에 따른 세부 조정
- **실시간 렌더링**: 60fps 부드러운 3D 렌더링

### 2. 의류 시스템
- **카테고리별 선택**: 중복 선택 방지 로직
- **실시간 적용**: 의류 선택 시 즉시 아바타 반영
- **색상 매핑**: 의류 색상을 3D 재질에 적용

### 3. 데이터 관리
- **타입 안전성**: TypeScript 인터페이스 활용
- **로컬 스토리지**: 사용자 설정 영구 저장
- **상태 관리**: React Hooks 기반 상태 관리

## 🚀 배포

이 프로젝트는 GitHub Pages를 통해 배포됩니다:

**Live Demo**: https://today-self-study.github.io/aivatar/

### 배포 과정
1. `npm run build`로 빌드
2. `dist/` 폴더를 GitHub Pages에 자동 배포
3. GitHub Actions를 통한 자동 CI/CD

## 🔮 향후 계획

### 단기 목표
- [ ] 더 다양한 의류 아이템 추가
- [ ] 3D 모델 최적화로 성능 향상
- [ ] 의류 텍스처 및 패턴 추가
- [ ] 사용자 리뷰 및 평점 시스템

### 중기 목표
- [ ] AI 기반 코디 추천 시스템
- [ ] 소셜 공유 기능
- [ ] 사용자 생성 콘텐츠 지원
- [ ] 실제 쇼핑몰 연동

### 장기 목표
- [ ] VR/AR 지원
- [ ] 머신러닝 기반 체형 분석
- [ ] 실시간 협업 피팅
- [ ] 글로벌 브랜드 파트너십

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 기여하기

기여를 환영합니다! 이슈를 열거나 풀 리퀘스트를 보내주세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 GitHub Issues를 이용해주세요.

## 🛣️ 로드맵

### v1.0 (현재) ✅
- [x] 기본 3D 아바타 생성
- [x] 체형 선택 기능
- [x] 의류 아이템 목록
- [x] PWA 지원
- [x] GitHub Pages 배포

### v1.1 (계획)
- [ ] 실제 의류 텍스처 매핑
- [ ] 소셜 미디어 공유 기능
- [ ] 코디 저장 및 관리
- [ ] AI 기반 코디 추천

### v1.2 (계획)
- [ ] 사용자 리뷰 및 평점 시스템
- [ ] 브랜드 파트너십 확대
- [ ] 가상 피팅 정확도 향상
- [ ] 모바일 앱 출시

## 🙏 감사의 말

- Three.js 커뮤니티
- React Three Fiber 개발팀
- TailwindCSS 팀
- 모든 오픈소스 기여자들

---

Made with ❤️ by today-self-study
