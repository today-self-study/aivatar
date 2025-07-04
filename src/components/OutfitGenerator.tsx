import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, Download, Share2, Image, Palette, User, Shirt } from 'lucide-react';
import { cn } from '../utils';
import { getSimpleGenerator } from '../utils/openai';
import type { Gender, BodyType, ClothingItem, OutfitGeneration } from '../types';

interface OutfitGeneratorProps {
  selectedGender: Gender | null;
  selectedBodyType: BodyType | null;
  selectedItems: ClothingItem[];
  onGenerate: (outfit: OutfitGeneration) => void;
  className?: string;
}

export default function OutfitGenerator({ 
  selectedGender,
  selectedBodyType,
  selectedItems, 
  onGenerate, 
  className 
}: OutfitGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedGender || !selectedBodyType) {
      toast.error('성별과 체형을 선택해주세요');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('코디에 사용할 의상을 선택해주세요');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('AI가 코디를 분석하고 있습니다...');

    try {
      const generator = getSimpleGenerator();
      
      setGenerationStep('완벽한 착장을 생성하고 있습니다...');
      
      // 간단한 프로필 정보로 이미지 생성
      const imageUrl = await generator.generateOutfitImage(
        {
          gender: selectedGender,
          bodyType: selectedBodyType.name
        },
        selectedItems.map(item => ({
          name: item.name,
          category: item.category,
          imageUrl: item.imageUrl
        }))
      );

      setGeneratedImage(imageUrl);
      setGenerationStep('코디 완성!');

      // 생성된 코디 정보 생성
      const outfit: OutfitGeneration = {
        id: `outfit-${Date.now()}`,
        userProfile: {
          id: `profile-${Date.now()}`,
          gender: selectedGender,
          height: 170, // 기본값
          weight: 65,  // 기본값
          bodyType: selectedBodyType
        },
        selectedItems,
        generatedImageUrl: imageUrl,
        aiDescription: `${selectedGender === 'male' ? '남성' : '여성'} ${selectedBodyType.name} 체형을 위한 ${selectedItems.map(item => item.name).join(', ')} 코디입니다.`,
        styleAnalysis: {
          overall: '모던 캐주얼',
          coordination: '선택하신 아이템들이 조화롭게 어우러진 스타일입니다.',
          recommendations: [
            '색상 조합이 잘 어울립니다',
            '체형에 맞는 핏으로 선택되었습니다',
            '스타일이 일관성 있게 매치되었습니다'
          ]
        },
        createdAt: new Date().toISOString()
      };

      onGenerate(outfit);
      toast.success('멋진 코디가 완성되었습니다!');

    } catch (error) {
      console.error('코디 생성 실패:', error);
      toast.error('코디 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `aivatar-outfit-${Date.now()}.png`;
    link.click();
    toast.success('이미지가 다운로드되었습니다!');
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AIVATAR 코디',
          text: '이 멋진 코디를 확인해보세요!',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('링크가 복사되었습니다!');
      }
    } catch (error) {
      console.error('공유 실패:', error);
      toast.error('공유에 실패했습니다');
    }
  };

  const canGenerate = selectedGender && selectedBodyType && selectedItems.length > 0;

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      <div className="space-y-8">
        
        {/* 헤더 */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">AI 코디 생성</h2>
          <p className="text-gray-600">
            선택한 의상들로 완벽한 코디를 만들어드려요
          </p>
        </div>

        {/* 프로필 정보 */}
        {(selectedGender || selectedBodyType) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              프로필 정보
            </h3>
            <div className="flex gap-4">
              {selectedGender && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg">
                  <span className="text-lg">
                    {selectedGender === 'male' ? '👨' : '👩'}
                  </span>
                  {selectedGender === 'male' ? '남성' : '여성'}
                </div>
              )}
              {selectedBodyType && (
                <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-lg">
                  <span className="text-lg">
                    {selectedBodyType.id === 'slender' && '🏃‍♀️'}
                    {selectedBodyType.id === 'athletic' && '💪'}
                    {selectedBodyType.id === 'pear' && '🍐'}
                    {selectedBodyType.id === 'apple' && '🍎'}
                    {selectedBodyType.id === 'hourglass' && '⏳'}
                    {selectedBodyType.id === 'rectangle' && '📐'}
                  </span>
                  {selectedBodyType.name}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 선택된 의상 미리보기 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shirt className="w-6 h-6 text-purple-600" />
            선택된 의상 ({selectedItems.length}개)
          </h3>
          
          {selectedItems.length === 0 ? (
            <div className="text-center py-8">
              <Shirt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">코디에 사용할 의상을 선택해주세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                    )}
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 truncate">{item.name}</div>
                      <div className="text-gray-500 text-xs">{item.brand}</div>
                      <div className="text-purple-600 font-medium text-xs">
                        {item.price.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div>
                  <div className="font-medium text-purple-900">
                    총 {selectedItems.length}개 아이템
                  </div>
                  <div className="text-sm text-purple-700">
                    총 가격: {selectedItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}원
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className={cn(
                    'px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2',
                    canGenerate && !isGenerating
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  )}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      코디 생성
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 생성 진행 상태 */}
        {isGenerating && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">AI가 코디를 생성하고 있습니다</div>
                <div className="text-sm text-purple-600 animate-pulse">{generationStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* 생성된 이미지 */}
        {generatedImage && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Image className="w-6 h-6 text-green-600" />
                생성된 코디
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="다운로드"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="공유"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={generatedImage} 
                alt="생성된 코디"
                className="w-full max-w-md mx-auto rounded-xl shadow-lg"
              />
              
              {/* 이미지 오버레이 정보 */}
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-3 text-white">
                <div className="text-sm font-medium">
                  {selectedGender === 'male' ? '남성' : '여성'} • {selectedBodyType?.name}
                </div>
                <div className="text-xs opacity-90">
                  {selectedItems.length}개 아이템 • {selectedItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}원
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 도움말 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            💡 코디 생성 팁
          </h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• 다양한 카테고리의 의상을 선택하면 더 완성도 높은 코디가 생성됩니다</li>
            <li>• 색상과 스타일이 조화로운 아이템들을 선택해보세요</li>
            <li>• 생성된 이미지는 다운로드하거나 공유할 수 있습니다</li>
            <li>• 마음에 들지 않으면 다른 의상 조합으로 다시 시도해보세요</li>
          </ul>
        </div>

      </div>
    </div>
  );
} 