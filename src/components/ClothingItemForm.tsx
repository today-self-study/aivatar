import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Plus, Sparkles } from 'lucide-react';
import { cn, generateId } from '../utils';
import { analyzeClothingFromUrl, getSimpleGenerator } from '../utils/openai';
import type { ClothingItem } from '../types';
import { clothingCategories } from '../data/categories';
import type { ClothingCategoryType } from '../types';

// 간단한 스키마 - 필수 정보만
const clothingItemSchema = z.object({
  originalUrl: z.string()
    .min(1, '상품 URL을 입력해주세요')
    .url('올바른 URL 형식이 아닙니다'),
  name: z.string().min(1, '상품명을 입력해주세요'),
  category: z.enum(['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'] as const),
  price: z.number().min(0, '가격을 입력해주세요')
});

type ClothingItemFormType = z.infer<typeof clothingItemSchema>;

interface ClothingItemFormProps {
  onSubmit: (item: ClothingItem) => void;
  onCancel?: () => void;
  className?: string;
}

const CATEGORIES = [
  { value: 'tops', label: '상의', icon: '👕' },
  { value: 'bottoms', label: '하의', icon: '👖' },
  { value: 'outerwear', label: '아우터', icon: '🧥' },
  { value: 'shoes', label: '신발', icon: '👟' },
  { value: 'accessories', label: '액세서리', icon: '👜' }
];

const ClothingItemForm: React.FC<ClothingItemFormProps> = ({ onSubmit, onCancel, className }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<{
    name: string;
    category: ClothingCategoryType;
    imageUrl?: string;
    brand?: string;
    price?: number;
    originalUrl?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<ClothingItemFormType>({
    resolver: zodResolver(clothingItemSchema),
    defaultValues: {
      price: 50000,
      category: 'tops'
    }
  });

  const watchedUrl = watch('originalUrl');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (previewItem) {
      setPreviewItem(null);
    }
  };

  const analyzeUrl = async () => {
    if (!watchedUrl.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }

    // URL 형식 검증
    try {
      new URL(watchedUrl);
    } catch {
      setError('올바른 URL을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeClothingFromUrl(watchedUrl);
      setPreviewItem({
        ...result,
        category: result.category as ClothingCategoryType,
        originalUrl: watchedUrl
      });
    } catch (err) {
      console.error('URL 분석 실패:', err);
      setError('URL 분석에 실패했습니다. 다른 URL을 시도해보세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = async (data: ClothingItemFormType) => {
    try {
      // 이미지 추출
      const generator = getSimpleGenerator();
      const imageUrl = await generator.extractImageFromUrl(data.originalUrl);
      
      const hostname = new URL(data.originalUrl).hostname;
      const brandName = hostname.split('.')[0];
      
      const newItem: ClothingItem = {
        id: generateId(),
        name: data.name,
        brand: brandName || '브랜드',
        category: data.category,
        price: data.price,
        imageUrl: imageUrl || '',
        description: `${data.name} - ${hostname}에서 가져온 상품`,
        colors: ['기본색상'],
        sizes: ['프리사이즈'],
        tags: [data.category],
        originalUrl: data.originalUrl,
        createdAt: new Date().toISOString()
      };

      onSubmit(newItem);
      reset();
      
    } catch (error) {
      console.error('의상 추가 실패:', error);
      toast.error('의상 추가에 실패했습니다');
    }
  };

  const handleAddItem = () => {
    if (!previewItem) return;

    onSubmit({
      id: generateId(),
      name: previewItem.name,
      brand: previewItem.brand || '브랜드',
      category: previewItem.category,
      price: previewItem.price || 50000,
      imageUrl: previewItem.imageUrl || '',
      description: `${previewItem.name} - ${new URL(previewItem.originalUrl || '').hostname}에서 가져온 상품`,
      colors: ['기본색상'],
      sizes: ['프리사이즈'],
      tags: [previewItem.category],
      originalUrl: previewItem.originalUrl || '',
      createdAt: new Date().toISOString()
    });

    // 폼 초기화
    reset();
    setPreviewItem(null);
    setError(null);
  };

  const handleCategoryChange = (category: ClothingCategoryType) => {
    if (previewItem) {
      setPreviewItem({
        ...previewItem,
        category
      });
    }
  };

  const handleNameChange = (name: string) => {
    if (previewItem) {
      setPreviewItem({
        ...previewItem,
        name
      });
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🛍️ 의상 추가
          </h2>
          <p className="text-gray-600">
            쇼핑몰 URL을 입력하면 AI가 자동으로 의상 정보를 분석합니다
          </p>
        </div>

        {/* URL 입력 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            의상 URL
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                {...register('originalUrl')}
                type="url"
                placeholder="예: https://store.example.com/product/123"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
                  errors.originalUrl ? 'border-red-300' : 'border-gray-300'
                )}
                value={watchedUrl}
                onChange={handleUrlChange}
              />
              {errors.originalUrl && (
                <p className="text-red-600 text-xs mt-1">{errors.originalUrl.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={analyzeUrl}
              disabled={!watchedUrl || isAnalyzing}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
                watchedUrl && !isAnalyzing
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              )}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  분석중
                </div>
              ) : (
                '분석'
              )}
            </button>
          </div>
          
          {/* URL 예시 */}
          <div className="mt-2 text-xs text-gray-500">
            <p>지원하는 URL 형식:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>쇼핑몰 상품 페이지 URL</li>
              <li>직접 이미지 URL (.jpg, .png, .gif, .webp)</li>
              <li>브랜드 공식 온라인 스토어 URL</li>
            </ul>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 분석 결과 미리보기 */}
        {previewItem && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              📋 분석 결과
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 이미지 미리보기 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 미리보기
                </label>
                {previewItem.imageUrl ? (
                  <div className="relative">
                    <img
                      src={previewItem.imageUrl}
                      alt={previewItem.name}
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E1QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTVBRiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      ✓ 이미지 포함
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm">이미지 없음</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 정보 수정 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품명
                  </label>
                  <input
                    type="text"
                    value={previewItem.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리
                  </label>
                                     <select
                     value={previewItem.category}
                     onChange={(e) => handleCategoryChange(e.target.value as ClothingCategoryType)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   >
                     {clothingCategories.map((category) => (
                       <option key={category.id} value={category.id}>
                         {category.icon} {category.displayName}
                       </option>
                     ))}
                   </select>
                </div>

                {previewItem.brand && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      브랜드
                    </label>
                    <input
                      type="text"
                      value={previewItem.brand}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                )}

                {previewItem.price && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      예상 가격
                    </label>
                    <input
                      type="text"
                      value={`₩${previewItem.price.toLocaleString()}`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">AI 분석 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    previewItem.imageUrl ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  이미지: {previewItem.imageUrl ? '포함됨' : '없음'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                  카테고리: 자동 분류됨
                </div>
              </div>
            </div>

            {/* 추가 버튼 */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAddItem}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ✓ 의상 추가
              </button>
            </div>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isAnalyzing}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
              isSubmitting || isAnalyzing
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                추가 중...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                의상 추가
              </>
            )}
          </button>
        </div>

        {/* 도움말 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 text-sm mb-2">
            💡 사용 팁
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 무신사, 29cm, 브랜디 등 주요 쇼핑몰 URL 지원</li>
            <li>• 자동분석 버튼으로 상품 정보 자동 입력</li>
            <li>• 분석이 안 되면 수동으로 입력해도 됩니다</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default ClothingItemForm; 