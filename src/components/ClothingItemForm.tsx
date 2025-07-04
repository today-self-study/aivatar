import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { cn, generateId } from '../utils';
import { analyzeClothingFromUrl, getSimpleGenerator } from '../utils/openai';
import { clothingCategories } from '../data/categories';
import type { ClothingItem, ClothingCategoryType } from '../types';

// 간단한 스키마 - 필수 정보만
const clothingSchema = z.object({
  url: z.string().url('올바른 URL을 입력해주세요'),
  name: z.string().min(1, '의상 이름을 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  brand: z.string().optional(),
  price: z.number().min(0).optional(),
  imageUrl: z.string().optional(),
});

type ClothingFormData = z.infer<typeof clothingSchema>;

interface ClothingItemFormProps {
  onAddItem: (item: ClothingItem) => void;
}

const ClothingItemForm: React.FC<ClothingItemFormProps> = ({ onAddItem }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<{
    name: string;
    category: ClothingCategoryType;
    brand?: string;
    price?: number;
    imageUrl?: string;
    originalUrl: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<ClothingFormData>({
    resolver: zodResolver(clothingSchema),
    defaultValues: {
      url: '',
      name: '',
      category: '',
      brand: '',
      price: undefined,
      imageUrl: ''
    }
  });

  const watchedUrl = watch('url');

  // URL 분석 함수
  const analyzeUrl = async () => {
    if (!watchedUrl) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const generator = getSimpleGenerator();
      const result = await analyzeClothingFromUrl(watchedUrl, generator);
      
      if (result.success && result.data) {
        setPreviewItem({
          name: result.data.name,
          category: result.data.category as ClothingCategoryType,
          brand: result.data.brand,
          price: result.data.price,
          imageUrl: result.data.imageUrl,
          originalUrl: watchedUrl
        });
        toast.success('의상 정보가 분석되었습니다!');
      } else {
        setError(result.error || '의상 정보를 분석할 수 없습니다.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 미리보기 아이템 추가
  const addPreviewItem = () => {
    if (!previewItem) return;

    const newItem: ClothingItem = {
      id: generateId(),
      name: previewItem.name,
      category: previewItem.category,
      brand: previewItem.brand || '',
      price: previewItem.price || 0,
      imageUrl: previewItem.imageUrl || '',
      url: previewItem.originalUrl,
      createdAt: new Date().toISOString()
    };

    onAddItem(newItem);
    setPreviewItem(null);
    reset();
  };

  // 폼 제출
  const onSubmit = (data: ClothingFormData) => {
    const newItem: ClothingItem = {
      id: generateId(),
      name: data.name,
      category: data.category as ClothingCategoryType,
      brand: data.brand || '',
      price: data.price || 0,
      imageUrl: data.imageUrl || '',
      url: data.url,
      createdAt: new Date().toISOString()
    };

    onAddItem(newItem);
    reset();
    toast.success('의상이 추가되었습니다!');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5" />
        새 의상 추가
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* URL 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상품 URL
          </label>
          <div className="flex gap-2">
            <input
              {...register('url')}
              type="url"
              placeholder="https://example.com/product/123"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">분석 결과</h3>
              <button
                type="button"
                onClick={addPreviewItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                이 의상 추가하기
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 이미지 미리보기 */}
              {previewItem.imageUrl && (
                <div>
                  <img 
                    src={previewItem.imageUrl} 
                    alt={previewItem.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* 정보 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    의상 이름
                  </label>
                  <input
                    type="text"
                    value={previewItem.name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리
                  </label>
                  <select
                    value={previewItem.category}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    {clothingCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
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
          </div>
        )}

        {/* 수동 입력 폼 */}
        {!previewItem && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                의상 이름 *
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="예: 화이트 셔츠"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">카테고리 선택</option>
                {clothingCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                브랜드
              </label>
              <input
                {...register('brand')}
                type="text"
                placeholder="예: 유니클로"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가격
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                placeholder="예: 29000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 URL
              </label>
              <input
                {...register('imageUrl')}
                type="url"
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* 제출 버튼 */}
        {!previewItem && (
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            의상 추가하기
          </button>
        )}

        {/* 사용 팁 */}
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