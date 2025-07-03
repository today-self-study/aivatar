import type { BodyType } from '../types';

export const bodyTypes: BodyType[] = [
  {
    id: 'slender',
    name: '슬렌더',
    description: '마른 체형으로 어깨와 허리, 엉덩이가 비슷한 사이즈',
    avatarImage: '/images/body-types/slender.svg',
    measurements: {
      chest: 85,
      waist: 68,
      hip: 89,
      shoulderWidth: 38,
      armLength: 58,
      legLength: 90
    }
  },
  {
    id: 'athletic',
    name: '애슬레틱',
    description: '운동으로 다져진 탄탄한 체형',
    avatarImage: '/images/body-types/athletic.svg',
    measurements: {
      chest: 96,
      waist: 78,
      hip: 95,
      shoulderWidth: 42,
      armLength: 60,
      legLength: 88
    }
  },
  {
    id: 'pear',
    name: '하체 볼륨',
    description: '상체보다 하체가 더 풍성한 체형',
    avatarImage: '/images/body-types/pear.svg',
    measurements: {
      chest: 88,
      waist: 72,
      hip: 102,
      shoulderWidth: 36,
      armLength: 57,
      legLength: 85
    }
  },
  {
    id: 'apple',
    name: '상체 볼륨',
    description: '하체보다 상체가 더 풍성한 체형',
    avatarImage: '/images/body-types/apple.svg',
    measurements: {
      chest: 102,
      waist: 88,
      hip: 94,
      shoulderWidth: 44,
      armLength: 59,
      legLength: 87
    }
  },
  {
    id: 'hourglass',
    name: '모래시계',
    description: '가슴과 엉덩이가 비슷하고 허리가 잘록한 체형',
    avatarImage: '/images/body-types/hourglass.svg',
    measurements: {
      chest: 92,
      waist: 70,
      hip: 94,
      shoulderWidth: 40,
      armLength: 58,
      legLength: 89
    }
  },
  {
    id: 'rectangle',
    name: '직사각형',
    description: '어깨, 허리, 엉덩이가 비슷한 사이즈의 일직선 체형',
    avatarImage: '/images/body-types/rectangle.svg',
    measurements: {
      chest: 90,
      waist: 85,
      hip: 92,
      shoulderWidth: 39,
      armLength: 58,
      legLength: 88
    }
  }
]; 