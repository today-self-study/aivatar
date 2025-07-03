import { useState } from 'react';
import { Sparkles, User, Shirt, Palette, Download, Share2, RefreshCw } from 'lucide-react';
import { cn } from '../utils';
import type { UserProfile, ClothingItem, OutfitGeneration } from '../types';

interface OutfitGeneratorProps {
  userProfile: UserProfile;
  selectedItems: ClothingItem[];
  onGenerate: (outfit: OutfitGeneration) => void;
  className?: string;
}

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export default function OutfitGenerator({ 
  userProfile, 
  selectedItems, 
  onGenerate, 
  className 
}: OutfitGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<OutfitGeneration | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps: GenerationStep[] = [
    {
      id: 'analyze',
      title: '사용자 정보 분석',
      description: '체형, 성별, 신체 정보를 분석하고 있어요',
      completed: false,
      current: false
    },
    {
      id: 'items',
      title: '의류 아이템 분석',
      description: '선택한 의류들의 스타일과 색상을 분석해요',
      completed: false,
      current: false
    },
    {
      id: 'coordinate',
      title: '코디네이션 계산',
      description: 'AI가 최적의 조합을 찾고 있어요',
      completed: false,
      current: false
    },
    {
      id: 'generate',
      title: '착장 이미지 생성',
      description: '실제 착용 모습을 그려내고 있어요',
      completed: false,
      current: false
    }
  ];

  const generateOutfit = async () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep(0);

    try {
      // 단계별 진행 시뮬레이션
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        setProgress((i + 1) / steps.length * 100);
        
        // 실제로는 OpenAI API 호출
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Mock 생성 결과
      const mockOutfit: OutfitGeneration = {
        id: Date.now().toString(),
        userProfile,
        selectedItems,
        generatedImageUrl: '/api/placeholder/400/600', // 실제로는 DALL-E 3 생성 이미지
        aiDescription: `${userProfile.gender === 'male' ? '남성' : '여성'} ${userProfile.bodyType.name} 체형에 완벽하게 어울리는 세련된 코디네이션입니다. 선택하신 아이템들이 조화롭게 어우러져 ${userProfile.height}cm 키에 최적화된 실루엣을 만들어냅니다.`,
        styleAnalysis: {
          overall: '캐주얼 시크',
          coordination: '상하 색상 대비가 돋보이는 균형감 있는 스타일링',
          recommendations: [
            '선택한 상의의 컬러가 피부톤과 잘 어울립니다',
            '하의 핏이 체형에 매우 적합합니다',
            '전체적으로 트렌디하면서도 실용적인 코디입니다'
          ]
        },
        createdAt: new Date().toISOString()
      };

      setGeneratedOutfit(mockOutfit);
      onGenerate(mockOutfit);
      
    } catch (error) {
      console.error('Outfit generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedOutfit(null);
    generateOutfit();
  };

  const handleDownload = () => {
    if (generatedOutfit) {
      // 이미지 다운로드 로직
      const link = document.createElement('a');
      link.href = generatedOutfit.generatedImageUrl;
      link.download = `outfit-${generatedOutfit.id}.jpg`;
      link.click();
    }
  };

  const handleShare = async () => {
    if (generatedOutfit && navigator.share) {
      try {
        await navigator.share({
          title: 'AI 코디 추천',
          text: generatedOutfit.aiDescription,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 착장 생성</h2>
        <p className="text-gray-600">
          선택한 의상들을 바탕으로 완벽한 코디를 만들어드려요
        </p>
      </div>

      {/* 선택된 아이템 요약 */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shirt className="w-5 h-5" />
          선택한 아이템 ({selectedItems.length}개)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                {item.category === 'tops' && '👕'}
                {item.category === 'bottoms' && '👖'}
                {item.category === 'outerwear' && '🧥'}
                {item.category === 'shoes' && '👟'}
                {item.category === 'accessories' && '👜'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">
                  {item.brand} · {item.price.toLocaleString()}원
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 사용자 정보 요약 */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          사용자 정보
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <div className="text-2xl mb-1">
              {userProfile.gender === 'male' ? '👨' : '👩'}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {userProfile.gender === 'male' ? '남성' : '여성'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <div className="text-2xl mb-1">📏</div>
            <div className="text-sm font-medium text-gray-900">
              {userProfile.height}cm
            </div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <div className="text-2xl mb-1">⚖️</div>
            <div className="text-sm font-medium text-gray-900">
              {userProfile.weight}kg
            </div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-xl">
            <div className="text-2xl mb-1">
              {userProfile.bodyType.id === 'slender' && '🏃‍♀️'}
              {userProfile.bodyType.id === 'athletic' && '💪'}
              {userProfile.bodyType.id === 'pear' && '🍐'}
              {userProfile.bodyType.id === 'apple' && '🍎'}
              {userProfile.bodyType.id === 'hourglass' && '⏳'}
              {userProfile.bodyType.id === 'rectangle' && '📐'}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {userProfile.bodyType.name}
            </div>
          </div>
        </div>
      </div>

      {/* 생성 진행 상태 */}
      {isGenerating && (
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">생성 진행 상태</h3>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 단계별 진행 상태 */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all',
                  index === currentStep 
                    ? 'bg-purple-50 border border-purple-200' 
                    : index < currentStep 
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index === currentStep 
                    ? 'bg-purple-500 text-white animate-pulse' 
                    : index < currentStep 
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                )}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {step.description}
                  </div>
                </div>
                
                {index === currentStep && (
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 생성된 결과 */}
      {generatedOutfit && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              AI 생성 결과
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="다시 생성"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="다운로드"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="공유"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 생성된 이미지 */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={generatedOutfit.generatedImageUrl}
                  alt="AI 생성 착장 이미지"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiNEMUQ1REIiLz4KPHJlY3QgeD0iMTUwIiB5PSIxNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRDFENURCIi8+CjxyZWN0IHg9IjE2MCIgeT0iMzEwIiB3aWR0aD0iMzAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRDFENURCIi8+CjxyZWN0IHg9IjIxMCIgeT0iMzEwIiB3aWR0aD0iMzAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRDFENURCIi8+CjxyZWN0IHg9IjEyMCIgeT0iMTgwIiB3aWR0aD0iMjAiIGhlaWdodD0iODAiIGZpbGw9IiNEMUQ1REIiLz4KPHJlY3QgeD0iMjYwIiB5PSIxODAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI4MCIgZmlsbD0iI0QxRDVEQiIvPgo8dGV4dCB4PSIyMDAiIHk9IjQ4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjM3MEI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BSSBHZW5lcmF0ZWQgT3V0Zml0PC90ZXh0Pgo8L3N2Zz4K';
                  }}
                />
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    스타일 분석: {generatedOutfit.styleAnalysis.overall}
                  </span>
                </div>
                <p className="text-sm text-purple-800">
                  {generatedOutfit.styleAnalysis.coordination}
                </p>
              </div>
            </div>

            {/* 분석 결과 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">AI 코디 분석</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {generatedOutfit.aiDescription}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI 추천 포인트</h4>
                <div className="space-y-2">
                  {generatedOutfit.styleAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">착용 아이템</h4>
                <div className="space-y-2">
                  {generatedOutfit.selectedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="text-gray-900 font-medium">
                        {item.price.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>총 금액</span>
                    <span className="text-purple-600">
                      {generatedOutfit.selectedItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 생성 버튼 */}
      {!isGenerating && !generatedOutfit && (
        <div className="text-center">
          <button
            onClick={generateOutfit}
            disabled={selectedItems.length === 0}
            className={cn(
              'px-8 py-4 rounded-2xl font-medium transition-all transform',
              selectedItems.length > 0
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI 착장 생성하기
            </div>
          </button>
          
          {selectedItems.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              의상을 선택한 후 생성할 수 있습니다
            </p>
          )}
        </div>
      )}
    </div>
  );
} 