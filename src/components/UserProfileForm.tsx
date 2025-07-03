import { useState } from 'react';
import { User, Ruler, Weight } from 'lucide-react';
import type { UserProfile, BodyType } from '../types';
import { cn, calculateBMI, getBMICategory, generateId } from '../utils';

interface UserProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  selectedBodyType: BodyType | null;
  className?: string;
}

export default function UserProfileForm({
  onSubmit,
  selectedBodyType,
  className
}: UserProfileFormProps) {
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bmi = calculateBMI(height, weight);
  const bmiCategory = getBMICategory(bmi);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBodyType) {
      alert('체형을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userProfile: UserProfile = {
        id: generateId(),
        height,
        weight,
        bodyType: selectedBodyType,
        createdAt: new Date()
      };

      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 효과
      onSubmit(userProfile);
    } catch (error) {
      console.error('프로필 생성 중 오류:', error);
      alert('프로필 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">신체 정보 입력</h2>
          <p className="text-gray-600 mt-2">
            정확한 3D 아바타 생성을 위해 신체 정보를 입력해주세요.
          </p>
        </div>

        {/* 키 입력 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Ruler className="w-4 h-4" />
            키 (cm)
          </label>
          <div className="relative">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min="120"
              max="220"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="170"
            />
            <div className="absolute right-3 top-2 text-gray-500 text-sm">cm</div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>120cm</span>
            <span>220cm</span>
          </div>
          <input
            type="range"
            min="120"
            max="220"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 몸무게 입력 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Weight className="w-4 h-4" />
            몸무게 (kg)
          </label>
          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              min="30"
              max="200"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="65"
            />
            <div className="absolute right-3 top-2 text-gray-500 text-sm">kg</div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>30kg</span>
            <span>200kg</span>
          </div>
          <input
            type="range"
            min="30"
            max="200"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* BMI 정보 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">BMI 정보</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary-600">
                {bmi.toFixed(1)}
              </span>
              <span className="text-gray-600 ml-2">({bmiCategory})</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">정상 범위</div>
              <div className="text-sm font-medium">18.5 - 24.9</div>
            </div>
          </div>
        </div>

        {/* 선택된 체형 정보 */}
        {selectedBodyType && (
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
            <h3 className="font-medium text-primary-900 mb-2">선택한 체형</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {selectedBodyType.id === 'slender' && '🏃‍♀️'}
                {selectedBodyType.id === 'athletic' && '💪'}
                {selectedBodyType.id === 'pear' && '🍐'}
                {selectedBodyType.id === 'apple' && '🍎'}
                {selectedBodyType.id === 'hourglass' && '⏳'}
                {selectedBodyType.id === 'rectangle' && '📐'}
              </div>
              <div>
                <div className="font-medium text-primary-900">
                  {selectedBodyType.name}
                </div>
                <div className="text-sm text-primary-700">
                  {selectedBodyType.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!selectedBodyType || isSubmitting}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-medium transition-colors',
            'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            selectedBodyType && !isSubmitting
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              아바타 생성 중...
            </div>
          ) : (
            '3D 아바타 생성하기'
          )}
        </button>

        {/* 도움말 텍스트 */}
        <div className="text-center text-sm text-gray-500">
          <p>
            입력한 정보는 3D 아바타 생성에만 사용되며,<br />
            브라우저에 안전하게 저장됩니다.
          </p>
        </div>
      </form>
    </div>
  );
} 