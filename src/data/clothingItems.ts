import type { ClothingItem } from '../types';

export const clothingItems: ClothingItem[] = [
  // 상의
  {
    id: 'basic-white-tee',
    name: '베이직 화이트 티셔츠',
    brand: 'Uniqlo',
    category: 'tops',
    price: 12900,
    imageUrl: '/images/clothing/basic-white-tee.jpg',
    originalUrl: 'https://www.uniqlo.com/kr/ko/products/E422990-000',
    description: '부드러운 코튼 소재의 베이직 화이트 티셔츠',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['화이트', '블랙', '네이비'],
    tags: ['베이직', '데일리', '코튼'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'denim-jacket',
    name: '클래식 데님 재킷',
    brand: 'Levi\'s',
    category: 'outerwear',
    price: 89000,
    imageUrl: '/images/clothing/denim-jacket.jpg',
    originalUrl: 'https://www.levi.com/KR/ko_KR/clothing/men/outerwear/trucker-jacket/p/723340140',
    description: '타임리스한 클래식 데님 재킷',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['연청', '진청', '블랙'],
    tags: ['데님', '빈티지', '클래식'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'stripe-shirt',
    name: '스트라이프 셔츠',
    brand: 'Muji',
    category: 'tops',
    price: 39000,
    imageUrl: '/images/clothing/stripe-shirt.jpg',
    originalUrl: 'https://www.muji.com/kr/products/cmdty/detail/4550583476908',
    description: '심플한 스트라이프 패턴의 코튼 셔츠',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['네이비스트라이프', '블랙스트라이프', '화이트'],
    tags: ['셔츠', '스트라이프', '오피스'],
    createdAt: new Date().toISOString()
  },
  
  // 하의
  {
    id: 'skinny-jeans',
    name: '스키니 진',
    brand: 'Zara',
    category: 'bottoms',
    price: 49900,
    imageUrl: '/images/clothing/skinny-jeans.jpg',
    originalUrl: 'https://www.zara.com/kr/ko/slim-fit-jeans-p05575306.html',
    description: '슬림한 핏의 스키니 진',
    sizes: ['26', '28', '30', '32', '34'],
    colors: ['연청', '진청', '블랙', '화이트'],
    tags: ['청바지', '스키니', '데일리'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'wide-pants',
    name: '와이드 팬츠',
    brand: 'COS',
    category: 'bottoms',
    price: 79000,
    imageUrl: '/images/clothing/wide-pants.jpg',
    originalUrl: 'https://www.cosstores.com/en_krw/women/trousers/product.wide-leg-trousers-black.0986045001.html',
    description: '편안한 와이드 핏의 팬츠',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['블랙', '네이비', '베이지', '그레이'],
    tags: ['와이드', '편안함', '트렌디'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chino-pants',
    name: '치노 팬츠',
    brand: 'Banana Republic',
    category: 'bottoms',
    price: 69000,
    imageUrl: '/images/clothing/chino-pants.jpg',
    originalUrl: 'https://bananarepublic.gap.com/browse/product.do?pid=906819002',
    description: '정장과 캐주얼 모두 어울리는 치노 팬츠',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['베이지', '네이비', '올리브', '그레이'],
    tags: ['치노', '비즈니스캐주얼', '베이직'],
    createdAt: new Date().toISOString()
  },
  
  // 신발
  {
    id: 'white-sneakers',
    name: '화이트 스니커즈',
    brand: 'Adidas',
    category: 'shoes',
    price: 99000,
    imageUrl: '/images/clothing/white-sneakers.jpg',
    originalUrl: 'https://www.adidas.co.kr/stan-smith-shoes/M20324.html',
    description: '클래식한 화이트 스니커즈',
    sizes: ['240', '245', '250', '255', '260', '265', '270', '275', '280'],
    colors: ['화이트', '화이트/그린', '화이트/네이비'],
    tags: ['스니커즈', '화이트', '클래식'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'loafers',
    name: '페니 로퍼',
    brand: 'Cole Haan',
    category: 'shoes',
    price: 189000,
    imageUrl: '/images/clothing/loafers.jpg',
    originalUrl: 'https://www.colehaan.com/pinch-weekender-loafer-brown/C20206.html',
    description: '정장과 캐주얼 모두 어울리는 페니 로퍼',
    sizes: ['240', '245', '250', '255', '260', '265', '270', '275'],
    colors: ['브라운', '블랙', '네이비'],
    tags: ['로퍼', '레더', '비즈니스'],
    createdAt: new Date().toISOString()
  },
  
  // 액세서리
  {
    id: 'classic-watch',
    name: '클래식 시계',
    brand: 'Daniel Wellington',
    category: 'accessories',
    price: 189000,
    imageUrl: '/images/clothing/classic-watch.jpg',
    originalUrl: 'https://www.danielwellington.com/kr/classic-sheffield-rose-gold-40mm',
    description: '미니멀한 디자인의 클래식 시계',
    sizes: ['36mm', '40mm'],
    colors: ['로즈골드', '실버', '골드'],
    tags: ['시계', '클래식', '미니멀'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'leather-bag',
    name: '레더 크로스백',
    brand: 'Michael Kors',
    category: 'accessories',
    price: 259000,
    imageUrl: '/images/clothing/leather-bag.jpg',
    originalUrl: 'https://www.michaelkors.com/jet-set-travel-large-crossbody-_32S4GTVC3L.html',
    description: '실용적이고 스타일리쉬한 레더 크로스백',
    sizes: ['Small', 'Medium', 'Large'],
    colors: ['블랙', '브라운', '네이비', '화이트'],
    tags: ['가방', '레더', '크로스백'],
    createdAt: new Date().toISOString()
  }
]; 