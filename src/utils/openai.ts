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
      // 1단계: 웹페이지 내용 가져오기
      let pageContent = '';
      let productInfo = '';
      
      try {
        // CORS 문제를 우회하기 위해 여러 방법 시도
        let response;
        
        // 1. 직접 fetch 시도
        try {
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });
        } catch (directError) {
          console.warn('Direct fetch failed, trying proxy services:', directError);
          
          // 2. 공개 프록시 서비스들 시도
          const proxyServices = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
            `https://cors-anywhere.herokuapp.com/${url}`,
          ];
          
          for (const proxyUrl of proxyServices) {
            try {
              console.log(`Trying proxy: ${proxyUrl}`);
              response = await fetch(proxyUrl, {
                headers: {
                  'X-Requested-With': 'XMLHttpRequest',
                }
              });
              
              if (response.ok) {
                console.log(`Proxy successful: ${proxyUrl}`);
                break;
              }
            } catch (proxyError) {
              console.warn(`Proxy failed: ${proxyUrl}`, proxyError);
              continue;
            }
          }
        }
        
        if (response && response.ok) {
          let responseText = await response.text();
          
          // allorigins 응답 처리
          if (responseText.includes('"contents"')) {
            try {
              const jsonResponse = JSON.parse(responseText);
              responseText = jsonResponse.contents;
            } catch (e) {
              // JSON 파싱 실패 시 원본 사용
            }
          }
          
          pageContent = responseText;
          
          // HTML에서 상품 정보 추출
          const parser = new DOMParser();
          const doc = parser.parseFromString(pageContent, 'text/html');
          
          // 상품명, 가격, 설명 등 추출
          const title = doc.querySelector('title')?.textContent || 
                       doc.querySelector('h1')?.textContent ||
                       doc.querySelector('[class*="title"], [class*="name"], [class*="product"]')?.textContent || '';
          
          const price = doc.querySelector('[class*="price"], [class*="cost"], [class*="won"]')?.textContent || '';
          
          const description = doc.querySelector('[class*="description"], [class*="detail"], [name="description"]')?.getAttribute('content') ||
                            doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
          
          const brand = doc.querySelector('[class*="brand"], [class*="maker"]')?.textContent ||
                       doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '';
          
          productInfo = `
상품 페이지 정보:
- 페이지 제목: ${title}
- 가격 정보: ${price}
- 브랜드: ${brand}
- 상품 설명: ${description}
- URL: ${url}

추가 HTML 메타데이터:
${doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || ''}
${doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || ''}
`;
        }
      } catch (fetchError) {
        console.warn('Direct fetch failed, using URL pattern analysis:', fetchError);
        
        // fetch 실패 시 URL 패턴 분석으로 대체
        productInfo = `
URL 패턴 분석: ${url}

도메인 기반 추정:
- 쇼핑몰: ${this.extractShoppingMall(url)}
- 카테고리 추정: ${this.extractCategoryFromUrl(url)}
`;
      }

      // 2단계: GPT에 상품 정보 분석 요청
      const prompt = `
다음 쇼핑몰 상품 정보를 분석해서 의류 정보를 추출해주세요:

${productInfo}

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

규칙:
1. 상품명은 간결하게 정리해주세요
2. 브랜드명이 명확하지 않으면 쇼핑몰명을 사용해주세요
3. 카테고리는 반드시 지정된 5개 중 하나를 선택해주세요
4. 가격은 숫자만 추출해주세요 (원화 기준)
5. 색상은 한국어로 표현해주세요
6. 태그는 스타일, 시즌, 특징 등을 포함해주세요

한국어로 응답하고, JSON 형식을 정확히 지켜주세요.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 패션 전문가입니다. 제공된 웹페이지 정보를 분석하여 의류 정보를 정확하게 추출해주세요. 반드시 JSON 형식으로만 응답해주세요.'
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
        // JSON 응답 파싱
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('JSON 형식을 찾을 수 없습니다.');
        }
        
        const parsed = JSON.parse(jsonMatch[0]) as ImageAnalysisResult;
        
        // 기본값 검증 및 보정
        if (!parsed.name || parsed.name === '상품명') {
          parsed.name = this.extractProductNameFromUrl(url);
        }
        if (!parsed.brand || parsed.brand === '브랜드명') {
          parsed.brand = this.extractShoppingMall(url);
        }
        if (!parsed.category) {
          parsed.category = this.extractCategoryFromUrl(url);
        }
        if (!parsed.estimatedPrice || parsed.estimatedPrice === 0) {
          parsed.estimatedPrice = 50000; // 기본값
        }
        if (!parsed.colors || parsed.colors.length === 0) {
          parsed.colors = ['기타'];
        }
        if (!parsed.tags || parsed.tags.length === 0) {
          parsed.tags = ['일반'];
        }
        
        return parsed;
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        // JSON 파싱 실패 시 URL 기반 기본값 반환
        return this.createFallbackAnalysis(url);
      }
    } catch (error) {
      console.error('Failed to analyze clothing from URL:', error);
      
      // 모든 분석 실패 시 URL 기반 기본값 반환
      return this.createFallbackAnalysis(url);
    }
  }

  // URL에서 쇼핑몰명 추출
  private extractShoppingMall(url: string): string {
    const domain = url.toLowerCase();
    if (domain.includes('musinsa')) return '무신사';
    if (domain.includes('29cm')) return '29CM';
    if (domain.includes('styleshare')) return '스타일쉐어';
    if (domain.includes('brandi')) return '브랜디';
    if (domain.includes('zigzag')) return '지그재그';
    if (domain.includes('coupang')) return '쿠팡';
    if (domain.includes('gmarket')) return 'G마켓';
    if (domain.includes('11st')) return '11번가';
    if (domain.includes('wconcept')) return 'W컨셉';
    if (domain.includes('uniqlo')) return '유니클로';
    if (domain.includes('zara')) return '자라';
    if (domain.includes('hm.com')) return 'H&M';
    if (domain.includes('nike')) return '나이키';
    if (domain.includes('adidas')) return '아디다스';
    return '온라인쇼핑몰';
  }

  // URL에서 카테고리 추정
  private extractCategoryFromUrl(url: string): 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories' {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('pants') || urlLower.includes('jean') || urlLower.includes('trouser') || urlLower.includes('bottom')) return 'bottoms';
    if (urlLower.includes('jacket') || urlLower.includes('coat') || urlLower.includes('outer') || urlLower.includes('cardigan')) return 'outerwear';
    if (urlLower.includes('shoe') || urlLower.includes('sneaker') || urlLower.includes('boot') || urlLower.includes('sandal')) return 'shoes';
    if (urlLower.includes('bag') || urlLower.includes('watch') || urlLower.includes('accessory') || urlLower.includes('hat') || urlLower.includes('belt')) return 'accessories';
    return 'tops'; // 기본값
  }

  // URL에서 상품명 추정
  private extractProductNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      const lastPart = pathParts[pathParts.length - 1];
      
      // URL 디코딩 및 정리
      const decoded = decodeURIComponent(lastPart);
      const cleaned = decoded.replace(/[-_]/g, ' ').replace(/\.(html|php|jsp|asp)$/i, '');
      
      return cleaned || '상품';
    } catch {
      return '상품';
    }
  }

  // 폴백 분석 결과 생성
  private createFallbackAnalysis(url: string): ImageAnalysisResult {
    return {
      name: this.extractProductNameFromUrl(url),
      brand: this.extractShoppingMall(url),
      category: this.extractCategoryFromUrl(url),
      description: 'URL을 통해 추가된 상품입니다. 세부 정보를 직접 입력해주세요.',
      estimatedPrice: 50000,
      colors: ['기타'],
      tags: ['URL추가']
    };
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