export type Gender = 'male' | 'female';

export interface BodyType {
  id: string;
  name: string;
  description: string;
  avatarImage?: string;
  measurements: {
    chest: number;
    waist: number;
    hip: number;
    shoulderWidth: number;
    armLength: number;
    legLength: number;
  };
}

export interface UserProfile {
  id?: string;
  gender: Gender;
  bodyType: BodyType;
  height: number;
  weight: number;
  name?: string;
  age?: number;
  preferences?: {
    styles: string[];
    colors: string[];
    priceRange: [number, number];
  };
}

export type ClothingCategoryType = 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories';

export interface ClothingCategory {
  id: ClothingCategoryType;
  name: string;
  displayName: string;
  description: string;
  icon: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  category: ClothingCategoryType;
  price: number;
  originalUrl: string;
  imageUrl: string;
  description: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  createdAt: string;
  createdBy?: string;
  githubIssueNumber?: number;
}

export interface AISettings {
  openaiApiKey: string;
  model: 'gpt-4' | 'gpt-4-turbo' | 'dall-e-3';
  maxTokens: number;
}

export interface OutfitGeneration {
  id: string;
  userProfile: UserProfile;
  selectedItems: ClothingItem[];
  generatedImageUrl: string;
  aiDescription: string;
  styleAnalysis: {
    overall: string;
    coordination: string;
    recommendations: string[];
  };
  createdAt: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  labels: string[];
  url: string;
  createdAt: string;
}

export type AppStep = 'settings' | 'gender' | 'bodyType' | 'profile' | 'items' | 'outfit';

export interface AppState {
  currentStep: AppStep;
  aiSettings?: AISettings;
  userProfile?: UserProfile;
  selectedGender?: Gender;
  selectedBodyType?: BodyType;
  clothingItems: ClothingItem[];
  selectedItems: ClothingItem[];
  generatedOutfits: OutfitGeneration[];
  isLoading: boolean;
  error?: string;
}

export interface ClothingItemForm {
  name: string;
  brand: string;
  category: ClothingCategoryType;
  price: number;
  originalUrl: string;
  description: string;
  colors: string[];
  sizes: string[];
  tags?: string[];
}

export interface SettingsForm {
  openaiApiKey: string;
  model: 'gpt-4' | 'gpt-4-turbo' | 'dall-e-3';
}

export interface ImageAnalysisResult {
  name: string;
  brand: string;
  category: ClothingCategoryType;
  description: string;
  estimatedPrice: number;
  colors: string[];
  tags: string[];
}

export interface OutfitRecommendation {
  description: string;
  styleAnalysis: string;
  recommendations: string[];
  reasoning: string;
} 