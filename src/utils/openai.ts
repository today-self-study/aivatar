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

  async analyzeClothingFromUrl(url: string, onProgress?: (message: string) => void): Promise<ImageAnalysisResult> {
    try {
      // 1단계: 사용자 브라우저에서 스크린샷 촬영
      onProgress?.('상품 페이지를 열고 스크린샷을 준비하는 중...');
      
      let screenshotBase64 = '';
      
      try {
        // 사용자에게 페이지를 열어달라고 안내
        onProgress?.('새 탭에서 상품 페이지를 열어주세요...');
        
        // 새 탭으로 상품 페이지 열기
        const newTab = window.open(url, '_blank');
        if (!newTab) {
          throw new Error('팝업이 차단되었습니다. 팝업을 허용하고 다시 시도해주세요.');
        }
        
        // 페이지 로딩 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        onProgress?.('화면 캡처를 시작합니다. 브라우저에서 상품 페이지 탭을 선택해주세요...');
        
        // Screen Capture API로 스크린샷 촬영
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1200 },
            height: { ideal: 800 }
          }
        });
        
        onProgress?.('화면을 캡처하는 중...');
        
        // 비디오 스트림을 캔버스로 변환
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        // 비디오가 재생되면 캔버스에 그리기
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            
            // base64로 변환
            screenshotBase64 = canvas.toDataURL('image/png').split(',')[1];
            
            // 스트림 정리
            stream.getTracks().forEach(track => track.stop());
            
            // 새 탭 닫기
            newTab.close();
            
            resolve(void 0);
          };
        });
        
        if (!screenshotBase64) {
          throw new Error('스크린샷 캡처 실패');
        }
        
        onProgress?.('스크린샷 캡처 완료!');
        
      } catch (screenshotError) {
        console.warn('브라우저 스크린샷 실패, 대체 방법 시도:', screenshotError);
        
        // 브라우저 스크린샷 실패 시 iframe + html2canvas 시도
        try {
          onProgress?.('iframe을 사용한 스크린샷을 시도하는 중...');
          screenshotBase64 = await this.captureWithIframe(url);
        } catch (iframeError) {
          console.warn('iframe 스크린샷도 실패, 텍스트 분석으로 대체:', iframeError);
          // 모든 스크린샷 방법 실패 시 텍스트 분석으로 폴백
          return await this.analyzeWithTextContent(url, onProgress);
        }
      }

      // 2단계: GPT-4o Vision으로 이미지 분석
      onProgress?.('AI가 상품 이미지를 분석하는 중...');
      
      const prompt = `
이 쇼핑몰 웹페이지 스크린샷을 분석하여 의류 상품 정보를 추출해주세요.

웹페이지 URL: ${url}

다음 정보를 정확하게 분석해주세요:
1. 상품 이미지에서 보이는 의류의 종류와 스타일
2. 페이지에 표시된 상품명, 브랜드명
3. 가격 정보 (할인가가 있다면 할인가 우선)
4. 상품 설명이나 특징
5. 색상 옵션들
6. 카테고리 (상의/하의/아우터/신발/액세서리)

아래 JSON 형식으로 정확하게 응답해주세요:
{
  "name": "상품명",
  "brand": "브랜드명",
  "category": "tops|bottoms|outerwear|shoes|accessories 중 하나",
  "description": "상품 설명 (스타일, 소재, 특징 포함)",
  "estimatedPrice": 가격숫자,
  "colors": ["색상1", "색상2"],
  "tags": ["태그1", "태그2", "태그3"]
}

분석 지침:
- 이미지에서 실제로 보이는 상품을 기준으로 분석
- 카테고리는 상품 이미지와 설명을 종합하여 정확히 분류
- 가격은 페이지에 표시된 숫자에서 추출 (원화 기준)
- 색상은 이미지에서 보이는 색상과 옵션에서 제공되는 색상 모두 고려
- 태그는 스타일, 시즌, 소재, 용도 등을 포함

반드시 JSON 형식만 응답하고, 다른 설명은 포함하지 마세요.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 패션 분석가입니다. 쇼핑몰 웹페이지 스크린샷을 정확하게 분석하여 의류 상품 정보를 JSON 형식으로 추출해주세요. 이미지의 모든 시각적 정보와 텍스트 정보를 종합적으로 고려하여 가장 정확한 결과를 제공해주세요.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshotBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.2
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

  // 텍스트 기반 분석 (스크린샷 실패 시 폴백)
  private async analyzeWithTextContent(url: string, _onProgress?: (message: string) => void): Promise<ImageAnalysisResult> {
    // 기존 텍스트 분석 로직 유지
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
        ];
        
        for (const proxyUrl of proxyServices) {
          try {
            response = await fetch(proxyUrl, {
              headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (response.ok) break;
          } catch (proxyError) {
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
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(responseText, 'text/html');
        
        const title = doc.querySelector('title')?.textContent?.trim() || '';
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        productInfo = `
URL: ${url}
제목: ${title}
설명: ${description}
`;
      }
    } catch (error) {
      console.warn('텍스트 분석도 실패:', error);
    }
    
    // 기본 GPT 분석
    const prompt = `
다음 쇼핑몰 정보를 분석해주세요:
${productInfo}

JSON 형식으로 응답해주세요:
{
  "name": "상품명",
  "brand": "브랜드명", 
  "category": "tops",
  "description": "상품 설명",
  "estimatedPrice": 50000,
  "colors": ["기타"],
  "tags": ["일반"]
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '쇼핑몰 정보를 분석하여 JSON 형식으로 응답해주세요.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as ImageAnalysisResult;
        }
      }
    } catch (error) {
      console.error('텍스트 기반 GPT 분석 실패:', error);
    }
    
    return this.createFallbackAnalysis(url);
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

  // iframe을 사용한 스크린샷 캡처 (폴백 방법)
  private async captureWithIframe(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // iframe 생성
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '1200px';
        iframe.style.height = '800px';
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        
        document.body.appendChild(iframe);
        
        iframe.onload = async () => {
          try {
            // html2canvas가 있다면 사용 (없으면 에러)
            if (typeof (window as any).html2canvas !== 'undefined') {
              if (!iframe.contentDocument?.body) {
                throw new Error('iframe 콘텐츠에 접근할 수 없습니다');
              }
              const canvas = await (window as any).html2canvas(iframe.contentDocument.body);
              const base64 = canvas.toDataURL('image/png').split(',')[1];
              document.body.removeChild(iframe);
              resolve(base64);
            } else {
              throw new Error('html2canvas 라이브러리가 필요합니다');
            }
          } catch (error) {
            document.body.removeChild(iframe);
            reject(error);
          }
        };
        
        iframe.onerror = () => {
          document.body.removeChild(iframe);
          reject(new Error('iframe 로딩 실패'));
        };
        
        // 타임아웃 설정
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
            reject(new Error('iframe 로딩 타임아웃'));
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
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