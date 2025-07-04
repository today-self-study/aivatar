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

  // 무료 이미지 생성 - 실제 의상 이미지 조합
  async generateOutfitImage(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl?: string }[]
  ): Promise<string> {
    try {
      // 실제 의상 이미지들이 있는 경우 조합하여 코디 이미지 생성
      const itemsWithImages = selectedItems.filter((item): item is { name: string; category: string; imageUrl: string } => 
        item.imageUrl !== undefined && item.imageUrl !== null && item.imageUrl !== ''
      );
      
      if (itemsWithImages.length > 0) {
        return await this.generateOutfitCollage(userProfile, itemsWithImages);
      } else {
        // 이미지가 없는 경우 향상된 플레이스홀더 생성
        return this.generateEnhancedPlaceholder(userProfile, selectedItems);
      }
      
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      
      // 폴백: 기본 플레이스홀더 이미지
      return this.generateEnhancedPlaceholder(userProfile, selectedItems);
    }
  }

  // 실제 의상 이미지들을 조합하여 코디 콜라주 생성
  private async generateOutfitCollage(
    userProfile: { gender: string; bodyType: string },
    itemsWithImages: { name: string; category: string; imageUrl: string }[]
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;
    
    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 제목
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AI 코디 추천', canvas.width / 2, 40);
    
    // 프로필 정보
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.fillText(`${userProfile.gender === 'male' ? '남성' : '여성'} • ${userProfile.bodyType}`, canvas.width / 2, 70);
    
    // 의상 이미지들을 로드하고 배치
    const loadedImages = await Promise.all(
      itemsWithImages.map(item => this.loadImage(item.imageUrl))
    );
    
    // 이미지 배치 계산
    const imageSize = 120;
    const spacing = 20;
    const startY = 100;
    
    // 카테고리별 위치 설정
    const categoryPositions: { [key: string]: { x: number; y: number } } = {
      'tops': { x: canvas.width / 2 - imageSize / 2, y: startY },
      'outerwear': { x: canvas.width / 2 - imageSize / 2, y: startY - 30 },
      'bottoms': { x: canvas.width / 2 - imageSize / 2, y: startY + imageSize + spacing },
      'shoes': { x: canvas.width / 2 - imageSize / 2, y: startY + (imageSize + spacing) * 2 },
      'accessories': { x: canvas.width / 2 + imageSize / 2 + spacing, y: startY + imageSize / 2 }
    };
    
    // 이미지 그리기
    loadedImages.forEach((img, index) => {
      if (img) {
        const item = itemsWithImages[index];
        const pos = categoryPositions[item.category] || { x: 50 + (index * 130), y: startY + 200 };
        
        // 이미지 배경
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pos.x - 10, pos.y - 10, imageSize + 20, imageSize + 20);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(pos.x - 10, pos.y - 10, imageSize + 20, imageSize + 20);
        
        // 이미지 그리기
        ctx.drawImage(img, pos.x, pos.y, imageSize, imageSize);
        
        // 아이템 이름
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, pos.x + imageSize / 2, pos.y + imageSize + 25);
      }
    });
    
    // 하단 정보
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`총 ${itemsWithImages.length}개 아이템으로 구성된 코디`, canvas.width / 2, canvas.height - 50);
    ctx.fillText('AIVATAR AI 코디 추천', canvas.width / 2, canvas.height - 20);
    
    return canvas.toDataURL();
  }

  // 이미지 로드 헬퍼 함수
  private loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  // 향상된 플레이스홀더 이미지 생성
  private generateEnhancedPlaceholder(
    userProfile: { gender: string; bodyType: string },
    selectedItems: { name: string; category: string; imageUrl?: string }[]
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;
    
    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 제목
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AI 코디 추천', canvas.width / 2, 60);
    
    // 프로필 정보
    ctx.fillStyle = '#64748b';
    ctx.font = '18px Arial';
    ctx.fillText(`${userProfile.gender === 'male' ? '남성' : '여성'} • ${userProfile.bodyType}`, canvas.width / 2, 100);
    
    // 마네킹 그리기 (더 세련된 버전)
    this.drawStylizedMannequin(ctx, canvas.width / 2, 200, userProfile.gender);
    
    // 선택된 아이템들 표시
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('선택된 아이템:', canvas.width / 2, 550);
    
    selectedItems.forEach((item, index) => {
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Arial';
      ctx.fillText(`• ${item.name}`, canvas.width / 2, 580 + (index * 25));
    });
    
    // 하단 정보
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.fillText('실제 의상 이미지를 추가하면 더 정확한 코디를 생성할 수 있습니다', canvas.width / 2, canvas.height - 40);
    ctx.fillText('AIVATAR - AI 착장 생성 플랫폼', canvas.width / 2, canvas.height - 20);
    
    return canvas.toDataURL();
  }

  // 세련된 마네킹 그리기
  private drawStylizedMannequin(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, gender: string) {
    ctx.save();
    
    // 마네킹 색상
    ctx.fillStyle = '#e5e7eb';
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    
    if (gender === 'male') {
      // 남성 마네킹
      // 머리
      ctx.beginPath();
      ctx.arc(centerX, centerY - 80, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // 목
      ctx.fillRect(centerX - 8, centerY - 45, 16, 20);
      
      // 몸통
      ctx.fillRect(centerX - 50, centerY - 25, 100, 120);
      ctx.strokeRect(centerX - 50, centerY - 25, 100, 120);
      
      // 팔
      ctx.fillRect(centerX - 70, centerY - 10, 20, 80);
      ctx.fillRect(centerX + 50, centerY - 10, 20, 80);
      
      // 다리
      ctx.fillRect(centerX - 35, centerY + 95, 25, 100);
      ctx.fillRect(centerX + 10, centerY + 95, 25, 100);
      
    } else {
      // 여성 마네킹
      // 머리
      ctx.beginPath();
      ctx.arc(centerX, centerY - 80, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // 목
      ctx.fillRect(centerX - 6, centerY - 48, 12, 18);
      
      // 몸통 (더 곡선적)
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 20, 45, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // 팔
      ctx.fillRect(centerX - 65, centerY - 5, 18, 70);
      ctx.fillRect(centerX + 47, centerY - 5, 18, 70);
      
      // 다리
      ctx.fillRect(centerX - 30, centerY + 80, 22, 100);
      ctx.fillRect(centerX + 8, centerY + 80, 22, 100);
    }
    
    ctx.restore();
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