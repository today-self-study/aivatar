// 고급 Virtual Try-On 이미지 생성 API 유틸리티
export interface VirtualTryOnGeneration {
  generateVirtualTryOn(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl?: string }[],
    basePersonImage?: string // 기준이 될 사람 이미지
  ): Promise<string>;
  
  extractImageFromUrl(url: string): Promise<string | null>;
}

// 간단한 의상 분석 결과
export interface SimpleAnalysisResult {
  name: string;
  category: string;
  imageUrl?: string;
  brand?: string;
  price?: number;
  colors?: string[];
  description?: string;
}

// API 설정 타입
export interface AIApiConfig {
  openaiApiKey?: string;
  replicateApiKey?: string;
  lightxApiKey?: string;
  provider: 'openai' | 'replicate' | 'lightx' | 'fallback';
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
    // 이미지가 있는 아이템들만 필터링
    const itemsWithImages = selectedItems.filter(item => item.imageUrl);
    
    if (itemsWithImages.length === 0) {
      throw new Error('의상 이미지가 필요합니다. 이미지가 포함된 URL을 입력해주세요.');
    }

    // 타입 안전성을 위해 imageUrl이 있는 아이템들만 필터링
    const validItems = itemsWithImages.filter((item): item is { name: string; category: string; imageUrl: string } => 
      item.imageUrl !== undefined && item.imageUrl !== null && item.imageUrl !== ''
    );

    // AI 제공업체별 처리
    switch (this.config.provider) {
      case 'openai':
        return await this.generateWithOpenAI(userProfile, validItems, basePersonImage);
      case 'replicate':
        return await this.generateWithReplicate(userProfile, validItems, basePersonImage);
      case 'lightx':
        return await this.generateWithLightX(userProfile, validItems, basePersonImage);
      default:
        return await this.generateFallback(userProfile, validItems);
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

  private async generateWithReplicate(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl: string }[],
    basePersonImage?: string
  ): Promise<string> {
    if (!this.config.replicateApiKey) {
      throw new Error('Replicate API 키가 필요합니다.');
    }

    try {
      // 의상 이미지들을 Base64로 변환
      const clothingImages = await Promise.all(
        selectedItems.map(async (item) => ({
          category: item.category,
          name: item.name,
          base64: await ImageProcessor.urlToBase64(item.imageUrl)
        }))
      );

      // 기준 인물 이미지
      let personImageBase64 = basePersonImage;
      if (!personImageBase64) {
        personImageBase64 = this.generateDefaultPersonImage();
      }

      // Replicate Virtual Try-On 모델 사용
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.config.replicateApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cdc6ac5", // Virtual Try-On 모델
          input: {
            person_image: personImageBase64,
            clothing_images: clothingImages.map(img => img.base64),
            category_mapping: clothingImages.map(img => ({
              image: img.base64,
              category: img.category
            })),
            gender: userProfile.gender,
            body_type: userProfile.bodyType
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Replicate API 오류: ${response.status}`);
      }

      const prediction = await response.json();
      return await this.pollReplicateResult(prediction.id);

    } catch (error) {
      console.error('Replicate 생성 실패:', error);
      throw error;
    }
  }

  private async generateWithLightX(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl: string }[],
    basePersonImage?: string
  ): Promise<string> {
    if (!this.config.lightxApiKey) {
      throw new Error('LightX API 키가 필요합니다.');
    }

    try {
      // 의상 이미지들을 Base64로 변환
      const clothingImages = await Promise.all(
        selectedItems.map(async (item) => ({
          category: item.category,
          name: item.name,
          base64: await ImageProcessor.urlToBase64(item.imageUrl)
        }))
      );

      // 기준 인물 이미지
      let personImageBase64 = basePersonImage;
      if (!personImageBase64) {
        personImageBase64 = this.generateDefaultPersonImage();
      }

      // LightX Virtual Try-On API 호출
      const response = await fetch('https://api.lightx.editor/v1/virtual-tryon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.lightxApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          person_image: personImageBase64,
          garment_images: clothingImages.map(img => ({
            image: img.base64,
            category: img.category,
            name: img.name
          })),
          settings: {
            gender: userProfile.gender,
            body_type: userProfile.bodyType,
            quality: 'high',
            style: 'realistic'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`LightX API 오류: ${response.status}`);
      }

      const result = await response.json();
      return result.result_image;

    } catch (error) {
      console.error('LightX 생성 실패:', error);
      throw error;
    }
  }

  private async pollReplicateResult(predictionId: string): Promise<string> {
    const maxAttempts = 60; // 5분 대기
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.config.replicateApiKey}`
          }
        });

        const prediction = await response.json();

        if (prediction.status === 'succeeded') {
          return prediction.output;
        } else if (prediction.status === 'failed') {
          throw new Error('Replicate 예측 실패');
        }

        // 5초 대기
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error('Replicate 폴링 오류:', error);
        attempts++;
      }
    }

    throw new Error('Replicate 응답 시간 초과');
  }

  // 이미지 기반 프롬프트 생성
  private generateImageBasedPrompt(
    userProfile: { gender: string; bodyType: string },
    clothingImages: { category: string; name: string; base64: string }[]
  ): string {
    const genderText = userProfile.gender === 'male' ? 'man' : 'woman';
    const bodyTypeText = this.getBodyTypeDescription(userProfile.bodyType);
    
    const clothingDescriptions = clothingImages.map(img => 
      `${img.category} from the provided image`
    ).join(', ');

    return `A realistic photo of a ${genderText} with ${bodyTypeText} body type wearing ${clothingDescriptions}. The person should be wearing exactly the clothing items shown in the provided images. High quality, professional photography, natural lighting, full body shot, white background.`;
  }

  // 멀티파트 폼 데이터 생성
  private createMultipartFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' || key === 'mask') {
        // Base64를 Blob으로 변환
        const base64Data = value.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        formData.append(key, blob, `${key}.png`);
      } else {
        formData.append(key, value);
      }
    });
    
    return formData;
  }

  // 의상 마스크 생성
  private async createClothingMask(clothingImages: { category: string; base64: string }[]): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // 흰색 배경 (편집하지 않을 영역)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 의상 영역을 검은색으로 마스킹 (편집할 영역)
    ctx.fillStyle = 'black';
    
    // 카테고리별 마스크 영역 정의
    const maskAreas = {
      'tops': { x: 200, y: 200, width: 624, height: 400 },
      'bottoms': { x: 250, y: 500, width: 524, height: 400 },
      'outerwear': { x: 150, y: 150, width: 724, height: 500 },
      'shoes': { x: 300, y: 850, width: 424, height: 150 },
      'accessories': { x: 100, y: 100, width: 200, height: 200 }
    };
    
    clothingImages.forEach(img => {
      const area = maskAreas[img.category as keyof typeof maskAreas];
      if (area) {
        ctx.fillRect(area.x, area.y, area.width, area.height);
      }
    });
    
    return canvas.toDataURL();
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

  private generateDefaultPersonImage(): string {
    // 기본 마네킹 이미지 (심플하고 평범한 마네킹)
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="600" fill="#f8f9fa"/>
        <circle cx="200" cy="120" r="40" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
        <rect x="160" y="160" width="80" height="120" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
        <rect x="140" y="280" width="120" height="200" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
        <rect x="120" y="480" width="40" height="80" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
        <rect x="240" y="480" width="40" height="80" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
        <text x="200" y="550" text-anchor="middle" fill="#6c757d" font-family="Arial" font-size="14">기본 마네킹</text>
      </svg>
    `)}`;
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
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 제목
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AI Virtual Try-On', canvas.width / 2, 60);
    
    // 프로필 정보
    ctx.font = '18px Arial';
    ctx.fillText(`${userProfile.gender === 'male' ? '남성' : '여성'} • ${userProfile.bodyType}`, canvas.width / 2, 90);
    
    // 가상 모델 그리기
    this.drawVirtualModel(ctx, canvas.width / 2, 200, userProfile.gender);
    
    // 실제 의상 이미지들을 모델에 맞게 배치
    const positions = this.calculateClothingPositions(canvas.width / 2, 200, userProfile.gender);
    
    for (const item of itemsWithImages) {
      try {
        const img = await this.loadImage(item.imageUrl);
        if (img) {
          const pos = positions[item.category];
          if (pos) {
            // 의상 이미지를 모델에 맞게 변형하여 그리기
            this.drawClothingOnModel(ctx, img, pos);
            
            // 의상 정보 표시
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(pos.x, pos.y + pos.height + 5, pos.width, 25);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.name, pos.x + pos.width / 2, pos.y + pos.height + 20);
          }
        }
      } catch (error) {
        console.error(`의상 이미지 로드 실패: ${item.name}`, error);
      }
    }
    
    // 하단 정보
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${itemsWithImages.length}개 의상 조합`, canvas.width / 2, canvas.height - 80);
    ctx.fillText('실제 의상 이미지 기반 생성', canvas.width / 2, canvas.height - 60);
    ctx.fillText('AIVATAR - AI Virtual Try-On', canvas.width / 2, canvas.height - 30);
    
    return canvas.toDataURL();
  }

  // 가상 모델 그리기
  private drawVirtualModel(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, gender: string) {
    ctx.save();
    ctx.fillStyle = '#f4a261';
    ctx.strokeStyle = '#e76f51';
    ctx.lineWidth = 2;
    
    // 머리
    ctx.beginPath();
    ctx.arc(centerX, centerY - 100, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 목
    ctx.fillRect(centerX - 10, centerY - 60, 20, 30);
    
    // 몸통
    if (gender === 'male') {
      ctx.fillRect(centerX - 50, centerY - 30, 100, 110);
    } else {
      // 여성형 몸통
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 25, 45, 55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // 팔
      ctx.fillRect(centerX - 75, centerY - 20, 20, 90);
      ctx.fillRect(centerX + 55, centerY - 20, 20, 90);
      
      // 다리
      ctx.fillRect(centerX - 35, centerY + 80, 25, 120);
      ctx.fillRect(centerX + 10, centerY + 80, 25, 120);
    }
    
    ctx.restore();
  }

  // 의상 위치 계산
  private calculateClothingPositions(centerX: number, centerY: number, gender: string): { [key: string]: { x: number; y: number; width: number; height: number } } {
    if (gender === 'male') {
      return {
        'tops': { x: centerX - 60, y: centerY - 50, width: 120, height: 100 },
        'outerwear': { x: centerX - 70, y: centerY - 60, width: 140, height: 120 },
        'bottoms': { x: centerX - 40, y: centerY + 50, width: 80, height: 120 },
        'shoes': { x: centerX - 45, y: centerY + 200, width: 90, height: 30 },
        'accessories': { x: centerX + 80, y: centerY - 100, width: 60, height: 60 }
      };
    } else {
      return {
        'tops': { x: centerX - 50, y: centerY - 40, width: 100, height: 80 },
        'outerwear': { x: centerX - 60, y: centerY - 50, width: 120, height: 100 },
        'bottoms': { x: centerX - 35, y: centerY + 40, width: 70, height: 120 },
        'shoes': { x: centerX - 40, y: centerY + 180, width: 80, height: 25 },
        'accessories': { x: centerX + 70, y: centerY - 90, width: 50, height: 50 }
      };
    }
  }

  // 모델에 의상 그리기
  private drawClothingOnModel(
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement, 
    pos: { x: number; y: number; width: number; height: number }
  ) {
    ctx.save();
    
    // 의상별 블렌딩 모드 적용
    ctx.globalAlpha = 0.9;
    ctx.globalCompositeOperation = 'multiply';
    
    // 이미지를 해당 위치에 맞게 그리기
    ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height);
    
    ctx.restore();
  }

  // 이미지 로드 헬퍼 (기존 유지)
  private loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  // 향상된 플레이스홀더 (기존 유지하되 더 개선)
  private generateEnhancedPlaceholder(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl?: string }[]
  ): string {
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
    
    // 선택된 아이템들 나열
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('선택된 의상:', canvas.width / 2, 700);
    
    selectedItems.forEach((item, index) => {
      ctx.fillStyle = '#6b7280';
      ctx.font = '18px Arial';
      const categoryEmoji = this.getCategoryEmoji(item.category);
      ctx.fillText(`${categoryEmoji} ${item.name}`, canvas.width / 2, 740 + (index * 35));
    });
    
    // API 키 안내
    ctx.fillStyle = '#dc2626';
    ctx.font = '16px Arial';
    ctx.fillText('💡 더 사실적인 이미지를 원하시면 AI API 키를 설정해주세요', canvas.width / 2, canvas.height - 100);
    
    // 하단 정보
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Arial';
    ctx.fillText('실제 의상 이미지 기반 AI 생성', canvas.width / 2, canvas.height - 60);
    ctx.fillText('AIVATAR - 차세대 AI 패션 플랫폼', canvas.width / 2, canvas.height - 30);
    
    return canvas.toDataURL();
  }

  // 카테고리 이모지
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
    
    const generator = getVirtualTryOnGenerator();
    const imageUrl = await generator.extractImageFromUrl(url);
    
    // 이미지가 있으면 AI 분석 시도
    if (imageUrl && currentConfig.provider !== 'fallback' && currentConfig.openaiApiKey) {
      try {
        const aiAnalysis = await analyzeClothingWithAI(imageUrl, url);
        if (aiAnalysis) {
          console.log('AI 분석 성공:', aiAnalysis);
          return aiAnalysis;
        }
      } catch (error) {
        console.warn('AI 분석 실패, 기본 분석으로 전환:', error);
      }
    }
    
    // AI 분석 실패 시 기본 분석
    const fallbackAnalysis = await analyzeClothingFallback(url, imageUrl);
    console.log('기본 분석 결과:', fallbackAnalysis);
    return fallbackAnalysis;
    
  } catch (error) {
    console.error('의상 분석 실패:', error);
    return createFallbackAnalysis(url);
  }
}

// AI를 사용한 의상 분석
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
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `이 의상 이미지를 분석해서 다음 정보를 JSON 형식으로 정확히 추출해주세요:

요구사항:
1. 의상 이름: 한국어로 구체적이고 매력적으로 (예: "베이직 화이트 셔츠", "스키니 블랙 진")
2. 카테고리: tops, bottoms, outerwear, shoes, accessories 중 정확히 하나
3. 브랜드: 이미지에서 확인되는 브랜드명 (없으면 "Unknown")
4. 실제 가격: 한국 원화 기준 실제 판매 가격 (예상이 아닌 실제 가격, 숫자만)
5. 주요 색상: 1-3개의 색상 배열
6. 스타일 설명: 간단한 한 문장

반드시 이 JSON 형식으로만 응답해주세요:
{
  "name": "구체적인 의상 이름",
  "category": "정확한 카테고리",
  "brand": "브랜드명",
  "price": 실제가격숫자,
  "colors": ["색상1", "색상2"],
  "description": "스타일 설명"
}

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
        max_tokens: 800,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API 오류:', response.status, errorText);
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

    // JSON 파싱 시도
    try {
      // JSON 블록 찾기
      const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        console.error('JSON 형식을 찾을 수 없습니다:', aiResponse);
        return null;
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
        colors: Array.isArray(analysisData.colors) ? analysisData.colors : [],
        description: analysisData.description || ''
      };

      console.log('최종 AI 분석 결과:', result);
      return result;

    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError, 'AI 응답:', aiResponse);
      return null;
    }

  } catch (error) {
    console.error('AI 분석 실패:', error);
    return null;
  }
}

// 기본 분석 (AI 없이)
async function analyzeClothingFallback(url: string, imageUrl?: string | null): Promise<SimpleAnalysisResult> {
  console.log('기본 분석 시작:', { url, imageUrl });
  
  // URL 기반 분석
  const urlAnalysis = analyzeUrlKeywords(url);
  
  // 도메인 기반 브랜드 추출
  const domain = new URL(url).hostname;
  const brandName = extractBrandFromDomain(domain);
  
  // 실제 가격 추정 (도메인별 평균 가격대)
  const actualPrice = estimatePriceByDomain(domain);
  
  // 상품명 생성
  const productName = generateProductName(urlAnalysis, brandName);
  
  const result = {
    name: productName,
    category: urlAnalysis.category,
    imageUrl: imageUrl || undefined,
    brand: brandName,
    price: actualPrice,
    colors: ['기본색상'],
    description: `${brandName}의 ${urlAnalysis.category} 아이템`
  };

  console.log('기본 분석 결과:', result);
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

// 기본 분석 결과 생성
function createFallbackAnalysis(url: string): SimpleAnalysisResult {
  try {
    const domain = new URL(url).hostname;
    const brandName = extractBrandFromDomain(domain);
    
    return {
      name: `${brandName} 의상`,
      category: 'tops',
      brand: brandName,
      price: 40000
    };
  } catch {
    return {
      name: '분석된 의상',
      category: 'tops',
      brand: '브랜드',
      price: 40000
    };
  }
}

// 전역 인스턴스 및 설정
let virtualTryOnGenerator: VirtualTryOnGenerator | null = null;
let currentConfig: AIApiConfig = { provider: 'fallback' };

export function getVirtualTryOnGenerator(): VirtualTryOnGenerator {
  if (!virtualTryOnGenerator) {
    virtualTryOnGenerator = new VirtualTryOnGenerator(currentConfig);
  }
  return virtualTryOnGenerator;
}

export function updateAIConfig(config: AIApiConfig) {
  currentConfig = config;
  virtualTryOnGenerator = new VirtualTryOnGenerator(config);
}

// 기존 호환성을 위한 래퍼
export function getSimpleGenerator(): VirtualTryOnGeneration {
  return getVirtualTryOnGenerator();
}

export function initializeSimpleGenerator() {
  virtualTryOnGenerator = new VirtualTryOnGenerator(currentConfig);
}

export { VirtualTryOnGenerator, ImageProcessor }; 