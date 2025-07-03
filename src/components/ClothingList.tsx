import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { clothingItems } from '../data/clothingItems';
import { clothingCategories } from '../data/categories';
import type { ClothingItem, ClothingCategoryType } from '../types';
import { cn, formatPrice } from '../utils';

interface ClothingListProps {
  selectedCategory: ClothingCategoryType | 'all';
  onCategoryChange: (category: ClothingCategoryType | 'all') => void;
  onItemSelect: (item: ClothingItem) => void;
  selectedItems: ClothingItem[];
  className?: string;
}

export default function ClothingList({
  selectedCategory,
  onCategoryChange,
  onItemSelect,
  selectedItems,
  className
}: ClothingListProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const filteredItems = selectedCategory === 'all' 
    ? clothingItems 
    : clothingItems.filter(item => item.category.id === selectedCategory);

  const isItemSelected = (item: ClothingItem) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* 카테고리 필터 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">의류 아이템</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('all')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            전체
          </button>
          
          {clothingCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id as ClothingCategoryType)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              {category.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* 아이템 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300',
              'hover:shadow-lg hover:scale-105',
              isItemSelected(item) && 'ring-2 ring-primary-500'
            )}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => onItemSelect(item)}
          >
            {/* 추천 배지 */}
            {item.isRecommended && (
              <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-medium z-10">
                추천
              </div>
            )}
            
            {/* 선택 표시 */}
            {isItemSelected(item) && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center z-10">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* 상품 이미지 */}
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <div className="text-4xl">
                {item.category.id === 'tops' && '👕'}
                {item.category.id === 'bottoms' && '👖'}
                {item.category.id === 'shoes' && '👟'}
                {item.category.id === 'accessories' && '⌚'}
                {item.category.id === 'outerwear' && '🧥'}
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-medium">{item.brand}</span>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                  {item.category.displayName}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">
                {item.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary-600">
                  {formatPrice(item.price, item.currency)}
                </span>
                
                {/* 외부 링크 */}
                <a
                  href={item.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
              
              {/* 색상 옵션 */}
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">색상:</span>
                  <div className="flex gap-1">
                    {item.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color === '화이트' ? '#ffffff' : color === '블랙' ? '#000000' : '#94a3b8' }}
                      />
                    ))}
                    {item.colors.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.colors.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 사이즈 정보 */}
              <div className="mt-2">
                <span className="text-sm text-gray-500">사이즈: </span>
                <span className="text-sm">{item.sizes.join(', ')}</span>
              </div>
            </div>

            {/* 호버 효과 */}
            {hoveredItem === item.id && (
              <div className="absolute inset-0 bg-primary-500 bg-opacity-5 pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {/* 선택된 아이템들 요약 */}
      {selectedItems.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">선택한 아이템 ({selectedItems.length}개)</h4>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <div key={item.id} className="bg-white px-3 py-1 rounded-full text-sm border">
                {item.name}
              </div>
            ))}
          </div>
          <div className="mt-2 text-right">
            <span className="text-lg font-bold text-primary-600">
              총 {formatPrice(selectedItems.reduce((sum, item) => sum + item.price, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 