import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, ExternalLink, ShoppingBag } from 'lucide-react';
import { cn, generateId } from '../utils';
import type { ClothingItem, ClothingCategoryType, SimpleAnalysisResult } from '../types';

interface ClothingItemFormProps {
  onAddItem: (item: ClothingItem) => void;
}

const ClothingItemForm: React.FC<ClothingItemFormProps> = ({ onAddItem }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analysisStatus, setAnalysisStatus] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SimpleAnalysisResult | null>(null);
  const [autoRegister, setAutoRegister] = useState(true);

  // URL 분석 및 자동 등록
  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error('URL을 입력해주세요');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus('');

    try {
      // OpenAI API 기반 분석 안내
      toast.success('OpenAI API를 사용하여 상품 정보를 분석합니다', { duration: 3000 });

      // 동적 import로 openai 모듈 로드
      const { analyzeClothingFromUrl, getCurrentConfig } = await import('../utils/openai');
      
      // 현재 AI 설정 상태 확인 및 디버깅
      const currentConfig = getCurrentConfig();
      console.log('🔍 현재 AI 설정 상태:', currentConfig);
      console.log('🔍 API 키 존재 여부:', !!currentConfig.openaiApiKey);
      console.log('🔍 AI 사용 여부:', currentConfig.useAI);
      
      // localStorage에서 직접 확인
      const storedConfig = localStorage.getItem('ai-api-config');
      console.log('🔍 localStorage AI 설정:', storedConfig);
      
      if (!currentConfig.openaiApiKey) {
        throw new Error('OpenAI API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.');
      }
      
      if (!currentConfig.useAI) {
        throw new Error('AI 분석이 비활성화되어 있습니다. 설정 페이지에서 AI 분석을 활성화해주세요.');
      }

      setAnalysisStatus('OpenAI API 분석 중... (HTML 또는 스크린샷 기반)');
      
      console.log('🚀 analyzeClothingFromUrl 함수 호출 시작');
      const result = await analyzeClothingFromUrl(url);
      console.log('🎯 analyzeClothingFromUrl 함수 호출 완료:', result);

      if (result) {
        console.log('✅ OpenAI API 분석 성공:', result);
        setAnalysisResult(result);
        setAnalysisStatus('OpenAI API 분석 완료! 상품 정보를 확인해주세요');
        toast.success('🎯 OpenAI API 분석이 완료되었습니다!', { duration: 3000 });

        // 자동 등록이 활성화된 경우 1초 후 자동 등록
        if (autoRegister) {
          setTimeout(() => {
            addPreviewItemAutomatically();
          }, 1000);
        }
      } else {
        console.log('❌ OpenAI API 분석 실패 - 결과 없음');
        setAnalysisStatus('OpenAI API 분석 실패');
        toast.error('❌ OpenAI API 분석에 실패했습니다. API 키를 확인해주세요.');
      }
    } catch (error) {
      console.error('❌ OpenAI API 분석 오류:', error);
      
      // 에러 메시지에 따른 구체적인 안내
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      if (errorMessage.includes('API 키가 설정되지 않았습니다')) {
        setAnalysisStatus('OpenAI API 키 미설정');
        toast.error('⚙️ 설정 페이지에서 OpenAI API 키를 입력해주세요!', { duration: 5000 });
      } else if (errorMessage.includes('AI 분석이 비활성화')) {
        setAnalysisStatus('AI 분석 비활성화');
        toast.error('⚙️ 설정 페이지에서 AI 분석을 활성화해주세요!', { duration: 5000 });
      } else if (errorMessage.includes('모든 AI 분석 방법이 실패')) {
        setAnalysisStatus('OpenAI API 분석 실패');
        toast.error('🌐 네트워크 상태를 확인하거나 다른 URL을 시도해주세요', { duration: 5000 });
      } else {
        setAnalysisStatus('OpenAI API 오류 발생');
        toast.error(`❌ ${errorMessage}`, { duration: 5000 });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 의상 목록에 추가
  const addToClothingList = (result: SimpleAnalysisResult, url: string) => {
    const newItem: ClothingItem = {
      id: generateId(),
      name: result.name,
      category: result.category as ClothingCategoryType,
      brand: result.brand || 'Unknown',
      price: result.price || 0,
      imageUrl: result.imageUrl || '',
      originalUrl: url,
      description: result.description || '',
      colors: result.colors || [],
      material: result.material || '',
      fit: result.fit || '',
      sizes: [],
      tags: [],
      createdAt: new Date().toISOString()
    };

    onAddItem(newItem);
    setUrl('');
    toast.success(`🎉 "${result.name}"이(가) 의상 목록에 추가되었습니다!`);
  };

  // 키보드 이벤트 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleAnalyze();
    }
  };

  // 자동으로 미리보기 아이템을 추가하는 함수
  const addPreviewItemAutomatically = async () => {
    if (analysisResult) {
      addToClothingList(analysisResult, url);
      setUrl('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          AI 의상 분석
        </h2>
        <p className="text-gray-600 text-sm">
          상품 링크를 입력하면 AI가 자동으로 분석하여 의상 목록에 추가합니다
        </p>
      </div>

      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">의상 추가</h2>
              <p className="text-sm text-gray-600">상품 URL을 입력하면 AI가 자동으로 분석합니다</p>
            </div>
          </div>
          
          {/* 자동 등록 토글 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">자동 등록</label>
            <button
              onClick={() => setAutoRegister(!autoRegister)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                autoRegister ? "bg-green-500" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  autoRegister ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* 현재 화면 처리 방식 안내 */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 text-purple-700">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">🤖 OpenAI API 전용 분석</span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            HTML 직접 분석 → OpenAI GPT-4o 분석 → 스크린샷 백업 분석 ✨
          </p>
          <div className="text-xs text-purple-500 mt-1 flex items-center gap-1">
            <span>⏱️</span>
            <span>처리 시간: 5-15초 (OpenAI API 응답 속도에 따라 변동)</span>
          </div>
        </div>

        {/* URL 입력 */}
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="상품 URL을 입력하세요 (예: https://www.musinsa.com/products/...)"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            disabled={isAnalyzing}
          />
          <ExternalLink className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
        </div>

        {/* 분석 버튼 */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !url.trim()}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2",
            isAnalyzing || !url.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105"
          )}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              AI 분석 중...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              AI로 분석하고 추가하기
            </>
          )}
        </button>

        {/* 분석 중 상태 표시 */}
        {isAnalyzing && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-purple-800 font-medium">
                🤖 OpenAI API 분석 중...
              </span>
            </div>
            <div className="mt-2 text-sm text-purple-600">
              <div className="space-y-1">
                <div>✅ 1단계: URL 페이지 HTML 페치</div>
                <div>🔄 2단계: 프록시 서버를 통한 CORS 우회</div>
                <div>🤖 3단계: OpenAI GPT-4o API로 상품 정보 분석</div>
                <div>📊 4단계: 구조화된 데이터 추출 및 정리</div>
              </div>
              <div className="mt-2 text-xs text-purple-500">
                처리 시간: 5-15초 (OpenAI API 응답 속도에 따라 변동)
                <br />
                💡 개발자 도구 Network 탭에서 OpenAI API 호출을 확인할 수 있습니다
              </div>
            </div>
          </div>
        )}

        {/* 분석 결과 미리보기 */}
        {analysisResult && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <span className="text-xl">✨</span>
                분석 완료!
              </h3>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {analysisStatus}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 상품 이미지 */}
              {analysisResult.imageUrl && (
                <div className="flex justify-center">
                  <img 
                    src={analysisResult.imageUrl} 
                    alt={analysisResult.name}
                    className="w-full max-w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              
              {/* 상품 정보 */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">상품명</h4>
                  <p className="text-gray-900 font-semibold">{analysisResult.name}</p>
                </div>

                {analysisResult.brand && analysisResult.brand !== 'Unknown' && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-2">
                      🏷️ 브랜드
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        AI 인식
                      </span>
                    </h4>
                    <p className="text-gray-900 font-medium">{analysisResult.brand}</p>
                  </div>
                )}

                {analysisResult.price && analysisResult.price > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-2">
                      💰 가격
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        화면 추출
                      </span>
                    </h4>
                    <p className="text-gray-900 font-bold text-lg">₩{analysisResult.price.toLocaleString()}</p>
                  </div>
                )}

                {analysisResult.colors && analysisResult.colors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">🎨 색상</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.colors.map((color, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {analysisResult.material && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🧵 소재:</span>
                  <span className="text-gray-900">{analysisResult.material}</span>
                </div>
              )}
              {analysisResult.fit && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">👔 핏:</span>
                  <span className="text-gray-900">{analysisResult.fit}</span>
                </div>
              )}
            </div>

            {analysisResult.description && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">📝 설명</h4>
                <p className="text-gray-800 text-sm">{analysisResult.description}</p>
              </div>
            )}
          </div>
        )}

        {/* 지원하는 쇼핑몰 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 text-sm mb-2 flex items-center gap-2">
            <span className="text-lg">🛍️</span>
            지원하는 쇼핑몰
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800">
            <div>• 무신사</div>
            <div>• 29cm</div>
            <div>• 브랜디</div>
            <div>• 지그재그</div>
            <div>• 스타일쉐어</div>
            <div>• 에이블리</div>
            <div>• 유니클로</div>
            <div>• 기타 쇼핑몰</div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            💡 상품 페이지 URL을 입력하면 AI가 자동으로 정보를 추출합니다
          </p>
        </div>


      </div>
    </div>
  );
};

export default ClothingItemForm; 