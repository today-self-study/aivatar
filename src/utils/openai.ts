import OpenAI from 'openai';
import type { 
  UserProfile, 
  ClothingItem, 
  ImageAnalysisResult, 
  OutfitRecommendation,
  AISettings 
} from '../types';

interface OpenAIUtilsConfig {
  apiKey: string;
  model: 'gpt-4o' | 'gpt-4o-mini' | 'dall-e-3';
  maxTokens?: number;
}

export class OpenAIUtils {
  private openai: OpenAI;
  private config: OpenAIUtilsConfig;

  constructor(config: OpenAIUtilsConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async analyzeClothingFromUrl(url: string): Promise<ImageAnalysisResult> {
    try {
      const prompt = `
다음 쇼핑몰 URL에서 의류 상품을 분석해주세요: ${url}

아래 JSON 형식으로 정확하게 응답해주세요:
{
  "name": "상품명",
  "brand": "브랜드명",
  "category": "tops|bottoms|outerwear|shoes|accessories 중 하나",
  "description": "상품 설명",
  "estimatedPrice": 가격숫자,
  "colors": ["색상1", "색상2"],
  "tags": ["태그1", "태그2"]
}

한국어로 응답하고, 가격은 원화 기준으로 추정해주세요.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 패션 전문가입니다. 쇼핑몰 URL을 분석하여 의류 정보를 정확하게 추출해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens || 1000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI API 응답이 비어있습니다.');
      }

      try {
        const parsed = JSON.parse(content) as ImageAnalysisResult;
        return parsed;
      } catch (parseError) {
        // JSON 파싱 실패 시 기본값 반환
        return {
          name: '분석된 상품',
          brand: '알 수 없음',
          category: 'tops',
          description: '상품 분석 중 오류가 발생했습니다.',
          estimatedPrice: 0,
          colors: ['기타'],
          tags: ['분석오류']
        };
      }
    } catch (error) {
      console.error('Failed to analyze clothing from URL:', error);
      throw new Error('의류 분석에 실패했습니다. API Key를 확인해주세요.');
    }
  }

  async generateOutfitRecommendation(
    userProfile: UserProfile,
    selectedItems: ClothingItem[]
  ): Promise<OutfitRecommendation> {
    try {
      const userInfo = `
사용자 정보:
- 성별: ${userProfile.gender === 'male' ? '남성' : '여성'}
- 체형: ${userProfile.bodyType.name} (${userProfile.bodyType.description})
- 키: ${userProfile.height}cm
- 몸무게: ${userProfile.weight}kg
`;

      const itemsInfo = selectedItems.map(item => 
        `- ${item.name} (${item.brand}, ${item.category}, ${item.colors.join('/')}, ${item.price.toLocaleString()}원)`
      ).join('\n');

      const prompt = `
${userInfo}

선택한 의류:
${itemsInfo}

위 정보를 바탕으로 코디네이션을 분석하고 추천해주세요.

아래 JSON 형식으로 정확하게 응답해주세요:
{
  "description": "전체적인 코디 설명",
  "styleAnalysis": "스타일 분석",
  "recommendations": ["추천사항1", "추천사항2", "추천사항3"],
  "reasoning": "이 코디를 추천하는 이유"
}

한국어로 자연스럽게 작성해주세요.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 스타일리스트입니다. 사용자의 체형과 의류를 분석하여 최적의 코디네이션을 추천해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens || 1500,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI API 응답이 비어있습니다.');
      }

      try {
        const parsed = JSON.parse(content) as OutfitRecommendation;
        return parsed;
      } catch (parseError) {
        // JSON 파싱 실패 시 기본값 반환
        return {
          description: '선택하신 아이템들로 멋진 코디를 완성할 수 있습니다.',
          styleAnalysis: '균형감 있는 스타일링',
          recommendations: [
            '선택한 아이템들이 잘 어울립니다',
            '체형에 맞는 핏입니다',
            '색상 조합이 좋습니다'
          ],
          reasoning: '전체적으로 조화로운 코디입니다.'
        };
      }
    } catch (error) {
      console.error('Failed to generate outfit recommendation:', error);
      throw new Error('코디 추천 생성에 실패했습니다.');
    }
  }

  async generateOutfitImage(
    userProfile: UserProfile,
    selectedItems: ClothingItem[]
  ): Promise<string> {
    try {
      const gender = userProfile.gender === 'male' ? 'man' : 'woman';
      const bodyType = userProfile.bodyType.name;
      
      const itemDescriptions = selectedItems.map(item => {
        const colors = item.colors.join(' and ');
        return `${colors} ${item.category} (${item.name})`;
      }).join(', ');

      const prompt = `
A realistic full-body fashion photograph of a ${gender} with ${bodyType} body type, 
wearing ${itemDescriptions}.
The person should be standing in a clean, minimalist studio setting with soft lighting.
High fashion photography style, professional quality, front view.
The outfit should look stylish and well-coordinated.
Model should be ${userProfile.height}cm tall proportionally.
Clean background, no text or logos.
`;

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1792',
        quality: 'hd',
        n: 1
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('이미지 생성에 실패했습니다.');
      }

      return imageUrl;
    } catch (error) {
      console.error('Failed to generate outfit image:', error);
      throw new Error('코디 이미지 생성에 실패했습니다.');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        ],
        max_tokens: 10
      });

      return !!response.choices[0]?.message?.content;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

// Global instance
let openaiInstance: OpenAIUtils | null = null;

export function initializeOpenAI(settings: AISettings) {
  openaiInstance = new OpenAIUtils({
    apiKey: settings.openaiApiKey,
    model: 'gpt-4o'
  });
}

export function getOpenAI(): OpenAIUtils {
  if (!openaiInstance) {
    throw new Error('OpenAI not initialized. Please call initializeOpenAI first.');
  }
  return openaiInstance;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const testInstance = new OpenAIUtils({
      apiKey,
      model: 'gpt-4o-mini'
    });
    return await testInstance.testConnection();
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
} 