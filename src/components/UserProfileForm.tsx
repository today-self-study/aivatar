import { useState } from 'react';
import { User, Check, ArrowRight } from 'lucide-react';
import type { Gender, BodyType } from '../types';
import { cn } from '../utils';
import GenderSelector from './GenderSelector';
import BodyTypeSelector from './BodyTypeSelector';

interface UserProfileFormProps {
  selectedGender: Gender | null;
  selectedBodyType: BodyType | null;
  onGenderSelect: (gender: Gender) => void;
  onBodyTypeSelect: (bodyType: BodyType) => void;
  onComplete: () => void;
  className?: string;
}

export default function UserProfileForm({
  selectedGender,
  selectedBodyType,
  onGenderSelect,
  onBodyTypeSelect,
  onComplete,
  className
}: UserProfileFormProps) {
  const [currentStep, setCurrentStep] = useState<'gender' | 'bodyType'>('gender');
  const [isCompleting, setIsCompleting] = useState(false);

  const handleGenderSelect = (gender: Gender) => {
    onGenderSelect(gender);
    setCurrentStep('bodyType');
  };

  const handleBodyTypeSelect = (bodyType: BodyType) => {
    onBodyTypeSelect(bodyType);
  };

  const handleComplete = async () => {
    if (!selectedGender || !selectedBodyType) return;
    
    setIsCompleting(true);
    
    try {
      // 간단한 로딩 효과
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete();
    } catch (error) {
      console.error('프로필 완성 중 오류:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const canComplete = selectedGender && selectedBodyType;

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
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
              <GenderSelector
                selectedGender={selectedGender}
                onGenderSelect={handleGenderSelect}
              />
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
              <BodyTypeSelector
                selectedBodyType={selectedBodyType}
                onBodyTypeSelect={handleBodyTypeSelect}
              />
            </div>

            {/* 완료 버튼 */}
            {selectedBodyType && (
              <div className="flex justify-center pt-6">
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
              </div>
            )}
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
      </div>
    </div>
  );
} 