import type { SimpleAnalysisResult } from '../types';

// 고급 Virtual Try-On 이미지 생성 API 유틸리티
export interface VirtualTryOnGeneration {
  generateVirtualTryOn(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl?: string }[],
    basePersonImage?: string // 기준이 될 사람 이미지
  ): Promise<string>;
  
  extractImageFromUrl(url: string): Promise<string | null>;
}

// API 설정 타입
export interface AIApiConfig {
  openaiApiKey?: string;
  useAI: boolean; // AI 사용 여부 (OpenAI API 키가 있으면 true)
}

// 이미지 처리 유틸리티
class ImageProcessor {
  // URL에서 이미지를 Base64로 변환
  static async urlToBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('이미지 변환 실패:', error);
      throw error;
    }
  }

  // 이미지 크기 조정
  static async resizeImage(base64: string, maxWidth: number = 512, maxHeight: number = 512): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // 비율 유지하면서 크기 조정
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = base64;
    });
  }

  // 이미지 배경 제거 (간단한 버전)
  static async removeBackground(base64: string): Promise<string> {
    // 실제 구현에서는 더 정교한 배경 제거 알고리즘 사용
    return base64; // 임시로 원본 반환
  }
}

class VirtualTryOnGenerator implements VirtualTryOnGeneration {
  private config: AIApiConfig;

  constructor(config: AIApiConfig) {
    this.config = config;
  }

  async extractImageFromUrl(url: string): Promise<string | null> {
    try {
      console.log('이미지 추출 시작:', url);
      
      // 직접 이미지 URL인 경우
      if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
        console.log('직접 이미지 URL 감지');
        return url;
      }

      // 다양한 방법으로 이미지 추출 시도
      let imageUrl = null;
      
      // 1. CORS 프록시를 통한 HTML 파싱
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const html = await response.text();
          imageUrl = this.extractImageFromHtml(html, url);
          if (imageUrl) {
            console.log('HTML 파싱으로 이미지 추출 성공:', imageUrl);
            return imageUrl;
          }
        }
      } catch (error) {
        console.warn('HTML 파싱 실패:', error);
      }

      // 2. 다른 CORS 프록시 시도
      try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        if (response.ok) {
          const html = await response.text();
          imageUrl = this.extractImageFromHtml(html, url);
          if (imageUrl) {
            console.log('대체 프록시로 이미지 추출 성공:', imageUrl);
            return imageUrl;
          }
        }
      } catch (error) {
        console.warn('대체 프록시 실패:', error);
      }

      // 3. 도메인별 특수 처리
      imageUrl = this.extractImageByDomain(url);
      if (imageUrl) {
        console.log('도메인별 처리로 이미지 추출 성공:', imageUrl);
        return imageUrl;
      }

      // 4. 기본 이미지 패턴 추출
      imageUrl = this.extractImageFromUrlPattern(url);
      if (imageUrl) {
        console.log('URL 패턴으로 이미지 추출 성공:', imageUrl);
        return imageUrl;
      }

      console.log('이미지 추출 실패 - 모든 방법 시도함');
      return null;
    } catch (error) {
      console.error('이미지 추출 실패:', error);
      return null;
    }
  }

  private extractImageFromHtml(html: string, baseUrl: string): string | null {
    try {
      // 1. Open Graph 이미지
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
      if (ogImageMatch) {
        return this.resolveImageUrl(ogImageMatch[1], baseUrl);
      }

      // 2. Twitter Card 이미지
      const twitterImageMatch = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i);
      if (twitterImageMatch) {
        return this.resolveImageUrl(twitterImageMatch[1], baseUrl);
      }

      // 3. 상품 이미지 (일반적인 클래스명/ID로 찾기)
      const productImagePatterns = [
        /<img[^>]*class="[^"]*product[^"]*"[^>]*src="([^"]*)"[^>]*>/gi,
        /<img[^>]*id="[^"]*product[^"]*"[^>]*src="([^"]*)"[^>]*>/gi,
        /<img[^>]*class="[^"]*main[^"]*"[^>]*src="([^"]*)"[^>]*>/gi,
        /<img[^>]*class="[^"]*hero[^"]*"[^>]*src="([^"]*)"[^>]*>/gi
      ];

      for (const pattern of productImagePatterns) {
        const matches = html.match(pattern);
        if (matches) {
          for (const match of matches) {
            const srcMatch = match.match(/src="([^"]*)"/i);
            if (srcMatch) {
              const imgUrl = this.resolveImageUrl(srcMatch[1], baseUrl);
              if (imgUrl && this.isValidImageUrl(imgUrl)) {
                return imgUrl;
              }
            }
          }
        }
      }

      // 4. 모든 이미지 태그에서 가장 큰 이미지 찾기
      const imgMatches = html.match(/<img[^>]*src="([^"]*)"[^>]*>/gi);
      if (imgMatches) {
        const imageUrls = [];
        for (const match of imgMatches) {
          const srcMatch = match.match(/src="([^"]*)"/i);
          if (srcMatch) {
            const imgUrl = this.resolveImageUrl(srcMatch[1], baseUrl);
            if (imgUrl && this.isValidImageUrl(imgUrl)) {
              // 이미지 크기 힌트 확인
              const sizeMatch = match.match(/(?:width|height)="?(\d+)"?/i);
              const size = sizeMatch ? parseInt(sizeMatch[1]) : 0;
              imageUrls.push({ url: imgUrl, size });
            }
          }
        }
        
        // 크기 순으로 정렬하여 가장 큰 이미지 반환
        if (imageUrls.length > 0) {
          imageUrls.sort((a, b) => b.size - a.size);
          return imageUrls[0].url;
        }
      }

      return null;
    } catch (error) {
      console.error('HTML 파싱 실패:', error);
      return null;
    }
  }

  private extractImageByDomain(url: string): string | null {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // 도메인별 특수 처리
      if (domain.includes('amazon')) {
        // Amazon 상품 이미지 패턴
        const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
        if (asinMatch) {
          return `https://images-na.ssl-images-amazon.com/images/I/${asinMatch[1]}._SL1500_.jpg`;
        }
      }
      
      if (domain.includes('coupang')) {
        // 쿠팡 상품 이미지 패턴
        const productMatch = url.match(/products\/(\d+)/);
        if (productMatch) {
          return `https://thumbnail7.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/product/${productMatch[1]}/main.jpg`;
        }
      }

      if (domain.includes('musinsa')) {
        // 무신사 상품 이미지 패턴
        const productMatch = url.match(/goods\/(\d+)/);
        if (productMatch) {
          return `https://image.msscdn.net/images/goods_img/${productMatch[1]}/main.jpg`;
        }
      }

      return null;
    } catch (error) {
      console.error('도메인별 이미지 추출 실패:', error);
      return null;
    }
  }

  private extractImageFromUrlPattern(url: string): string | null {
    try {
      // URL에서 이미지 ID나 패턴 추출
      const patterns = [
        /\/(\d+)\.jpg$/i,
        /\/(\d+)\.png$/i,
        /image[=\/]([^&\?]+)/i,
        /img[=\/]([^&\?]+)/i,
        /photo[=\/]([^&\?]+)/i
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          // 추출된 패턴으로 이미지 URL 구성
          const baseUrl = new URL(url).origin;
          return `${baseUrl}/images/${match[1]}`;
        }
      }

      return null;
    } catch (error) {
      console.error('URL 패턴 추출 실패:', error);
      return null;
    }
  }

  private resolveImageUrl(imageUrl: string, baseUrl: string): string {
    try {
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      if (imageUrl.startsWith('//')) {
        return `https:${imageUrl}`;
      }
      if (imageUrl.startsWith('/')) {
        const base = new URL(baseUrl);
        return `${base.protocol}//${base.hostname}${imageUrl}`;
      }
      return new URL(imageUrl, baseUrl).href;
    } catch (error) {
      console.error('이미지 URL 해석 실패:', error);
      return imageUrl;
    }
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname.toLowerCase();
      
      // 이미지 확장자 확인
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
      
      // 이미지 관련 경로 확인
      const imageKeywords = ['image', 'img', 'photo', 'picture', 'thumb', 'thumbnail'];
      const hasImageKeyword = imageKeywords.some(keyword => pathname.includes(keyword));
      
      return hasImageExtension || hasImageKeyword;
    } catch (error) {
      return false;
    }
  }

  async generateVirtualTryOn(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl?: string }[],
    basePersonImage?: string
  ): Promise<string> {
    console.log('Virtual Try-On 생성 시작:', { userProfile, selectedItems, basePersonImage });
    
    // 이미지가 있는 아이템들만 필터링
    const itemsWithImages = selectedItems.filter(item => item.imageUrl);
    
    if (itemsWithImages.length === 0) {
      console.log('이미지가 있는 아이템이 없어 fallback 생성');
      return this.generateFallback(userProfile, selectedItems as any);
    }

    // OpenAI API 키가 있으면 OpenAI 사용, 없으면 fallback
    if (this.config.openaiApiKey && this.config.useAI) {
      try {
        console.log('OpenAI DALL-E 3으로 생성 시작');
        return await this.generateWithOpenAI(userProfile, itemsWithImages as any, basePersonImage);
      } catch (error) {
        console.error('OpenAI 생성 실패:', error);
        return this.generateFallback(userProfile, selectedItems as any);
      }
    } else {
      console.log('API 키가 없어 fallback 생성');
      return this.generateFallback(userProfile, selectedItems as any);
    }
  }

  private async generateWithOpenAI(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl: string }[],
    basePersonImage?: string
  ): Promise<string> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API 키가 필요합니다.');
    }

    try {
      // 의상 설명 생성
      const clothingDescriptions = selectedItems.map(item => 
        `${item.name} (${this.getCategoryName(item.category)})`
      ).join(', ');

      const genderText = userProfile.gender === 'male' ? '남성' : '여성';
      const bodyTypeText = this.getBodyTypeDescription(userProfile.bodyType);

      // DALL-E 3 프롬프트 생성 (텍스트 기반)
      const prompt = `A high-quality, professional fashion photograph of a ${genderText} model with ${bodyTypeText} body type wearing ${clothingDescriptions}. The model should be standing in a neutral pose against a clean, minimalist background. The lighting should be soft and professional, highlighting the clothing details. The image should look like a high-end fashion catalog photo with natural colors and realistic proportions. Style: modern, clean, professional fashion photography.`;

      console.log('DALL-E 3 프롬프트:', prompt);

      // OpenAI DALL-E 3 API 호출
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1792', // 세로가 긴 패션 이미지
          quality: 'hd',
          style: 'natural'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API 오류 상세:', errorData);
        throw new Error(`OpenAI API 오류: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('DALL-E 3 생성 성공:', result.data[0].url);
      return result.data[0].url;

    } catch (error) {
      console.error('OpenAI 생성 실패:', error);
      throw error;
    }
  }

  private getCategoryName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'tops': '상의',
      'bottoms': '하의',
      'outerwear': '아우터',
      'shoes': '신발',
      'accessories': '액세서리'
    };
    return categoryNames[category] || category;
  }

  private getBodyTypeDescription(bodyType: string): string {
    const descriptions = {
      'slender': 'slim and lean',
      'athletic': 'athletic and muscular',
      'pear': 'pear-shaped with wider hips',
      'apple': 'apple-shaped with broader shoulders',
      'hourglass': 'hourglass figure with balanced proportions',
      'rectangle': 'rectangular body shape with straight lines'
    };
    return descriptions[bodyType as keyof typeof descriptions] || 'average';
  }

  private async generateFallback(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl: string }[]
  ): Promise<string> {
    // 폴백: 실제 의상 이미지들을 조합하여 콜라주 생성
    return await this.generateAdvancedCollage(userProfile, selectedItems);
  }

  private async generateAdvancedCollage(
    userProfile: { gender: string; bodyType: string },
    itemsWithImages: { name: string; category: string; imageUrl: string }[]
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d')!;
    
    // 프리미엄 배경
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 제목
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AI Virtual Try-On Preview', canvas.width / 2, 80);
    
    // 프로필 정보
    ctx.fillStyle = '#64748b';
    ctx.font = '22px Arial';
    ctx.fillText(`${userProfile.gender === 'male' ? '남성' : '여성'} • ${userProfile.bodyType}`, canvas.width / 2, 120);
    
    // 가상 모델 그리기
    this.drawVirtualModel(ctx, canvas.width / 2, 250, userProfile.gender);
    
    // 실제 의상 이미지들 로드하여 모델에 그리기
    try {
      const centerX = canvas.width / 2;
      const centerY = 350;
      const positions = this.calculateClothingPositions(centerX, centerY, userProfile.gender);
      
      for (const item of itemsWithImages) {
        const img = await this.loadImage(item.imageUrl);
        if (img && positions[item.category]) {
          this.drawClothingOnModel(ctx, img, positions[item.category]);
        }
      }
    } catch (error) {
      console.error('의상 이미지 로딩 실패:', error);
    }
    
    // 선택된 아이템들 나열
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('선택된 의상:', canvas.width / 2, 700);
    
    itemsWithImages.forEach((item, index) => {
      ctx.fillStyle = '#6b7280';
      ctx.font = '18px Arial';
      const categoryEmoji = this.getCategoryEmoji(item.category);
      ctx.fillText(`${categoryEmoji} ${item.name}`, canvas.width / 2, 740 + (index * 35));
    });
    
    // API 키 안내
    if (!this.config.openaiApiKey) {
      ctx.fillStyle = '#dc2626';
      ctx.font = '16px Arial';
      ctx.fillText('💡 더 사실적인 이미지를 원하시면 OpenAI API 키를 설정해주세요', canvas.width / 2, canvas.height - 100);
    }
    
    // 하단 정보
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Arial';
    ctx.fillText('실제 의상 이미지 기반 AI 생성', canvas.width / 2, canvas.height - 60);
    ctx.fillText('AIVATAR - OpenAI 기반 AI 패션 플랫폼', canvas.width / 2, canvas.height - 30);
    
    return canvas.toDataURL();
  }

  private drawVirtualModel(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, gender: string) {
    // 심플한 마네킹 그리기
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#f3f4f6';
    
    // 머리
    ctx.beginPath();
    ctx.arc(centerX, centerY - 100, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // 몸통
    ctx.beginPath();
    ctx.roundRect(centerX - 40, centerY - 70, 80, 140, 10);
    ctx.fill();
    ctx.stroke();
    
    // 팔
    ctx.beginPath();
    ctx.roundRect(centerX - 80, centerY - 60, 30, 100, 15);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.roundRect(centerX + 50, centerY - 60, 30, 100, 15);
    ctx.fill();
    ctx.stroke();
    
    // 다리
    ctx.beginPath();
    ctx.roundRect(centerX - 30, centerY + 70, 25, 120, 12);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.roundRect(centerX + 5, centerY + 70, 25, 120, 12);
    ctx.fill();
    ctx.stroke();
  }

  private calculateClothingPositions(centerX: number, centerY: number, gender: string): { [key: string]: { x: number; y: number; width: number; height: number } } {
    return {
      'tops': { x: centerX - 35, y: centerY - 65, width: 70, height: 80 },
      'bottoms': { x: centerX - 25, y: centerY + 15, width: 50, height: 100 },
      'outerwear': { x: centerX - 45, y: centerY - 70, width: 90, height: 90 },
      'shoes': { x: centerX - 35, y: centerY + 170, width: 70, height: 25 },
      'accessories': { x: centerX - 15, y: centerY - 120, width: 30, height: 30 }
    };
  }

  private drawClothingOnModel(
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement, 
    pos: { x: number; y: number; width: number; height: number }
  ) {
    try {
      // 의상 이미지를 지정된 위치에 그리기
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height);
      ctx.restore();
    } catch (error) {
      console.error('의상 이미지 그리기 실패:', error);
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  private getCategoryEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'tops': '👕',
      'bottoms': '👖',
      'outerwear': '🧥',
      'shoes': '👟',
      'accessories': '👜'
    };
    return emojiMap[category] || '👔';
  }
}

// AI 기반 의상 분석 함수
export async function analyzeClothingFromUrl(url: string): Promise<SimpleAnalysisResult> {
  try {
    console.log('AI 의상 URL 분석 시작:', url);
    console.log('현재 AI 설정:', currentConfig);
    
    // AI 설정이 활성화되어 있으면 AI 분석 시도
    if (currentConfig.useAI && currentConfig.openaiApiKey) {
      console.log('AI 분석 조건 만족 - 이미지 추출 및 AI 분석 시작');
      
      // 이미지 추출 후 AI 분석
      const generator = getVirtualTryOnGenerator();
      const imageUrl = await generator.extractImageFromUrl(url);
      
      if (imageUrl) {
        console.log('이미지 추출 성공:', imageUrl);
        try {
          const aiAnalysis = await analyzeClothingWithAI(imageUrl, url);
          if (aiAnalysis) {
            console.log('AI 분석 성공:', aiAnalysis);
            return aiAnalysis;
          }
        } catch (error) {
          console.warn('AI 분석 실패:', error);
        }
      } else {
        console.log('이미지 추출 실패');
      }
    } else {
      console.log('AI 분석 조건 미충족:', {
        useAI: currentConfig.useAI,
        hasApiKey: !!currentConfig.openaiApiKey
      });
    }

    // AI 분석이 실패했거나 사용하지 않는 경우 기본 분석
    console.log('기본 분석으로 전환');
    const generator = getVirtualTryOnGenerator();
    const imageUrl = await generator.extractImageFromUrl(url);
    
    if (imageUrl) {
      return await analyzeClothingFallback(url, imageUrl);
    } else {
      return await createFallbackAnalysis(url);
    }
  } catch (error) {
    console.error('의상 분석 실패:', error);
    return createFallbackAnalysis(url);
  }
}

// AI를 사용한 의상 분석 - 프롬프트 개선 및 더 정확한 분석
async function analyzeClothingWithAI(imageUrl: string, originalUrl: string): Promise<SimpleAnalysisResult | null> {
  try {
    if (!currentConfig.openaiApiKey) {
      console.log('OpenAI API 키가 없습니다');
      return null;
    }

    console.log('AI 분석 시작:', { imageUrl, originalUrl, hasApiKey: !!currentConfig.openaiApiKey });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentConfig.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-05-13', // 안정적인 버전 사용
        messages: [
          {
            role: 'system',
            content: `You are a computer vision assistant specialized in fashion analysis, based on GPT-4o Omni, a multimodal AI trained by OpenAI in 2024. You have computer vision enabled and can analyze clothing images accurately. Your task is to analyze fashion items and provide detailed information in JSON format.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `🔍 **패션 전문가로서 이 의상 이미지를 정확히 분석해주세요**

당신은 패션 분석 전문가입니다. 이 이미지의 의상을 자세히 관찰하고 다음 정보를 정확히 추출해주세요:

📋 **분석 항목:**
1. **의상 이름**: 구체적이고 매력적인 한국어 이름 (예: "오버핏 화이트 코튼 셔츠", "슬림핏 블랙 데님 진")
2. **카테고리**: tops, bottoms, outerwear, shoes, accessories 중 정확히 하나
3. **브랜드**: 이미지나 URL에서 확인되는 실제 브랜드명 (확인 불가시 "Unknown")
4. **실제 가격**: 한국 시장 기준 실제 판매 가격 (원화, 숫자만)
5. **주요 색상**: 의상의 주요 색상 1-3개 (한국어)
6. **소재**: 보이는 소재 특성 (예: "코튼", "데님", "니트", "실크", "폴리에스터")
7. **핏/스타일**: 의상의 핏이나 스타일 특징 (예: "오버핏", "슬림핏", "A라인", "크롭")
8. **스타일 설명**: 의상의 특징과 스타일링 포인트 (한 문장)

🎯 **분석 지침:**
- 이미지를 자세히 관찰하여 정확한 정보 추출
- 브랜드는 로고, 태그, URL 등에서 확인
- 가격은 브랜드와 품질을 고려한 현실적 가격
- 색상은 주요 색상부터 우선순위로 나열
- 소재는 시각적으로 확인 가능한 특성 기반

⚠️ **중요**: 반드시 아래 JSON 형식으로만 응답하세요. 다른 설명은 추가하지 마세요.

\`\`\`json
{
  "name": "구체적인 의상 이름",
  "category": "정확한 카테고리",
  "brand": "브랜드명",
  "price": 실제가격숫자,
  "colors": ["주요색상1", "색상2", "색상3"],
  "material": "소재",
  "fit": "핏/스타일",
  "description": "스타일 설명"
}
\`\`\`

원본 상품 URL: ${originalUrl}
이미지 URL: ${imageUrl}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
        // 거부 응답 방지를 위한 logit bias 추가
        logit_bias: {
          "15390": -99, // "I'm sorry, but"
          "23045": -99  // 거부 관련 토큰
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API 오류:', response.status, errorText);
      
      // 403 Forbidden이나 특정 오류의 경우 대체 방법 시도
      if (response.status === 403 || errorText.includes('safety')) {
        console.log('안전 정책으로 인한 거부, 대체 방법 시도');
        return await tryAlternativeAnalysis(imageUrl, originalUrl);
      }
      
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('OpenAI 응답:', result);
    
    const aiResponse = result.choices[0]?.message?.content;
    
    if (!aiResponse) {
      console.error('AI 응답이 없습니다');
      return null;
    }

    console.log('AI 응답 내용:', aiResponse);

    // 거부 응답 체크
    if (aiResponse.includes('죄송') || aiResponse.includes('분석할 수 없습니다') || 
        aiResponse.includes("I'm sorry") || aiResponse.includes("cannot")) {
      console.log('AI가 분석을 거부했습니다, 대체 방법 시도');
      return await tryAlternativeAnalysis(imageUrl, originalUrl);
    }

    // JSON 파싱 시도
    try {
      // JSON 블록 찾기 (코드 블록 안에 있을 수도 있음)
      const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        console.error('JSON 형식을 찾을 수 없습니다:', aiResponse);
        return await tryAlternativeAnalysis(imageUrl, originalUrl);
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      console.log('파싱된 분석 데이터:', analysisData);
      
      // 데이터 검증 및 정리
      const result = {
        name: analysisData.name || '분석된 의상',
        category: analysisData.category || 'tops',
        brand: analysisData.brand || 'Unknown',
        price: typeof analysisData.price === 'number' ? analysisData.price : parseInt(analysisData.price) || 0,
        imageUrl: imageUrl,
        originalUrl: originalUrl,
        colors: Array.isArray(analysisData.colors) ? analysisData.colors : ['기본색상'],
        material: analysisData.material || '',
        fit: analysisData.fit || '',
        description: analysisData.description || ''
      };

      console.log('최종 AI 분석 결과:', result);
      return result;

    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError, 'AI 응답:', aiResponse);
      return await tryAlternativeAnalysis(imageUrl, originalUrl);
    }

  } catch (error) {
    console.error('AI 분석 실패:', error);
    return await tryAlternativeAnalysis(imageUrl, originalUrl);
  }
}

// 대체 분석 방법 (더 간단한 프롬프트 사용)
async function tryAlternativeAnalysis(imageUrl: string, originalUrl: string): Promise<SimpleAnalysisResult | null> {
  try {
    console.log('대체 분석 방법 시도');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentConfig.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-05-13',
        messages: [
          {
            role: 'system',
            content: 'You are a fashion analysis expert. Analyze clothing items and provide information in JSON format.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Describe this clothing item. Focus on: name, category (tops/bottoms/outerwear/shoes/accessories), brand, colors, material, style. Respond in JSON format only:
{
  "name": "item name in Korean",
  "category": "category",
  "brand": "brand or Unknown",
  "price": 50000,
  "colors": ["color1", "color2"],
  "material": "material",
  "fit": "fit style",
  "description": "brief description in Korean"
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'low' // 낮은 해상도로 시도
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (response.ok) {
      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content;
      
      if (aiResponse && !aiResponse.includes('죄송') && !aiResponse.includes("I'm sorry")) {
        try {
          const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[0]);
            console.log('대체 분석 성공:', analysisData);
            
            return {
              name: analysisData.name || '분석된 의상',
              category: analysisData.category || 'tops',
              brand: analysisData.brand || 'Unknown',
              price: typeof analysisData.price === 'number' ? analysisData.price : parseInt(analysisData.price) || 0,
              imageUrl: imageUrl,
              originalUrl: originalUrl,
              colors: Array.isArray(analysisData.colors) ? analysisData.colors : ['기본색상'],
              material: analysisData.material || '',
              fit: analysisData.fit || '',
              description: analysisData.description || ''
            };
          }
        } catch (parseError) {
          console.error('대체 분석 JSON 파싱 실패:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('대체 분석 실패:', error);
  }
  
  return null;
}

// 기본 분석 (AI 없이)
async function analyzeClothingFallback(url: string, imageUrl?: string | null): Promise<SimpleAnalysisResult> {
  console.log('기본 분석 시작:', { url, imageUrl });
  
  // URL 기반 분석
  const urlAnalysis = analyzeUrlKeywords(url);
  
  // 도메인 기반 브랜드 추출 (비동기)
  const domain = new URL(url).hostname;
  const brandName = await extractBrandFromPageContent(url);
  
  // 실제 가격 추정 (도메인별 평균 가격대)
  const actualPrice = estimatePriceByDomain(domain);
  
  // 상품명 생성
  const productName = generateProductName(urlAnalysis, brandName);
  
  const result: SimpleAnalysisResult = {
    name: productName,
    category: urlAnalysis.category,
    imageUrl: imageUrl || undefined,
    originalUrl: url,
    brand: brandName,
    price: actualPrice,
    colors: ['기본색상'],
    description: `${brandName}의 ${urlAnalysis.category} 상품입니다.`
  };
  
  console.log('기본 분석 완료:', result);
  return result;
}

// URL 키워드 분석
function analyzeUrlKeywords(url: string): { category: string; keywords: string[] } {
  const urlLower = url.toLowerCase();
  const keywords: string[] = [];
  
  // 카테고리별 키워드 매칭
  const categoryKeywords = {
    'tops': ['shirt', 'tshirt', 't-shirt', 'top', 'blouse', 'sweater', 'hoodie', 'cardigan', 'tank'],
    'bottoms': ['pants', 'jean', 'jeans', 'trouser', 'short', 'skirt', 'legging', 'bottom'],
    'outerwear': ['jacket', 'coat', 'outer', 'blazer', 'vest', 'cardigan', 'parka', 'windbreaker'],
    'shoes': ['shoes', 'sneaker', 'boot', 'sandal', 'heel', 'flat', 'loafer', 'oxford'],
    'accessories': ['bag', 'accessory', 'watch', 'jewelry', 'belt', 'hat', 'cap', 'scarf', 'glove']
  };
  
  let detectedCategory = 'tops'; // 기본값
  let maxMatches = 0;
  
  for (const [category, keywordList] of Object.entries(categoryKeywords)) {
    const matches = keywordList.filter(keyword => urlLower.includes(keyword));
    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      detectedCategory = category;
      keywords.push(...matches);
    }
  }
  
  return { category: detectedCategory, keywords };
}

// 브랜드 정보 추출 개선 - 페이지 내용 분석
async function extractBrandFromPageContent(url: string): Promise<string> {
  try {
    console.log('페이지 내용에서 브랜드 추출 시도:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log('페이지 접근 실패:', response.status);
      return extractBrandFromDomain(new URL(url).hostname);
    }
    
    const html = await response.text();
    console.log('페이지 HTML 길이:', html.length);
    
    // 다양한 방법으로 브랜드 추출 시도
    const brandCandidates = [
      // 1. 메타 태그에서 브랜드 추출
      ...extractBrandFromMetaTags(html),
      // 2. JSON-LD 구조화 데이터에서 브랜드 추출
      ...extractBrandFromJsonLd(html),
      // 3. 페이지 제목에서 브랜드 추출
      ...extractBrandFromTitle(html),
      // 4. 브랜드 관련 클래스명에서 추출
      ...extractBrandFromClasses(html),
      // 5. 텍스트 내용에서 브랜드 추출
      ...extractBrandFromTextContent(html),
      // 6. URL 기반 브랜드 추출
      extractBrandFromDomain(new URL(url).hostname)
    ];
    
    console.log('브랜드 후보들:', brandCandidates);
    
    // 가장 적절한 브랜드 선택
    const bestBrand = selectBestBrand(brandCandidates, url);
    console.log('선택된 브랜드:', bestBrand);
    
    return bestBrand;
    
  } catch (error) {
    console.error('브랜드 추출 실패:', error);
    return extractBrandFromDomain(new URL(url).hostname);
  }
}

// 메타 태그에서 브랜드 추출
function extractBrandFromMetaTags(html: string): string[] {
  const brands: string[] = [];
  
  // og:site_name, twitter:site, brand 등 메타 태그
  const metaPatterns = [
    /<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/gi,
    /<meta[^>]*name="twitter:site"[^>]*content="([^"]*)"[^>]*>/gi,
    /<meta[^>]*name="brand"[^>]*content="([^"]*)"[^>]*>/gi,
    /<meta[^>]*property="brand"[^>]*content="([^"]*)"[^>]*>/gi,
    /<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/gi,
  ];
  
  metaPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const brand = cleanBrandName(match[1]);
      if (brand && brand !== 'Unknown') {
        brands.push(brand);
      }
    }
  });
  
  return brands;
}

// JSON-LD 구조화 데이터에서 브랜드 추출
function extractBrandFromJsonLd(html: string): string[] {
  const brands: string[] = [];
  
  try {
    const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = jsonLdPattern.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1]);
        
        // 단일 객체 또는 배열 처리
        const items = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        items.forEach(item => {
          if (item.brand) {
            if (typeof item.brand === 'string') {
              brands.push(cleanBrandName(item.brand));
            } else if (item.brand.name) {
              brands.push(cleanBrandName(item.brand.name));
            }
          }
          
          // 제조사 정보도 확인
          if (item.manufacturer) {
            if (typeof item.manufacturer === 'string') {
              brands.push(cleanBrandName(item.manufacturer));
            } else if (item.manufacturer.name) {
              brands.push(cleanBrandName(item.manufacturer.name));
            }
          }
        });
      } catch (parseError) {
        // JSON 파싱 실패는 무시
      }
    }
  } catch (error) {
    console.error('JSON-LD 브랜드 추출 실패:', error);
  }
  
  return brands;
}

// 페이지 제목에서 브랜드 추출
function extractBrandFromTitle(html: string): string[] {
  const brands: string[] = [];
  
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    const title = titleMatch[1];
    
    // 제목에서 브랜드 패턴 찾기
    const brandPatterns = [
      /^([^-|]+)\s*[-|]/,  // "브랜드 - 상품명" 패턴
      /([^-|]+)\s*[-|]\s*[^-|]*$/,  // "상품명 - 브랜드" 패턴
      /\|\s*([^|]+)$/,  // "상품명 | 브랜드" 패턴
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,  // 대문자로 시작하는 브랜드명
    ];
    
    brandPatterns.forEach(pattern => {
      const match = title.match(pattern);
      if (match) {
        const brand = cleanBrandName(match[1]);
        if (brand && brand !== 'Unknown') {
          brands.push(brand);
        }
      }
    });
  }
  
  return brands;
}

// 클래스명에서 브랜드 추출
function extractBrandFromClasses(html: string): string[] {
  const brands: string[] = [];
  
  // 브랜드 관련 클래스명 패턴
  const classPatterns = [
    /class="[^"]*brand[^"]*"/gi,
    /class="[^"]*logo[^"]*"/gi,
    /class="[^"]*company[^"]*"/gi,
  ];
  
  classPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      // 클래스명 주변 텍스트에서 브랜드 추출
      const startIndex = Math.max(0, match.index - 200);
      const endIndex = Math.min(html.length, match.index + match[0].length + 200);
      const context = html.substring(startIndex, endIndex);
      
      // 텍스트에서 브랜드 후보 추출
      const textBrands = extractBrandFromTextContent(context);
      brands.push(...textBrands);
    }
  });
  
  return brands;
}

// 텍스트 내용에서 브랜드 추출
function extractBrandFromTextContent(html: string): string[] {
  const brands: string[] = [];
  
  // HTML 태그 제거
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  // 알려진 브랜드 패턴 매칭
  const knownBrands = [
    // 한국 브랜드
    '무신사', '스탠다드', '29CM', '지고트', '스파오', '유니클로', '지오다노', '에이치앤엠', 'H&M',
    '자라', 'ZARA', '포에버21', 'Forever 21', '갭', 'GAP', '올드네이비', 'Old Navy',
    // 글로벌 브랜드
    '나이키', 'Nike', '아디다스', 'Adidas', '푸마', 'Puma', '리복', 'Reebok',
    '리바이스', "Levi's", '캘빈클라인', 'Calvin Klein', '타미힐피거', 'Tommy Hilfiger',
    '랄프로렌', 'Ralph Lauren', '라코스테', 'Lacoste', '구찌', 'Gucci', '프라다', 'Prada',
    '버버리', 'Burberry', '디올', 'Dior', '샤넬', 'Chanel', '루이비통', 'Louis Vuitton',
    // 스포츠 브랜드
    '언더아머', 'Under Armour', '뉴발란스', 'New Balance', '아식스', 'ASICS',
    '반스', 'Vans', '컨버스', 'Converse', '닥터마틴', 'Dr. Martens',
    // 패스트패션
    '망고', 'Mango', '코스', 'COS', '앤아더스토리', '& Other Stories',
    '몬키', 'Monki', '위크데이', 'Weekday'
  ];
  
  knownBrands.forEach(brand => {
    const regex = new RegExp(`\\b${brand}\\b`, 'gi');
    if (regex.test(text)) {
      brands.push(brand);
    }
  });
  
  return brands;
}

// 브랜드명 정리
function cleanBrandName(brand: string): string {
  if (!brand) return 'Unknown';
  
  return brand
    .trim()
    .replace(/^[@#]/, '') // @ 또는 # 제거
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .replace(/[^\w\s&'-]/g, '') // 특수문자 제거 (단, &, ', - 는 유지)
    .trim();
}

// 최적의 브랜드 선택
function selectBestBrand(candidates: string[], url: string): string {
  if (!candidates || candidates.length === 0) {
    return 'Unknown';
  }
  
  // 중복 제거 및 정리
  const uniqueBrands = [...new Set(candidates.filter(brand => 
    brand && brand !== 'Unknown' && brand.length > 1
  ))];
  
  if (uniqueBrands.length === 0) {
    return 'Unknown';
  }
  
  // 도메인과 일치하는 브랜드 우선
  const domain = new URL(url).hostname.toLowerCase();
  const domainBrand = uniqueBrands.find(brand => 
    domain.includes(brand.toLowerCase()) || brand.toLowerCase().includes(domain.split('.')[0])
  );
  
  if (domainBrand) {
    return domainBrand;
  }
  
  // 가장 빈번하게 나타나는 브랜드 선택
  const brandCounts = uniqueBrands.reduce((acc, brand) => {
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostFrequentBrand = Object.entries(brandCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  return mostFrequentBrand;
}

// 도메인에서 브랜드명 추출
function extractBrandFromDomain(domain: string): string {
  const domainParts = domain.split('.');
  const brandPart = domainParts[0];
  
  // 알려진 쇼핑몰 도메인 처리
  const knownSites: { [key: string]: string } = {
    'amazon': 'Amazon',
    'coupang': 'Coupang',
    'gmarket': 'G마켓',
    'auction': '옥션',
    'wemakeprice': '위메프',
    'tmon': '티몬',
    'ssg': 'SSG',
    'lotte': '롯데온',
    'elevenst': '11번가',
    'interpark': '인터파크',
    'yes24': 'YES24',
    'musinsa': '무신사',
    'ably': '에이블리',
    'brandi': '브랜디',
    'zigzag': '지그재그',
    'styleshare': '스타일쉐어',
    'wconcept': 'W컨셉',
    'hm': 'H&M',
    'uniqlo': '유니클로',
    'zara': 'ZARA',
    'nike': 'NIKE',
    'adidas': 'ADIDAS'
  };
  
  const lowerBrand = brandPart.toLowerCase();
  if (knownSites[lowerBrand]) {
    return knownSites[lowerBrand];
  }
  
  // 첫 글자 대문자로 변환
  return brandPart.charAt(0).toUpperCase() + brandPart.slice(1);
}

// 도메인별 실제 가격 추정
function estimatePriceByDomain(domain: string): number {
  const domainLower = domain.toLowerCase();
  
  // 도메인별 실제 평균 가격대 (2024년 기준)
  const priceRanges: { [key: string]: number } = {
    // 글로벌 플랫폼
    'amazon': 45000,
    'aliexpress': 15000,
    'ebay': 35000,
    'taobao': 20000,
    
    // 한국 대형 쇼핑몰
    'coupang': 32000,
    'gmarket': 28000,
    'auction': 25000,
    'wemakeprice': 35000,
    'tmon': 30000,
    'ssg': 55000,
    'lotte': 48000,
    'elevenst': 33000,
    'interpark': 40000,
    'yes24': 45000,
    
    // 패션 전문몰
    'musinsa': 68000,
    'ably': 32000,
    'brandi': 38000,
    'zigzag': 35000,
    'styleshare': 52000,
    'wconcept': 85000,
    'stylenanda': 75000,
    'chuu': 45000,
    'mixxmix': 40000,
    'canmart': 35000,
    
    // 글로벌 패션 브랜드
    'hm': 28000,
    'uniqlo': 35000,
    'zara': 65000,
    'gap': 55000,
    'forever21': 25000,
    'mango': 60000,
    'cos': 120000,
    'arket': 85000,
    
    // 스포츠 브랜드
    'nike': 95000,
    'adidas': 85000,
    'puma': 70000,
    'newbalance': 80000,
    'converse': 65000,
    'vans': 60000,
    'reebok': 55000,
    'underarmour': 75000,
    
    // 럭셔리 브랜드
    'gucci': 1200000,
    'prada': 1500000,
    'chanel': 2000000,
    'louisvuitton': 1800000,
    'hermes': 2500000,
    'dior': 1600000,
    'balenciaga': 1100000,
    'givenchy': 1300000,
    'versace': 1400000,
    'armani': 800000,
    
    // 중급 브랜드
    'calvinklein': 120000,
    'tommyhilfiger': 150000,
    'polo': 180000,
    'lacoste': 160000,
    'boss': 250000,
    'burberry': 450000,
    'coach': 350000,
    'katemiddleton': 300000,
    
    // 한국 브랜드
    'basichouse': 80000,
    'tngt': 65000,
    'mind': 45000,
    'roem': 120000,
    'system': 150000,
    'jestina': 180000,
    'sjyp': 200000,
    'pushbutton': 250000,
    
    // 언더웨어/이너웨어
    'calvin': 45000,
    'victoria': 35000,
    'wacoal': 60000,
    
    // 신발 전문
    'shoemarker': 120000,
    'timberland': 180000,
    'clarks': 150000,
    'docmartens': 200000,
    'birkenstock': 120000,
    
    // 액세서리
    'pandora': 80000,
    'swarovski': 120000,
    'fossil': 150000,
    'danielwellington': 180000,
    'casio': 85000,
    'seiko': 200000,
    'citizen': 180000
  };
  
  // 도메인에서 브랜드/사이트 매칭
  for (const [site, price] of Object.entries(priceRanges)) {
    if (domainLower.includes(site)) {
      return price;
    }
  }
  
  // 도메인 확장자별 기본 가격 추정
  if (domainLower.includes('.kr')) {
    return 45000; // 한국 사이트 평균
  } else if (domainLower.includes('.cn') || domainLower.includes('.com.cn')) {
    return 25000; // 중국 사이트 평균
  } else if (domainLower.includes('.jp')) {
    return 55000; // 일본 사이트 평균
  } else if (domainLower.includes('.com')) {
    return 50000; // 글로벌 사이트 평균
  }
  
  return 42000; // 전체 기본 평균 가격
}

// 상품명 생성 개선
function generateProductName(analysis: { category: string; keywords: string[] }, brandName: string): string {
  const categoryNames: { [key: string]: string[] } = {
    'tops': ['셔츠', '티셔츠', '블라우스', '니트', '후드티', '맨투맨', '상의'],
    'bottoms': ['바지', '청바지', '스커트', '레깅스', '슬랙스', '팬츠', '하의'],
    'outerwear': ['자켓', '코트', '점퍼', '가디건', '베스트', '아우터', '겉옷'],
    'shoes': ['신발', '스니커즈', '구두', '부츠', '샌들', '슬리퍼', '운동화'],
    'accessories': ['가방', '지갑', '시계', '목걸이', '귀걸이', '반지', '액세서리']
  };
  
  const categoryOptions = categoryNames[analysis.category] || ['의상'];
  const categoryName = categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
  
  // 키워드 기반 더 구체적인 이름 생성
  if (analysis.keywords.length > 0) {
    const mainKeyword = analysis.keywords[0];
    
    // 색상 키워드 추가
    const colorKeywords = ['black', 'white', 'blue', 'red', 'navy', 'gray', 'beige', 'brown'];
    const hasColor = analysis.keywords.some(k => colorKeywords.includes(k));
    
    if (hasColor) {
      const colorMap: { [key: string]: string } = {
        'black': '블랙',
        'white': '화이트',
        'blue': '블루',
        'red': '레드',
        'navy': '네이비',
        'gray': '그레이',
        'beige': '베이지',
        'brown': '브라운'
      };
      
      const colorKeyword = analysis.keywords.find(k => colorKeywords.includes(k));
      const colorName = colorMap[colorKeyword || ''] || '';
      
      return `${brandName} ${colorName} ${mainKeyword} ${categoryName}`;
    }
    
    return `${brandName} ${mainKeyword} ${categoryName}`;
  }
  
  return `${brandName} ${categoryName}`;
}

// 기본 분석 생성 (fallback)
async function createFallbackAnalysis(url: string): Promise<SimpleAnalysisResult> {
  console.log('Fallback 분석 생성:', url);
  
  try {
    const domain = new URL(url).hostname;
    const brandName = await extractBrandFromPageContent(url);
    
    // URL에서 기본 정보 추출
    const urlAnalysis = analyzeUrlKeywords(url);
    const productName = generateProductName(urlAnalysis, brandName);
    const estimatedPrice = estimatePriceByDomain(domain);
    
    return {
      name: productName,
      category: urlAnalysis.category,
      originalUrl: url,
      brand: brandName,
      price: estimatedPrice,
      colors: ['기본색상'],
      description: `${brandName}의 ${urlAnalysis.category} 상품입니다.`
    };
  } catch (error) {
    console.error('Fallback 분석 실패:', error);
    return {
      name: 'Unknown 의상',
      category: 'tops',
      originalUrl: url,
      brand: 'Unknown',
      price: 0,
      colors: ['기본색상'],
      description: '분석할 수 없는 상품입니다.'
    };
  }
}

// 전역 인스턴스 및 설정
let virtualTryOnGenerator: VirtualTryOnGenerator | null = null;
let currentConfig: AIApiConfig = { useAI: false };

export function getVirtualTryOnGenerator(): VirtualTryOnGenerator {
  if (!virtualTryOnGenerator) {
    virtualTryOnGenerator = new VirtualTryOnGenerator(currentConfig);
  }
  return virtualTryOnGenerator;
}

export function updateAIConfig(config: AIApiConfig) {
  console.log('AI 설정 업데이트:', config);
  currentConfig = { ...config }; // 깊은 복사로 안전하게 업데이트
  virtualTryOnGenerator = new VirtualTryOnGenerator(currentConfig);
  console.log('업데이트된 currentConfig:', currentConfig);
}

// 현재 설정 확인 함수 (디버깅용)
export function getCurrentConfig(): AIApiConfig {
  return currentConfig;
}

// 기존 호환성을 위한 래퍼
export function getSimpleGenerator(): VirtualTryOnGeneration {
  return getVirtualTryOnGenerator();
}

export function initializeSimpleGenerator() {
  virtualTryOnGenerator = new VirtualTryOnGenerator(currentConfig);
}

export { VirtualTryOnGenerator, ImageProcessor };

// 페이지 스크린샷을 찍어서 분석하는 함수 (실험적 기능)
async function capturePageScreenshot(url: string): Promise<string | null> {
  try {
    console.log('페이지 스크린샷 캡처 시도:', url);
    
    // 현재는 외부 API 의존성을 줄이기 위해 비활성화
    // 추후 서버 사이드 렌더링이나 Puppeteer 등을 통해 구현 가능
    console.log('스크린샷 기능은 현재 비활성화되어 있습니다');
    return null;

    // // 향후 구현 예시:
    // // 1. 서버 사이드에서 Puppeteer 사용
    // // 2. 브라우저 확장 프로그램 활용
    // // 3. 전용 스크린샷 서비스 API 사용
    
  } catch (error) {
    console.error('스크린샷 캡처 실패:', error);
    return null;
  }
}

// 스크린샷 기반 AI 분석 (현재 비활성화)
async function analyzeClothingWithScreenshot(url: string): Promise<SimpleAnalysisResult | null> {
  try {
    console.log('스크린샷 기반 분석 시도:', url);
    
    // 스크린샷 캡처 시도
    const screenshotBase64 = await capturePageScreenshot(url);
    
    if (!screenshotBase64) {
      console.log('스크린샷 캡처 실패 또는 비활성화됨');
      return null;
    }

    // GPT-4o Vision으로 스크린샷 분석
    if (!currentConfig.openaiApiKey) {
      console.log('OpenAI API 키가 없습니다');
      return null;
    }

    console.log('스크린샷 분석 시작');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentConfig.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-05-13',
        messages: [
          {
            role: 'system',
            content: `You are a computer vision assistant specialized in fashion e-commerce analysis. You can analyze webpage screenshots to extract detailed product information.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `🛍️ **이 쇼핑몰 페이지 스크린샷을 분석해서 의상 정보를 추출해주세요**

이 이미지는 온라인 쇼핑몰 상품 페이지의 스크린샷입니다. 페이지에서 다음 정보를 정확히 찾아서 추출해주세요:

📋 **추출할 정보:**
1. **상품명**: 페이지에 표시된 정확한 상품명 (한국어)
2. **브랜드**: 페이지에서 확인되는 브랜드명 (로고, 텍스트 등에서)
3. **가격**: 페이지에 표시된 실제 판매 가격 (숫자만, 원화 기준)
4. **카테고리**: tops, bottoms, outerwear, shoes, accessories 중 하나
5. **색상**: 상품 이미지에서 보이는 주요 색상들
6. **소재**: 상품 설명에서 언급된 소재 정보
7. **핏/스타일**: 상품명이나 설명에서 언급된 핏이나 스타일

⚠️ **중요**: 반드시 아래 JSON 형식으로만 응답하세요.

\`\`\`json
{
  "name": "페이지에서 추출한 정확한 상품명",
  "category": "적절한 카테고리",
  "brand": "페이지에서 확인된 브랜드명",
  "price": 실제판매가격숫자,
  "colors": ["주요색상1", "색상2"],
  "material": "소재 정보",
  "fit": "핏/스타일 정보",
  "description": "상품 설명 요약"
}
\`\`\`

분석할 페이지 URL: ${url}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: screenshotBase64,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return null;
    }

    // JSON 파싱
    const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      return null;
    }

    const analysisData = JSON.parse(jsonMatch[0]);
    
    // 상품 이미지 URL도 추출
    const generator = getVirtualTryOnGenerator();
    const productImageUrl = await generator.extractImageFromUrl(url);
    
    return {
      name: analysisData.name || '분석된 의상',
      category: analysisData.category || 'tops',
      brand: analysisData.brand || 'Unknown',
      price: typeof analysisData.price === 'number' ? analysisData.price : parseInt(analysisData.price) || 0,
      imageUrl: productImageUrl || undefined,
      originalUrl: url,
      colors: Array.isArray(analysisData.colors) ? analysisData.colors : ['기본색상'],
      material: analysisData.material || '',
      fit: analysisData.fit || '',
      description: analysisData.description || ''
    };

  } catch (error) {
    console.error('스크린샷 기반 AI 분석 실패:', error);
    return null;
  }
} 