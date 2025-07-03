# Aivatar - 3D Fashion Coordinator

3D 마네킹 기반 코디 추천 PWA 어플리케이션

## 🎯 프로젝트 개요

Aivatar는 사용자의 체형과 신체 정보를 기반으로 3D 아바타를 생성하고, 실제 의류 상품을 가상으로 착용해볼 수 있는 혁신적인 패션 코디네이션 서비스입니다.

### 주요 기능

- **체형 기반 3D 아바타 생성**: 6가지 체형(슬렌더, 애슬레틱, 하체볼륨, 상체볼륨, 모래시계, 직사각형) 중 선택
- **실시간 3D 렌더링**: Three.js 기반 인터랙티브 3D 아바타
- **실제 상품 연동**: 유니클로, 자라, 아디다스 등 실제 브랜드 상품 링크 제공
- **PWA 지원**: 모바일 홈화면 추가 및 오프라인 사용 가능
- **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험

## 🛠️ 기술 스택

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **3D Graphics**: Three.js + React Three Fiber
- **PWA**: Vite PWA Plugin
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## 📱 사용 방법

### 1. 체형 선택
- 6가지 체형 중 본인과 가장 유사한 체형을 선택합니다
- 각 체형별 상세 설명과 측정 정보를 확인할 수 있습니다

### 2. 신체 정보 입력
- 키(120-220cm)와 몸무게(30-200kg)를 입력합니다
- 실시간으로 BMI 계산 결과를 확인할 수 있습니다

### 3. 3D 아바타 생성
- 입력한 정보를 바탕으로 3D 아바타가 자동 생성됩니다
- 마우스로 회전, 확대/축소, 이동이 가능합니다

### 4. 의류 아이템 선택
- 카테고리별(상의, 하의, 신발, 액세서리, 아우터) 상품 탐색
- 실제 브랜드 상품 정보 및 구매 링크 제공
- 선택한 아이템을 3D 아바타에 실시간 적용

## 🚀 설치 및 실행

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-username/aivatar.git
cd aivatar

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 로컬 프리뷰
npm run preview

# GitHub Pages 배포
npm run deploy
```

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Avatar3D.tsx        # 3D 아바타 컴포넌트
│   ├── BodyTypeSelector.tsx # 체형 선택 컴포넌트
│   ├── UserProfileForm.tsx  # 사용자 프로필 입력 폼
│   └── ClothingList.tsx     # 의류 아이템 목록
├── data/               # 목업 데이터
│   ├── bodyTypes.ts        # 체형 데이터
│   ├── categories.ts       # 카테고리 데이터
│   └── clothingItems.ts    # 의류 아이템 데이터
├── hooks/              # 커스텀 훅
│   └── useLocalStorage.ts  # 로컬 스토리지 훅
├── types/              # TypeScript 타입 정의
│   └── index.ts
├── utils/              # 유틸리티 함수
│   └── index.ts
├── App.tsx             # 메인 앱 컴포넌트
├── main.tsx            # 앱 진입점
└── index.css           # 전역 스타일
```

## 🎨 UI/UX 특징

- **직관적인 단계별 진행**: 체형 선택 → 정보 입력 → 아바타 생성 → 의류 선택
- **실시간 피드백**: 입력 값 변경 시 즉시 반영되는 3D 아바타
- **모바일 최적화**: 터치 제스처 지원 및 반응형 디자인
- **접근성 고려**: 키보드 네비게이션 및 스크린 리더 지원

## 🔧 주요 설정

### PWA 설정
```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Aivatar - 3D Fashion Coordinator',
    short_name: 'Aivatar',
    theme_color: '#3b82f6',
    background_color: '#ffffff',
    display: 'standalone'
  }
})
```

### GitHub Pages 배포 설정
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

## 🛣️ 로드맵

### v1.0 (현재)
- [x] 기본 3D 아바타 생성
- [x] 체형 선택 기능
- [x] 의류 아이템 목록
- [x] PWA 지원

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

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 다음 방법으로 연락주세요:

- GitHub Issues: [https://github.com/your-username/aivatar/issues](https://github.com/your-username/aivatar/issues)
- Email: your-email@example.com

## �� 감사의 말

- Three.js 커뮤니티
- React Three Fiber 개발팀
- TailwindCSS 팀
- 모든 오픈소스 기여자들

---

Made with ❤️ by [Your Name]
