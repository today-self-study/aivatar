import React, { useState, useRef } from 'react';
import { Sparkles, Download, Share2, Settings, Wand2, Image as ImageIcon } from 'lucide-react';
import { getVirtualTryOnGenerator } from '../utils/openai';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface OutfitGeneratorProps {
  selectedItems: { name: string; category: string; imageUrl?: string }[];
  userProfile: { gender: string; bodyType: string };
  onOpenSettings: () => void;
}

const OutfitGenerator: React.FC<OutfitGeneratorProps> = ({
  selectedItems,
  userProfile,
  onOpenSettings
}) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [basePersonImage, setBasePersonImage] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [apiConfig] = useLocalStorage('ai-api-config', { provider: 'fallback' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasValidItems = selectedItems.some(item => item.imageUrl);

  const handlePersonImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBasePersonImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateOutfit = async () => {
    if (!hasValidItems) {
      setError('의상 이미지가 필요합니다. 이미지가 포함된 URL을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setGenerationStatus('AI 모델 초기화 중...');

    try {
      const generator = getVirtualTryOnGenerator();
      
      // 의상 이미지 검증 및 전처리
      setGenerationStatus('의상 이미지 분석 중...');
      const itemsWithImages = selectedItems.filter(item => item.imageUrl);
      
      if (itemsWithImages.length === 0) {
        throw new Error('의상 이미지가 필요합니다. 이미지가 포함된 URL을 입력해주세요.');
      }

      // 각 의상 이미지 유효성 검사
      setGenerationStatus('의상 이미지 로드 확인 중...');
      const validatedItems = [];
      
      for (const item of itemsWithImages) {
        try {
          // 이미지 로드 테스트
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = item.imageUrl!;
          });
          
          validatedItems.push(item);
        } catch (imgError) {
          console.warn(`이미지 로드 실패: ${item.name}`, imgError);
          // 실패한 이미지는 제외하고 계속 진행
        }
      }

      if (validatedItems.length === 0) {
        throw new Error('유효한 의상 이미지가 없습니다. 다른 URL을 시도해주세요.');
      }

      // AI 생성 시작
      const providerName = apiConfig.provider === 'fallback' ? '무료 모드' : 
                          apiConfig.provider === 'openai' ? 'OpenAI DALL-E 3' :
                          apiConfig.provider === 'replicate' ? 'Replicate' :
                          'LightX';
      
      setGenerationStatus(`${providerName}로 Virtual Try-On 생성 중...`);
      
      if (apiConfig.provider !== 'fallback') {
        setGenerationStatus(`${providerName} API 호출 중... (최대 2분 소요)`);
      }

      const result = await generator.generateVirtualTryOn(
        userProfile,
        validatedItems,
        basePersonImage || undefined
      );

      setGenerationStatus('생성 완료!');
      setGeneratedImage(result);
      
    } catch (err) {
      console.error('코디 생성 실패:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      
      // 사용자 친화적인 오류 메시지 변환
      if (errorMessage.includes('API 키')) {
        setError(`${errorMessage} 설정에서 API 키를 확인해주세요.`);
      } else if (errorMessage.includes('이미지')) {
        setError('의상 이미지 처리에 실패했습니다. 다른 이미지 URL을 시도해주세요.');
      } else if (errorMessage.includes('네트워크') || errorMessage.includes('fetch')) {
        setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      } else {
        setError(`생성 실패: ${errorMessage}`);
      }
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `aivatar-outfit-${Date.now()}.png`;
    link.click();
  };

  const shareImage = async () => {
    if (!generatedImage) return;
    
    try {
      if (navigator.share) {
        // 이미지를 blob으로 변환
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], 'aivatar-outfit.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'AIVATAR AI Virtual Try-On',
          text: 'AI로 생성한 가상 착용 이미지',
          files: [file]
        });
      } else {
        // 폴백: 클립보드에 복사
        await navigator.clipboard.writeText(generatedImage);
        alert('이미지 URL이 클립보드에 복사되었습니다!');
      }
    } catch (err) {
      console.error('공유 실패:', err);
      alert('공유에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">AI Virtual Try-On</h2>
                <p className="text-gray-600">실제 착용감을 확인해보세요</p>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>AI 설정</span>
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 설정 및 컨트롤 */}
          <div className="space-y-6">
            {/* 프로필 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">프로필 정보</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">성별:</span>
                  <span className="font-medium">{userProfile.gender === 'male' ? '남성' : '여성'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">체형:</span>
                  <span className="font-medium">{userProfile.bodyType}</span>
                </div>
              </div>
            </div>

            {/* 기준 이미지 업로드 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">기준 이미지 (선택사항)</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  본인의 사진을 업로드하면 더 정확한 가상 착용 결과를 얻을 수 있습니다.
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePersonImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="person-image-upload"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>이미지 업로드</span>
                  </label>
                  {basePersonImage && (
                    <span className="text-sm text-green-600">✅ 이미지 업로드됨</span>
                  )}
                </div>
                {basePersonImage && (
                  <div className="mt-3">
                    <img
                      src={basePersonImage}
                      alt="기준 이미지"
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 선택된 의상 목록 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">선택된 의상</h3>
              {selectedItems.length === 0 ? (
                <p className="text-gray-500 text-sm">의상을 먼저 추가해주세요</p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={generateOutfit}
              disabled={isGenerating || !hasValidItems}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 ${
                isGenerating || !hasValidItems ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI 생성 중...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Virtual Try-On 생성</span>
                </>
              )}
            </button>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">💡 사용 팁</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 실제 의상 이미지가 있으면 더 정확한 결과를 얻을 수 있습니다</li>
                <li>• 기준 이미지를 업로드하면 개인 맞춤형 결과를 제공합니다</li>
                <li>• AI 설정에서 API 키를 등록하면 고품질 이미지를 생성할 수 있습니다</li>
                <li>• 생성된 이미지는 다운로드하거나 공유할 수 있습니다</li>
              </ul>
            </div>
          </div>

          {/* 오른쪽: 생성된 이미지 */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 min-h-[600px] flex items-center justify-center">
              {generatedImage ? (
                <div className="text-center">
                  <img
                    src={generatedImage}
                    alt="생성된 코디 이미지"
                    className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg mx-auto"
                  />
                  <div className="mt-4 flex justify-center space-x-3">
                    <button
                      onClick={downloadImage}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>다운로드</span>
                    </button>
                    <button
                      onClick={shareImage}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>공유</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    AI Virtual Try-On 대기 중
                  </h3>
                  <p className="text-gray-500 text-sm">
                    의상을 선택하고 'Virtual Try-On 생성' 버튼을 클릭하세요
                  </p>
                </div>
              )}
            </div>

            {/* 기능 설명 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">🚀 AI Virtual Try-On 기능</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-500">•</span>
                  <span><strong>OpenAI DALL-E 3:</strong> 최고 품질의 패션 이미지 생성</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-500">•</span>
                  <span><strong>Replicate:</strong> 최신 Virtual Try-On 모델 활용</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-500">•</span>
                  <span><strong>LightX:</strong> 빠른 가상 착용 시뮬레이션</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-500">•</span>
                  <span><strong>무료 모드:</strong> 기본 이미지 생성 (API 키 불필요)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitGenerator; 