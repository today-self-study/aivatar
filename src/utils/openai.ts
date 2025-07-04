// OpenAI API 기반 의상 분석 유틸리티 (단순화 버전)
import OpenAI from 'openai';

// 간단한 의상 분석 결과
export interface SimpleAnalysisResult {
  name: string;
  category: string;
  imageUrl?: string;
  originalUrl?: string;
  brand?: string;
  price?: number;
  colors?: string[];
  material?: string;
  fit?: string;
  description?: string;
}

// API 설정 타입
export interface AIApiConfig {
  openaiApiKey?: string;
  useAI: boolean; // AI 사용 여부 (OpenAI API 키가 있으면 true)
}

// 전역 설정
let currentConfig: AIApiConfig = { useAI: false };

// OpenAI 클라이언트 가져오기
function getOpenAI() {
  if (!currentConfig.openaiApiKey) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }
  
  return new OpenAI({
    apiKey: currentConfig.openaiApiKey,
    dangerouslyAllowBrowser: true
  });
}

// HTML 콘텐츠를 OpenAI API로 분석
async function analyzeHTMLContent(htmlContent: string): Promise<SimpleAnalysisResult> {
  console.log('🤖 OpenAI API 호출 시작 - HTML 콘텐츠 분석');
  console.log('📊 현재 AI 설정:', currentConfig);
  
  const openai = getOpenAI();
  
  try {
    console.log('🔑 OpenAI 클라이언트 생성 성공');
    console.log('📝 분석할 HTML 길이:', htmlContent.length, '자');
    
    const truncatedContent = htmlContent.substring(0, 15000); // 토큰 제한 고려
    console.log('✂️ 토큰 제한으로 HTML 콘텐츠 자르기:', truncatedContent.length, '자');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `당신은 의류 상품 정보를 분석하는 전문가입니다. 
          주어진 HTML 콘텐츠에서 의류 상품의 정보를 추출하여 JSON 형태로 반환해주세요.
          
          HTML에서 다음 정보들을 찾아서 분석해주세요:
          1. 메타태그 정보 (title, og:title, og:description, product:* 등)
          2. JavaScript 객체 내 상품 정보 (window.__MSS__, __NEXT_DATA__ 등)
          3. 구조화된 데이터 (JSON-LD, microdata 등)
          4. 스크립트 태그 내 상품 정보
          
          반환 형식:
          {
            "name": "상품명",
            "category": "tops|bottoms|outerwear|shoes|accessories",
            "brand": "브랜드명",
            "price": 가격숫자,
            "colors": ["색상1", "색상2"],
            "material": "소재",
            "fit": "핏",
            "description": "상품 설명",
            "imageUrl": "이미지 URL"
          }
          
          정보가 없으면 해당 필드는 생략하거나 null로 설정하세요.`
        },
        {
          role: "user",
          content: `다음 HTML 콘텐츠에서 의류 상품 정보를 추출해주세요:\n\n${truncatedContent}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    console.log('🎯 OpenAI API 응답 수신 완료');
    console.log('📊 OpenAI API 전체 응답 구조:', JSON.stringify(response, null, 2));
    
    // 응답 구조 안전성 검사
    if (!response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
      console.error('❌ OpenAI API 응답 구조가 올바르지 않음:', response);
      throw new Error('OpenAI API 응답 구조가 올바르지 않습니다');
    }
    
    const choice = response.choices[0];
    if (!choice || !choice.message) {
      console.error('❌ OpenAI API 응답의 choice 또는 message가 없음:', choice);
      throw new Error('OpenAI API 응답의 메시지가 없습니다');
    }
    
    const content = choice.message.content;
    
    if (!content || typeof content !== 'string') {
      console.error('❌ OpenAI API 응답이 비어있거나 유효하지 않음:', content);
      throw new Error('OpenAI API 응답이 비어있거나 유효하지 않습니다');
    }

    console.log('📋 OpenAI API 응답 내용:', content);

    // JSON 파싱 시도
    try {
      // 안전한 문자열 처리 - 앞뒤 공백 제거 및 특수 문자 처리
      const cleanContent = content.trim();
      if (!cleanContent) {
        throw new Error('응답 내용이 비어있습니다');
      }
      
      const result = JSON.parse(cleanContent);
      console.log('✅ JSON 파싱 성공:', result);
      
      // 기본값 설정 - 안전한 값 할당
      return {
        name: (result.name && typeof result.name === 'string') ? result.name : '상품명 미확인',
        category: (result.category && typeof result.category === 'string') ? result.category : 'tops',
        brand: (result.brand && typeof result.brand === 'string') ? result.brand : 'Unknown',
        price: (typeof result.price === 'number' && result.price >= 0) ? result.price : 0,
        colors: Array.isArray(result.colors) ? result.colors : ['기본색상'],
        material: (result.material && typeof result.material === 'string') ? result.material : '',
        fit: (result.fit && typeof result.fit === 'string') ? result.fit : '',
        description: (result.description && typeof result.description === 'string') ? result.description : '',
        imageUrl: (result.imageUrl && typeof result.imageUrl === 'string') ? result.imageUrl : ''
      };
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      console.log('📝 원본 응답:', content);
      
      // JSON 파싱 실패 시 텍스트에서 정보 추출 시도
      return extractInfoFromText(content);
    }
  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error);
    throw new Error(`OpenAI API 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// 텍스트에서 정보 추출 (JSON 파싱 실패 시 백업)
function extractInfoFromText(text: string): SimpleAnalysisResult {
  console.log('📝 텍스트에서 정보 추출 시도');
  
  // 안전한 문자열 처리 - null/undefined 체크
  const safeText = text && typeof text === 'string' ? text : '';
  
  try {
    // 간단한 패턴 매칭으로 정보 추출
    const nameMatch = safeText.match(/이름|상품명|name[:\s]+([^\n,]+)/i);
    const brandMatch = safeText.match(/브랜드|brand[:\s]+([^\n,]+)/i);
    const priceMatch = safeText.match(/가격|price[:\s]+([0-9,]+)/i);
    
    // 안전한 값 추출
    let extractedName = 'AI 분석 상품';
    let extractedBrand = 'Unknown';
    let extractedPrice = 0;
    
    if (nameMatch && nameMatch[1]) {
      extractedName = nameMatch[1].trim();
    }
    
    if (brandMatch && brandMatch[1]) {
      extractedBrand = brandMatch[1].trim();
    }
    
    if (priceMatch && priceMatch[1]) {
      const priceStr = priceMatch[1].replace(/,/g, '');
      const parsedPrice = parseInt(priceStr);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        extractedPrice = parsedPrice;
      }
    }
    
    return {
      name: extractedName,
      category: 'tops',
      brand: extractedBrand,
      price: extractedPrice,
      colors: ['기본색상'],
      description: 'OpenAI API로 분석된 상품입니다.'
    };
  } catch (error) {
    console.error('❌ 텍스트 추출 중 오류 발생:', error);
    // 모든 것이 실패했을 때 기본값 반환
    return {
      name: 'AI 분석 상품',
      category: 'tops',
      brand: 'Unknown',
      price: 0,
      colors: ['기본색상'],
      description: 'OpenAI API로 분석된 상품입니다.'
    };
  }
}

// URL에서 HTML을 가져와서 분석하는 함수
async function fetchAndAnalyzeHTML(url: string): Promise<SimpleAnalysisResult> {
  try {
    console.log('🔍 HTML 페치 및 분석 시작:', url);
    
    // 여러 프록시 서버 시도
    const proxyServers = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    let htmlContent = '';
    let lastError = null;
    
    for (let i = 0; i < proxyServers.length; i++) {
      const proxyUrl = proxyServers[i] + encodeURIComponent(url);
      console.log(`📡 프록시 서버 ${i + 1}/${proxyServers.length} 시도:`, proxyUrl);
      
      try {
        // AbortController로 타임아웃 구현
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
        
        const response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        htmlContent = await response.text();
        console.log('✅ HTML 콘텐츠 페치 성공, 길이:', htmlContent.length);
        
        if (htmlContent.length > 100) { // 최소한의 콘텐츠가 있는지 확인
          break;
        } else {
          console.warn('⚠️ HTML 콘텐츠가 너무 짧음, 다음 프록시 시도');
          continue;
        }
      } catch (error) {
        console.warn(`❌ 프록시 서버 ${i + 1} 실패:`, error);
        lastError = error;
        continue;
      }
    }
    
    if (!htmlContent || htmlContent.length < 100) {
      throw new Error(`모든 프록시 서버에서 HTML 페치 실패. 마지막 오류: ${lastError}`);
    }
    
    console.log('📋 HTML 콘텐츠 분석 시작 - OpenAI API 호출 예정');
    console.log('📊 분석할 HTML 콘텐츠 미리보기:', htmlContent.substring(0, 500) + '...');
    
    // HTML 콘텐츠 분석 - OpenAI API 호출
    const result = await analyzeHTMLContent(htmlContent);
    result.originalUrl = url;
    
    console.log('🎯 HTML 분석 완료:', result);
    return result;
  } catch (error) {
    console.error('❌ HTML 페치 및 분석 중 오류 발생:', error);
    throw new Error(`페이지 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// AI 기반 의상 분석 함수 (OpenAI API 전용)
export async function analyzeClothingFromUrl(url: string): Promise<SimpleAnalysisResult> {
  try {
    console.log('🔍 AI 의상 URL 분석 시작 (OpenAI API 전용):', url);
    console.log('현재 AI 설정:', currentConfig);
    
    // OpenAI API 키 확인 - 필수 조건
    if (!currentConfig.openaiApiKey) {
      throw new Error('❌ OpenAI API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.');
    }
    
    if (!currentConfig.useAI) {
      throw new Error('❌ AI 분석이 비활성화되어 있습니다. 설정 페이지에서 AI 분석을 활성화해주세요.');
    }
    
    console.log('✅ OpenAI API 설정 확인 완료 - 분석 시작');
    
    // HTML 직접 분석 시도 (OpenAI API 사용)
    console.log('🔄 HTML 직접 분석 시도 (OpenAI API)');
    const htmlResult = await fetchAndAnalyzeHTML(url);
    console.log('🎯 HTML 직접 분석 성공:', htmlResult);
    return htmlResult;
    
  } catch (error) {
    console.error('❌ AI 의상 분석 완전 실패:', error);
    
    // 에러 메시지를 사용자에게 명확히 전달
    if (error instanceof Error) {
      throw error; // 원본 에러 메시지 유지
    } else {
      throw new Error('❌ 알 수 없는 오류가 발생했습니다. OpenAI API 키와 네트워크 상태를 확인해주세요.');
    }
  }
}

// 설정 관리 함수들
export function updateAIConfig(config: AIApiConfig) {
  console.log('AI 설정 업데이트:', config);
  currentConfig = { ...config }; // 깊은 복사로 안전하게 업데이트
  console.log('업데이트된 currentConfig:', currentConfig);
}

// 현재 설정 확인 함수 (디버깅용)
export function getCurrentConfig(): AIApiConfig {
  return currentConfig;
}

// 기존 호환성을 위한 더미 함수들
export function getVirtualTryOnGenerator() {
  return {
    generateVirtualTryOn: () => Promise.resolve('data:image/png;base64,'),
    extractImageFromUrl: () => Promise.resolve(null)
  };
}

export function getSimpleGenerator() {
  return getVirtualTryOnGenerator();
}

export function initializeSimpleGenerator() {
  // 초기화 로직 (필요시 구현)
} 