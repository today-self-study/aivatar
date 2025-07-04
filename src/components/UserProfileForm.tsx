import { useState } from 'react';
import { User, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../utils';

interface UserProfileFormProps {
  onComplete: (gender: string, bodyType: string) => void;
  onBack: () => void;
}

const genderOptions = [
  { id: 'male', name: '남성', icon: '👨' },
  { id: 'female', name: '여성', icon: '👩' }
];

const bodyTypeOptions = [
  { id: 'slender', name: '슬렌더', icon: '🏃‍♀️', description: '마른 체형' },
  { id: 'athletic', name: '애슬레틱', icon: '💪', description: '운동선수형' },
  { id: 'pear', name: '배 체형', icon: '🍐', description: '하체가 발달된 체형' },
  { id: 'apple', name: '사과 체형', icon: '🍎', description: '상체가 발달된 체형' },
  { id: 'hourglass', name: '모래시계', icon: '⏳', description: '균형 잡힌 체형' },
  { id: 'rectangle', name: '직사각형', icon: '📐', description: '직선적인 체형' }
];

export default function UserProfileForm({
  onComplete,
  onBack
}: UserProfileFormProps) {
  const [currentStep, setCurrentStep] = useState<'gender' | 'bodyType'>('gender');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState(false);

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    setCurrentStep('bodyType');
  };

  const handleBodyTypeSelect = (bodyType: string) => {
    setSelectedBodyType(bodyType);
  };

  const handleComplete = async () => {
    if (!selectedGender || !selectedBodyType) return;
    
    setIsCompleting(true);
    
    try {
      // 간단한 로딩 효과
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete(selectedGender, selectedBodyType);
    } catch (error) {
      console.error('프로필 완성 중 오류:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const canComplete = selectedGender && selectedBodyType;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">간단한 정보 입력</h2>
          <p className="text-gray-600 mt-2">
            AI가 더 정확한 코디를 추천하기 위해 기본 정보를 알려주세요
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              currentStep === 'gender' || selectedGender
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-500'
            )}>
              {selectedGender ? <Check className="w-4 h-4" /> : <span className="w-4 h-4 bg-purple-600 rounded-full" />}
              성별 선택
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              currentStep === 'bodyType' || selectedBodyType
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-500'
            )}>
              {selectedBodyType ? <Check className="w-4 h-4" /> : <span className="w-4 h-4 bg-purple-600 rounded-full" />}
              체형 선택
            </div>
          </div>
        </div>

        {/* 성별 선택 */}
        {currentStep === 'gender' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                성별을 선택해주세요
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {genderOptions.map((gender) => (
                  <button
                    key={gender.id}
                    onClick={() => handleGenderSelect(gender.id)}
                    className={cn(
                      'p-6 rounded-xl border-2 transition-all hover:scale-105',
                      selectedGender === gender.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    )}
                  >
                    <div className="text-4xl mb-2">{gender.icon}</div>
                    <div className="font-medium">{gender.name}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 뒤로가기 버튼 */}
            <div className="flex justify-center pt-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전 단계</span>
              </button>
            </div>
          </div>
        )}

        {/* 체형 선택 */}
        {currentStep === 'bodyType' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                체형을 선택해주세요
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {bodyTypeOptions.map((bodyType) => (
                  <button
                    key={bodyType.id}
                    onClick={() => handleBodyTypeSelect(bodyType.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all hover:scale-105',
                      selectedBodyType === bodyType.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    )}
                  >
                    <div className="text-3xl mb-2">{bodyType.icon}</div>
                    <div className="font-medium text-sm">{bodyType.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{bodyType.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 네비게이션 버튼들 */}
            <div className="flex justify-between items-center pt-6">
              <button
                onClick={() => setCurrentStep('gender')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>성별 다시 선택</span>
              </button>

              {/* 완료 버튼 */}
              {selectedBodyType && (
                <button
                  onClick={handleComplete}
                  disabled={!canComplete || isCompleting}
                  className={cn(
                    'flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all',
                    canComplete && !isCompleting
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  )}
                >
                  {isCompleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      완료 중...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      프로필 완성
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 선택된 정보 요약 (하단) */}
        {(selectedGender || selectedBodyType) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">선택한 정보</h4>
            <div className="flex flex-wrap gap-3">
              {selectedGender && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm">
                  <span className="text-lg">
                    {selectedGender === 'male' ? '👨' : '👩'}
                  </span>
                  {selectedGender === 'male' ? '남성' : '여성'}
                </div>
              )}
              {selectedBodyType && (
                <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm">
                  <span className="text-lg">
                    {bodyTypeOptions.find(bt => bt.id === selectedBodyType)?.icon}
                  </span>
                  {bodyTypeOptions.find(bt => bt.id === selectedBodyType)?.name}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 