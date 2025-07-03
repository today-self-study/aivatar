import { useState } from 'react';
import { bodyTypes } from '../data/bodyTypes';
import type { BodyType } from '../types';
import { cn } from '../utils';

interface BodyTypeSelectorProps {
  selectedBodyType: BodyType | null;
  onBodyTypeSelect: (bodyType: BodyType) => void;
  className?: string;
}

export default function BodyTypeSelector({ 
  selectedBodyType, 
  onBodyTypeSelect, 
  className 
}: BodyTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <div className={cn('w-full', className)}>
      <h2 className="text-2xl font-bold text-center mb-6">체형을 선택해주세요</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {bodyTypes.map((bodyType) => (
          <div
            key={bodyType.id}
            className={cn(
              'relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-300',
              'hover:shadow-lg hover:scale-105',
              selectedBodyType?.id === bodyType.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            )}
            onClick={() => onBodyTypeSelect(bodyType)}
            onMouseEnter={() => setHoveredType(bodyType.id)}
            onMouseLeave={() => setHoveredType(null)}
          >
            {/* 체형 아이콘 영역 */}
            <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
              <div className="text-6xl">
                {bodyType.id === 'slender' && '🏃‍♀️'}
                {bodyType.id === 'athletic' && '💪'}
                {bodyType.id === 'pear' && '🍐'}
                {bodyType.id === 'apple' && '🍎'}
                {bodyType.id === 'hourglass' && '⏳'}
                {bodyType.id === 'rectangle' && '📐'}
              </div>
            </div>
            
            {/* 체형 이름 */}
            <h3 className="font-semibold text-lg text-center mb-2">
              {bodyType.name}
            </h3>
            
            {/* 체형 설명 */}
            <p className="text-sm text-gray-600 text-center">
              {bodyType.description}
            </p>
            
            {/* 선택 표시 */}
            {selectedBodyType?.id === bodyType.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            {/* 호버 효과 */}
            {hoveredType === bodyType.id && (
              <div className="absolute inset-0 bg-primary-500 bg-opacity-5 rounded-lg pointer-events-none" />
            )}
          </div>
        ))}
      </div>
      
      {/* 선택된 체형 상세 정보 */}
      {selectedBodyType && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">선택한 체형: {selectedBodyType.name}</h4>
          <p className="text-sm text-gray-600 mb-3">{selectedBodyType.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">가슴둘레:</span> {selectedBodyType.measurements.chest}cm
            </div>
            <div>
              <span className="font-medium">허리둘레:</span> {selectedBodyType.measurements.waist}cm
            </div>
            <div>
              <span className="font-medium">엉덩이둘레:</span> {selectedBodyType.measurements.hip}cm
            </div>
            <div>
              <span className="font-medium">어깨너비:</span> {selectedBodyType.measurements.shoulderWidth}cm
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 