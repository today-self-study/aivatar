import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Sparkles, ExternalLink, ShoppingBag } from 'lucide-react';
import { cn, generateId } from '../utils';
import { analyzeClothingFromUrl } from '../utils/openai';
import type { ClothingItem, ClothingCategoryType, SimpleAnalysisResult } from '../types';

interface ClothingItemFormProps {
  onAddItem: (item: ClothingItem) => void;
}

const ClothingItemForm: React.FC<ClothingItemFormProps> = ({ onAddItem }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewItem, setPreviewItem] = useState<SimpleAnalysisResult | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SimpleAnalysisResult | null>(null);
  const [autoRegister, setAutoRegister] = useState(true);

  // URL 분석 및 자동 등록
  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error('URL을 입력해주세요')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus('🔍 AI 분석 시작 중...')

    try {
      console.log('의상 분석 시작:', url)
      
      // 단계별 상태 업데이트
      setAnalysisStatus('📄 페이지 정보 가져오는 중...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setAnalysisStatus('🖼️ 현재 화면에서 이미지 캡처 중...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setAnalysisStatus('🤖 AI가 의상을 분석하는 중...')
      const result = await analyzeClothingFromUrl(url)
      
      setAnalysisStatus('✅ 분석 완료!')
      setAnalysisResult(result)
      console.log('분석 결과:', result)
      
      // 자동 등록이 활성화된 경우 1초 후 자동 등록
      if (autoRegister) {
        setAnalysisStatus('🚀 자동 등록 중...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        await addPreviewItemAutomatically()
      }
      
    } catch (error) {
      console.error('분석 실패:', error)
      setAnalysisStatus('❌ 분석 실패')
      toast.error('분석에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setAnalysisStatus(''), 2000)
    }
  }

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
    setPreviewItem(null);
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
      setPreviewItem(null);
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
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">현재 화면에서 즉시 처리</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            별도 탭이나 화면 공유 없이 현재 화면에서 바로 분석됩니다
          </p>
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
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-purple-700 font-medium">AI 분석 진행 중</span>
            </div>
            <div className="text-sm text-purple-600 mb-2">
              {analysisStatus}
            </div>
            <div className="text-xs text-purple-500">
              💡 현재 화면에서 자동으로 처리되고 있습니다
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
                        AI 추정
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