import type { ClothingCategory } from '../types';

export const clothingCategories: ClothingCategory[] = [
  {
    id: 'tops',
    name: 'tops',
    displayName: '상의',
    description: '티셔츠, 셔츠, 블라우스 등',
    icon: 'Shirt'
  },
  {
    id: 'bottoms',
    name: 'bottoms',
    displayName: '하의',
    description: '바지, 치마, 반바지 등',
    icon: 'Pants'
  },
  {
    id: 'shoes',
    name: 'shoes',
    displayName: '신발',
    description: '운동화, 구두, 샌들 등',
    icon: 'Shoe'
  },
  {
    id: 'accessories',
    name: 'accessories',
    displayName: '액세서리',
    description: '가방, 시계, 모자 등',
    icon: 'Watch'
  },
  {
    id: 'outerwear',
    name: 'outerwear',
    displayName: '아우터',
    description: '재킷, 코트, 가디건 등',
    icon: 'Coat'
  }
]; 