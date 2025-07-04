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
      // 직접 이미지 URL인 경우
      if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return url;
      }

      // 쇼핑몰 페이지에서 이미지 추출
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      const html = await response.text();
      
      // 메타 태그에서 이미지 추출
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
      if (ogImageMatch) {
        return ogImageMatch[1];
      }

      // 첫 번째 큰 이미지 찾기
      const imgMatches = html.match(/<img[^>]*src="([^"]*)"[^>]*>/gi);
      if (imgMatches) {
        for (const match of imgMatches) {
          const srcMatch = match.match(/src="([^"]*)"/i);
          if (srcMatch) {
            const imgUrl = srcMatch[1];
            if (imgUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              return imgUrl.startsWith('http') ? imgUrl : new URL(imgUrl, url).href;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('이미지 추출 실패:', error);
      return null;
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
      // 의상 이미지들을 Base64로 변환
      const clothingImages = await Promise.all(
        selectedItems.map(async (item) => ({
          category: item.category,
          name: item.name,
          base64: await ImageProcessor.urlToBase64(item.imageUrl),
          resized: await ImageProcessor.resizeImage(
            await ImageProcessor.urlToBase64(item.imageUrl)
          )
        }))
      );

      // 기준 인물 이미지 처리
      let personImageBase64 = basePersonImage;
      if (!personImageBase64) {
        personImageBase64 = this.generateDefaultPersonImage(userProfile);
      }

      // OpenAI DALL-E 3 API 호출 (이미지 편집 방식)
      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'multipart/form-data'
        },
        body: this.createMultipartFormData({
          image: personImageBase64,
          mask: await this.createClothingMask(clothingImages),
          prompt: this.generateImageBasedPrompt(userProfile, clothingImages),
          n: 1,
          size: "1024x1024"
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.status}`);
      }

      const result = await response.json();
      return result.data[0].url;

    } catch (error) {
      console.error('OpenAI 생성 실패:', error);
      throw error;
    }
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
        personImageBase64 = this.generateDefaultPersonImage(userProfile);
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
        personImageBase64 = this.generateDefaultPersonImage(userProfile);
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

  private generateDefaultPersonImage(userProfile: { gender: string; bodyType: string }): string {
    // 기본 인물 이미지 생성 (실제로는 더 정교한 구현 필요)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;
    
    // 배경
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 간단한 인물 실루엣
    ctx.fillStyle = '#d0d0d0';
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 머리
    ctx.beginPath();
    ctx.arc(centerX, centerY - 200, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // 몸통
    ctx.fillRect(centerX - 80, centerY - 140, 160, 280);
    
    return canvas.toDataURL();
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

// 간단한 의상 분석 함수 (기존 유지)
export async function analyzeClothingFromUrl(url: string): Promise<SimpleAnalysisResult> {
  try {
    const generator = new VirtualTryOnGenerator({ provider: 'fallback' });
    const imageUrl = await generator.extractImageFromUrl(url);
    
    const domain = new URL(url).hostname;
    let category = 'tops';
    
    if (url.includes('pants') || url.includes('jean') || url.includes('trouser')) {
      category = 'bottoms';
    } else if (url.includes('jacket') || url.includes('coat') || url.includes('outer')) {
      category = 'outerwear';
    } else if (url.includes('shoes') || url.includes('sneaker') || url.includes('boot')) {
      category = 'shoes';
    } else if (url.includes('bag') || url.includes('accessory') || url.includes('watch')) {
      category = 'accessories';
    }
    
    return {
      name: `${domain}에서 가져온 상품`,
      category: category as any,
      imageUrl: imageUrl || undefined,
      brand: domain.split('.')[0],
      price: 50000
    };
    
  } catch (error) {
    console.error('의상 분석 실패:', error);
    return {
      name: '분석된 상품',
      category: 'tops',
      brand: '브랜드',
      price: 50000
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