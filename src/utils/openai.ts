// 무료 이미지 생성 API 유틸리티
export interface SimpleImageGeneration {
  generateOutfitImage(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl?: string }[]
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

class SimpleImageGenerator implements SimpleImageGeneration {
  
  // URL에서 이미지 추출 (무료 방법)
  async extractImageFromUrl(url: string): Promise<string | null> {
    try {
      // 간단한 이미지 추출 로직
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      const html = data.contents;
      
      // Open Graph 이미지 추출
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
      if (ogImageMatch) {
        return ogImageMatch[1];
      }
      
      // Twitter Card 이미지 추출
      const twitterImageMatch = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i);
      if (twitterImageMatch) {
        return twitterImageMatch[1];
      }
      
      // 일반 이미지 태그에서 추출
      const imgMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*>/i);
      if (imgMatch) {
        return imgMatch[1];
      }
      
      return null;
    } catch (error) {
      console.error('이미지 추출 실패:', error);
      return null;
    }
  }

  // 무료 이미지 생성 API 사용
  async generateOutfitImage(
    userProfile: { gender: string; bodyType: string }, // 사용자 프로필 정보
    selectedItems: { name: string; category: string; imageUrl?: string }[]
  ): Promise<string> {
    try {
      // userProfile과 selectedItems를 사용하여 프롬프트 생성
      const prompt = this.generatePrompt(userProfile, selectedItems);
      
      // Hugging Face Spaces API 사용 (무료)
      const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 20,
            guidance_scale: 7.5,
            width: 512,
            height: 768
          }
        })
      });

      if (!response.ok) {
        throw new Error('이미지 생성 실패');
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
      
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      
      // 폴백: 간단한 플레이스홀더 이미지 (userProfile 사용)
      return this.generatePlaceholderImage(userProfile, selectedItems);
    }
  }

  // 프롬프트 생성
  private generatePrompt(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl?: string }[]
  ): string {
    const genderText = userProfile.gender === 'male' ? 'male' : 'female';
    const itemsText = selectedItems.map(item => item.name).join(', ');
    
    return `Professional fashion photography of a ${genderText} mannequin wearing ${itemsText}, clean white background, studio lighting, high quality, product catalog style`;
  }

  // 플레이스홀더 이미지 생성
  private generatePlaceholderImage(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl?: string }[]
  ): string {
    // Canvas를 사용한 간단한 플레이스홀더 생성
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;
    
    // 배경
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 성별에 따른 마네킹 실루엣
    ctx.fillStyle = '#e9ecef';
    
    if (userProfile.gender === 'male') {
      // 남성 마네킹 - 더 각진 형태
      ctx.fillRect(200, 100, 112, 200); // 몸통
      ctx.fillRect(220, 50, 72, 80);   // 머리
      ctx.fillRect(180, 120, 40, 120); // 왼팔
      ctx.fillRect(292, 120, 40, 120); // 오른팔
      ctx.fillRect(200, 300, 50, 200); // 왼다리
      ctx.fillRect(262, 300, 50, 200); // 오른다리
    } else {
      // 여성 마네킹 - 더 곡선적인 형태
      ctx.fillRect(205, 100, 102, 200); // 몸통 (약간 좁게)
      ctx.fillRect(225, 50, 62, 80);   // 머리 (약간 작게)
      ctx.fillRect(185, 120, 35, 120); // 왼팔 (약간 가늘게)
      ctx.fillRect(292, 120, 35, 120); // 오른팔 (약간 가늘게)
      ctx.fillRect(205, 300, 45, 200); // 왼다리 (약간 가늘게)
      ctx.fillRect(262, 300, 45, 200); // 오른다리 (약간 가늘게)
    }
    
    // 텍스트
    ctx.fillStyle = '#6c757d';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`AI 코디 생성중... (${userProfile.gender === 'male' ? '남성' : '여성'})`, canvas.width / 2, canvas.height - 50);
    
    // 선택된 아이템들 표시
    selectedItems.forEach((item, index) => {
      ctx.fillText(item.name, canvas.width / 2, canvas.height - 100 + (index * 20));
    });
    
    return canvas.toDataURL();
  }
}

// 간단한 의상 분석 함수
export async function analyzeClothingFromUrl(url: string): Promise<SimpleAnalysisResult> {
  try {
    const generator = new SimpleImageGenerator();
    const imageUrl = await generator.extractImageFromUrl(url);
    
    // URL에서 기본 정보 추출
    const domain = new URL(url).hostname;
    let category = 'tops'; // 기본값
    
    // URL 패턴으로 카테고리 추정
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
      price: 50000 // 기본 가격
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

// 전역 인스턴스
let simpleGenerator: SimpleImageGenerator | null = null;

export function getSimpleGenerator(): SimpleImageGenerator {
  if (!simpleGenerator) {
    simpleGenerator = new SimpleImageGenerator();
  }
  return simpleGenerator;
}

// 기존 OpenAI 관련 함수들 제거하고 간단한 대체 함수들 제공
export function initializeSimpleGenerator() {
  simpleGenerator = new SimpleImageGenerator();
}

export { SimpleImageGenerator }; 