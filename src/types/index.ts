export interface UserProfile {
  id: string;
  height: number; // cm
  weight: number; // kg
  bodyType: BodyType;
  createdAt: Date;
}

export interface BodyType {
  id: string;
  name: string;
  description: string;
  avatarImage: string;
  measurements: {
    chest: number;
    waist: number;
    hip: number;
    shoulderWidth: number;
    armLength: number;
    legLength: number;
  };
}

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  category: ClothingCategory;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  description: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  isRecommended?: boolean;
}

export interface ClothingCategory {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  position: '3d-position'; // Three.js 좌표계 기준
}

export interface WardrobeItem {
  id: string;
  clothingItem: ClothingItem;
  selectedSize: string;
  selectedColor: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
}

export interface OutfitCoordination {
  id: string;
  name: string;
  items: WardrobeItem[];
  createdAt: Date;
  userId: string;
  isPublic: boolean;
  likes: number;
  tags: string[];
}

export interface Avatar3D {
  id: string;
  userProfile: UserProfile;
  meshGeometry: string; // 3D 메쉬 데이터
  materials: {
    skin: string;
    hair: string;
  };
  animations: string[];
}

export type ClothingCategoryType = 'tops' | 'bottoms' | 'shoes' | 'accessories' | 'outerwear'; 