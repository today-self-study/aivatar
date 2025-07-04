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
      // 1단계: 웹페이지 텍스트 콘텐츠 분석
      onProgress?.('상품 페이지 정보를 가져오는 중...');
      
      return await this.analyzeWithTextContent(url, onProgress);
      
    } catch (error) {
      console.error('Failed to analyze clothing from URL:', error);
      
      // 모든 분석 실패 시 URL 기반 기본값 반환
      return this.createFallbackAnalysis(url);
    }
  }

  // 텍스트 기반 분석 (메인 분석 방법)
  private async analyzeWithTextContent(url: string, onProgress?: (message: string) => void): Promise<ImageAnalysisResult> {
    let productInfo = '';
    let extractedImageUrl = '';
    
    try {
      onProgress?.('웹페이지 내용을 분석하는 중...');
      
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
        
        // 메타 정보 추출
        const title = doc.querySelector('title')?.textContent?.trim() || '';
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
        const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
        
        // 상품 정보 요소들 추출
        const productName = doc.querySelector('.product-name, .item-name, .goods-name, h1')?.textContent?.trim() || '';
        const brandName = doc.querySelector('.brand-name, .brand, .maker')?.textContent?.trim() || '';
        const price = doc.querySelector('.price, .amount, .cost')?.textContent?.trim() || '';
        
        // 상품 이미지 추출
        extractedImageUrl = this.extractProductImage(doc, url);
        
        productInfo = `
URL: ${url}
제목: ${title}
OG 제목: ${ogTitle}
설명: ${description}
OG 설명: ${ogDescription}
상품명: ${productName}
브랜드: ${brandName}
가격: ${price}
이미지: ${extractedImageUrl}
`;
      }
    } catch (error) {
      console.warn('웹페이지 분석 실패:', error);
    }
    
    onProgress?.('AI가 상품 정보를 분석하는 중...');
    
    // GPT를 통한 상품 정보 분석
    const prompt = `
다음 쇼핑몰 상품 정보를 분석하여 정확한 의류 정보를 추출해주세요:

${productInfo}

다음 JSON 형식으로 정확하게 응답해주세요:
{
  "name": "상품명",
  "brand": "브랜드명", 
  "category": "tops|bottoms|outerwear|shoes|accessories 중 하나",
  "description": "상품 설명 (스타일, 소재, 특징 포함)",
  "estimatedPrice": 가격숫자,
  "colors": ["색상1", "색상2"],
  "tags": ["태그1", "태그2", "태그3"],
  "imageUrl": "상품이미지URL",
  "details": {
    "name": "상품명",
    "brand": "브랜드명",
    "price": 가격숫자,
    "color": "주요색상",
    "size": "사이즈정보",
    "description": "상품설명"
  }
}

분석 지침:
- 카테고리는 상품 정보를 종합하여 정확히 분류 (상의=tops, 하의=bottoms, 아우터=outerwear, 신발=shoes, 액세서리=accessories)
- 가격은 숫자만 추출 (원화 기준, 쉼표 제거)
- 색상은 한국어로 표기 (화이트, 블랙, 네이비 등)
- 태그는 스타일, 소재, 용도 등을 포함
- details 객체에는 폼 입력용 세부 정보 포함

반드시 유효한 JSON 형식으로만 응답하고, 마크다운 코드 블록이나 다른 텍스트는 포함하지 마세요.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // 텍스트 분석이므로 더 빠른 모델 사용
        messages: [
          {
            role: 'system',
            content: '당신은 전문 패션 분석가입니다. 쇼핑몰 상품 정보를 정확하게 분석하여 의류 정보를 JSON 형식으로 추출해주세요. 반드시 유효한 JSON만 응답하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('OpenAI API 응답이 비어있습니다.');
      }

      try {
        // JSON 코드 블록 제거 및 파싱
        let jsonContent = content;
        
        // 마크다운 코드 블록 제거
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonContent = codeBlockMatch[1].trim();
        }
        
        // JSON 객체 추출
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('JSON 형식을 찾을 수 없습니다.');
        }
        
        const parsed = JSON.parse(jsonMatch[0]) as ImageAnalysisResult;
        
        // 데이터 검증 및 보정
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
        
        // 추출된 이미지 URL 설정
        if (!parsed.imageUrl && extractedImageUrl) {
          parsed.imageUrl = extractedImageUrl;
        }
        
        // details 객체 보정
        if (!parsed.details) {
          parsed.details = {};
        }
        if (!parsed.details.name) {
          parsed.details.name = parsed.name;
        }
        if (!parsed.details.brand) {
          parsed.details.brand = parsed.brand;
        }
        if (!parsed.details.price) {
          parsed.details.price = parsed.estimatedPrice;
        }
        if (!parsed.details.color && parsed.colors.length > 0) {
          parsed.details.color = parsed.colors[0];
        }
        
        onProgress?.('분석 완료!');
        return parsed;
        
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError, 'Content:', content);
        // JSON 파싱 실패 시 URL 기반 기본값 반환
        return this.createFallbackAnalysis(url);
      }
    } catch (apiError) {
      console.error('OpenAI API call failed:', apiError);
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
      const gender = userProfile.gender === 'male' ? 'male' : 'female';
      const bodyType = userProfile.bodyType.name;

      // 의상 아이템들을 정확한 브랜드, 색상, 스타일로 설명
      const itemDescriptions = selectedItems.map(item => {
        const colors = item.colors.join(' and ');
        const brand = item.brand;
        const name = item.name;
        const category = item.category;
        
        return `${category}: ${colors} ${name} by ${brand} (EXACT MATCH REQUIRED)`;
      }).join('\n');

      const prompt = `
Create a high-quality product showcase image of a simple, neutral ${gender} mannequin wearing the following outfit:

CLOTHING ITEMS TO DISPLAY (MUST MATCH EXACTLY):
${itemDescriptions}

CRITICAL REQUIREMENTS - CLOTHING ACCURACY:
- Each clothing item MUST match the exact brand, color, and style specified
- Do NOT modify, reinterpret, or substitute any clothing details
- Colors must be EXACTLY as specified (no variations or interpretations)
- Brand styling characteristics must be preserved
- Clothing fit should match the specified brand's typical fit

MANNEQUIN SPECIFICATIONS:
- Use a simple, neutral, featureless mannequin (not a real person)
- Plain white or light gray mannequin body
- No facial features, hair, or human characteristics
- Proportional to ${userProfile.height}cm height
- ${bodyType} body proportions
- Standing in straight, neutral pose with arms at sides

PHOTOGRAPHY SETUP:
- Clean white studio background
- Professional product photography lighting
- Even, soft lighting that shows fabric textures clearly
- No shadows or dramatic lighting effects
- Front-facing view showing complete outfit
- Full body shot from head to toe
- High resolution, crisp details on all clothing items

STYLING REQUIREMENTS:
- All clothing items should be properly fitted on the mannequin
- Natural draping and positioning of garments
- Each piece should be clearly visible and well-coordinated
- Professional retail display presentation
- Focus on showcasing the actual clothing items, not the mannequin

FORBIDDEN ELEMENTS:
- No human model or realistic human features
- No text, logos, or watermarks in the image
- No background elements or props
- No dramatic poses or fashion styling
- No modification of specified clothing details

The result should look like a professional product catalog photo focusing on the clothing items displayed on a simple mannequin.
`;

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1792', // 세로형 비율로 전신 촬영에 적합
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

  // GPT-4o Vision을 활용한 이미지 분석 기반 착장 생성
  async generateOutfitImageWithRealClothes(
    userProfile: UserProfile,
    selectedItems: ClothingItem[]
  ): Promise<string> {
    try {
      const gender = userProfile.gender === 'male' ? 'male' : 'female';
      const bodyType = userProfile.bodyType.name;

      // 이미지가 있는 의상들만 필터링
      const itemsWithImages = selectedItems.filter(item => item.imageUrl);
      
      if (itemsWithImages.length === 0) {
        // 이미지가 없는 경우 기존 방식으로 폴백
        return this.generateOutfitImage(userProfile, selectedItems);
      }

      // 각 의상 이미지를 GPT-4o Vision으로 분석하여 정확한 설명 생성
      const detailedDescriptions = await Promise.all(
        itemsWithImages.map(async (item) => {
          try {
            const response = await this.openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert fashion analyst. Analyze clothing items in images and provide extremely detailed, accurate descriptions focusing on colors, textures, patterns, cut, fit, and styling details that would be essential for recreating the exact same garment.'
                },
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: `Analyze this ${item.category} clothing item and provide a detailed description that captures:
1. Exact colors and color combinations
2. Fabric texture and material appearance
3. Patterns, prints, or design elements
4. Cut and silhouette details
5. Fit characteristics (loose, fitted, oversized, etc.)
6. Any distinctive styling features or brand characteristics
7. How the garment drapes or falls

Focus on visual details that would help recreate this exact item. Be specific about shades, textures, and proportions.`
                    },
                    {
                      type: 'image_url',
                      image_url: { url: item.imageUrl! }
                    }
                  ]
                }
              ],
              max_tokens: 300
            });

            const analysis = response.choices[0]?.message?.content || '';
            return {
              category: item.category,
              brand: item.brand,
              name: item.name,
              detailedDescription: analysis,
              originalDescription: `${item.colors.join(' and ')} ${item.name} by ${item.brand}`
            };
          } catch (error) {
            console.warn(`Failed to analyze image for ${item.name}:`, error);
            // 분석 실패 시 기본 설명 사용
            return {
              category: item.category,
              brand: item.brand,
              name: item.name,
              detailedDescription: `${item.colors.join(' and ')} ${item.name} by ${item.brand}`,
              originalDescription: `${item.colors.join(' and ')} ${item.name} by ${item.brand}`
            };
          }
        })
      );

      // 이미지가 없는 아이템들도 포함
      const itemsWithoutImages = selectedItems.filter(item => !item.imageUrl);
      const allItemDescriptions = [
        ...detailedDescriptions,
        ...itemsWithoutImages.map(item => ({
          category: item.category,
          brand: item.brand,
          name: item.name,
          detailedDescription: `${item.colors.join(' and ')} ${item.name} by ${item.brand}`,
          originalDescription: `${item.colors.join(' and ')} ${item.name} by ${item.brand}`
        }))
      ];

      // 향상된 프롬프트 생성
      const enhancedPrompt = `
Create a high-quality product showcase image of a simple, neutral ${gender} mannequin wearing the following outfit with EXACT ACCURACY:

CLOTHING ITEMS TO DISPLAY (MUST MATCH PERFECTLY):
${allItemDescriptions.map(item => 
  `${item.category.toUpperCase()}: ${item.detailedDescription}`
).join('\n\n')}

CRITICAL REQUIREMENTS - VISUAL ACCURACY:
- Each clothing item must match the analyzed description EXACTLY
- Colors must be precisely as described (no variations or artistic interpretation)
- Fabric textures and material appearance must be accurate
- Patterns, prints, and design elements must be replicated exactly
- Cut, fit, and silhouette must match the analysis
- Brand styling characteristics must be preserved
- All proportions and details must be accurate

MANNEQUIN SPECIFICATIONS:
- Use a simple, neutral, featureless ${gender} mannequin (NOT a real person)
- Plain white or light gray mannequin body
- No facial features, hair, or human characteristics
- Proportional to ${userProfile.height}cm height
- ${bodyType} body proportions
- Standing in straight, neutral pose with arms at sides

PHOTOGRAPHY SETUP:
- Clean white studio background
- Professional product photography lighting
- Even, soft lighting that shows fabric textures and colors accurately
- No shadows or dramatic lighting effects
- Front-facing view showing complete outfit
- Full body shot from head to toe
- High resolution, crisp details on all clothing items
- Color accuracy is paramount - lighting should not alter clothing colors

STYLING REQUIREMENTS:
- All clothing items should be properly fitted on the mannequin
- Natural draping and positioning of garments as they would appear in real life
- Each piece should be clearly visible and well-coordinated
- Professional retail display presentation
- Focus on showcasing the exact clothing items, not the mannequin

FORBIDDEN ELEMENTS:
- No human model or realistic human features
- No text, logos, or watermarks in the image
- No background elements or props
- No dramatic poses or fashion styling
- No modification of any clothing details from the descriptions
- No artistic interpretation of colors or patterns

The result should look like a professional product catalog photo focusing on the exact clothing items as analyzed, displayed on a simple mannequin with perfect color and detail accuracy.
`;

      // DALL-E 3로 이미지 생성
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
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
      console.error('Failed to generate outfit image with real clothes analysis:', error);
      // 오류 발생 시 기존 방식으로 폴백
      return this.generateOutfitImage(userProfile, selectedItems);
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

  // 상품 이미지 추출
  private extractProductImage(doc: Document, baseUrl: string): string {
    // 1. Open Graph 이미지 (가장 정확함)
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (ogImage) {
      return this.resolveImageUrl(ogImage, baseUrl);
    }
    
    // 2. Twitter Card 이미지
    const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
    if (twitterImage) {
      return this.resolveImageUrl(twitterImage, baseUrl);
    }
    
    // 3. 일반적인 상품 이미지 셀렉터들
    const productImageSelectors = [
      '.product-image img',
      '.item-image img', 
      '.goods-image img',
      '.main-image img',
      '.product-photo img',
      '.product-detail img:first-of-type',
      '.product-img img',
      '.item-img img',
      '.detail-image img',
      '.thumb-image img',
      'img[alt*="상품"]',
      'img[alt*="제품"]',
      'img[alt*="아이템"]'
    ];
    
    for (const selector of productImageSelectors) {
      const img = doc.querySelector(selector) as HTMLImageElement;
      if (img?.src && this.isValidProductImage(img.src)) {
        return this.resolveImageUrl(img.src, baseUrl);
      }
    }
    
    // 4. 큰 이미지 찾기 (일반적으로 상품 이미지가 큼)
    const allImages = Array.from(doc.querySelectorAll('img')) as HTMLImageElement[];
    const validImages = allImages
      .filter(img => img.src && this.isValidProductImage(img.src))
      .filter(img => {
        // 로고나 아이콘 제외
        const src = img.src.toLowerCase();
        return !src.includes('logo') && 
               !src.includes('icon') && 
               !src.includes('banner') &&
               !src.includes('ad');
      })
      .sort((a, b) => {
        // 크기 기준 정렬 (큰 이미지가 상품 이미지일 가능성 높음)
        const aSize = (a.naturalWidth || a.width || 0) * (a.naturalHeight || a.height || 0);
        const bSize = (b.naturalWidth || b.width || 0) * (b.naturalHeight || b.height || 0);
        return bSize - aSize;
      });
    
    if (validImages.length > 0) {
      return this.resolveImageUrl(validImages[0].src, baseUrl);
    }
    
    return '';
  }
  
  // 상대 URL을 절대 URL로 변환
  private resolveImageUrl(imageUrl: string, baseUrl: string): string {
    if (!imageUrl) return '';
    
    // 이미 절대 URL인 경우
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // 프로토콜 상대 URL인 경우
    if (imageUrl.startsWith('//')) {
      const protocol = baseUrl.startsWith('https://') ? 'https:' : 'http:';
      return protocol + imageUrl;
    }
    
    // 상대 URL인 경우
    try {
      const base = new URL(baseUrl);
      const resolved = new URL(imageUrl, base.origin);
      return resolved.href;
    } catch (error) {
      console.warn('이미지 URL 변환 실패:', error);
      return imageUrl;
    }
  }
  
  // 유효한 상품 이미지인지 확인
  private isValidProductImage(src: string): boolean {
    if (!src) return false;
    
    const url = src.toLowerCase();
    
    // 제외할 이미지 패턴들
    const excludePatterns = [
      'logo', 'icon', 'banner', 'ad', 'advertisement',
      'header', 'footer', 'menu', 'nav', 'button',
      'bg', 'background', 'pattern', 'texture',
      'sprite', 'placeholder', 'loading', 'error',
      'social', 'share', 'like', 'cart', 'wishlist'
    ];
    
    // 제외 패턴이 포함된 경우
    if (excludePatterns.some(pattern => url.includes(pattern))) {
      return false;
    }
    
    // 이미지 확장자 확인
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext => url.includes(ext));
    
    // 확장자가 있거나, 일반적인 이미지 URL 패턴인 경우
    return hasImageExtension || url.includes('image') || url.includes('img') || url.includes('photo');
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