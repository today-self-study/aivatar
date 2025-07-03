import { User, UserX } from 'lucide-react';
import type { Gender } from '../types';

interface GenderSelectorProps {
  selectedGender: Gender | null;
  onGenderSelect: (gender: Gender) => void;
}

export default function GenderSelector({ selectedGender, onGenderSelect }: GenderSelectorProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">성별을 선택해주세요</h2>
        <p className="text-gray-600">
          성별에 따라 더 정확한 체형 분석과 코디 추천을 제공합니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 남성 선택 */}
        <button
          onClick={() => onGenderSelect('male')}
          className={`
            relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
            ${selectedGender === 'male' 
              ? 'border-blue-500 bg-blue-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }
          `}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                p-3 rounded-full
                ${selectedGender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">남성</h3>
                <p className="text-sm text-gray-600">Male</p>
              </div>
            </div>
            {selectedGender === 'male' && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            남성 체형에 맞는 코디 추천과 피팅 분석을 제공합니다
          </p>
        </button>

        {/* 여성 선택 */}
        <button
          onClick={() => onGenderSelect('female')}
          className={`
            relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
            ${selectedGender === 'female' 
              ? 'border-pink-500 bg-pink-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }
          `}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                p-3 rounded-full
                ${selectedGender === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                <UserX size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">여성</h3>
                <p className="text-sm text-gray-600">Female</p>
              </div>
            </div>
            {selectedGender === 'female' && (
              <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            여성 체형에 맞는 코디 추천과 피팅 분석을 제공합니다
          </p>
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          선택한 성별 정보는 더 정확한 체형 분석을 위해서만 사용됩니다
        </p>
      </div>
    </div>
  );
} 