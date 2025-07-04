import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { cn, generateId } from '../utils';
import { analyzeClothingFromUrl, getSimpleGenerator } from '../utils/openai';
import { clothingCategories } from '../data/categories';
import type { ClothingItem, ClothingCategoryType, SimpleAnalysisResult } from '../types';

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
  const [previewItem, setPreviewItem] = useState<SimpleAnalysisResult | null>(null);
  const [autoRegister, setAutoRegister] = useState(true); // 자동 등록 설정

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue
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

  // URL 분석
  const analyzeUrl = async () => {
    const url = (document.querySelector('input[name="url"]') as HTMLInputElement)?.value;
    
    if (!url) {
      toast.error('URL을 입력해주세요');
      return;
    }

    setIsAnalyzing(true);
    toast.loading('AI가 의상을 분석하고 있습니다...', { id: 'analyzing' });

    try {
      const result = await analyzeClothingFromUrl(url);
      console.log('분석 결과:', result);
      
      if (result) {
        setPreviewItem({
          ...result,
          originalUrl: url
        });
        toast.success('의상 분석이 완료되었습니다!', { id: 'analyzing' });
        
        // 자동 등록이 활성화된 경우 바로 등록
        if (autoRegister) {
          setTimeout(() => {
            addPreviewItemAutomatically(result, url);
          }, 1000); // 1초 후 자동 등록
        }
      } else {
        toast.error('의상 분석에 실패했습니다', { id: 'analyzing' });
      }
    } catch (error) {
      console.error('분석 실패:', error);
      toast.error('의상 분석 중 오류가 발생했습니다', { id: 'analyzing' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 자동 등록 함수
  const addPreviewItemAutomatically = (result: SimpleAnalysisResult, url: string) => {
    const newItem: ClothingItem = {
      id: generateId(),
      name: result.name,
      category: result.category as ClothingCategoryType,
      brand: result.brand || 'Unknown',
      price: result.price || 0,
      imageUrl: result.imageUrl || '',
      originalUrl: url,
      description: result.description || '',
      colors: result.colors || [],
      material: result.material || '',
      fit: result.fit || '',
      sizes: [],
      tags: [],
      createdAt: new Date().toISOString()
    };

    onAddItem(newItem);
    setPreviewItem(null);
    reset();
    toast.success(`"${result.name}"이(가) 자동으로 등록되었습니다! 🎉`);
  };

  // 미리보기 아이템 추가
  const addPreviewItem = () => {
    if (!previewItem) return;

    const newItem: ClothingItem = {
      id: generateId(),
      name: previewItem.name,
      category: previewItem.category as ClothingCategoryType,
      brand: previewItem.brand || '',
      price: previewItem.price || 0,
      imageUrl: previewItem.imageUrl || '',
      originalUrl: previewItem.originalUrl || '',
      description: previewItem.description || '',
      colors: previewItem.colors || [],
      material: previewItem.material || '',
      fit: previewItem.fit || '',
      sizes: [],
      tags: [],
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
      originalUrl: data.url || '',
      description: '',
      colors: [],
      material: '',
      fit: '',
      sizes: [],
      tags: [],
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상품 URL *
            </label>
            <div className="flex gap-2">
              <input
                {...register('url')}
                type="url"
                placeholder="https://www.musinsa.com/products/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={analyzeUrl}
                disabled={isAnalyzing}
                className={cn(
                  "px-4 py-2 rounded-lg text-white font-medium transition-colors",
                  isAnalyzing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                )}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    분석중
                  </div>
                ) : (
                  '🤖 AI 분석'
                )}
              </button>
            </div>
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          {/* 자동 등록 설정 */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <input
              type="checkbox"
              id="autoRegister"
              checked={autoRegister}
              onChange={(e) => setAutoRegister(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="autoRegister" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="text-lg">⚡</span>
              분석 완료 시 자동으로 의상 목록에 추가
            </label>
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

        {/* AI 분석 결과 미리보기 */}
        {previewItem && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <span className="text-xl">✨</span>
                AI 분석 완료
              </h3>
              <div className="flex gap-2">
                {!autoRegister && (
                  <button
                    type="button"
                    onClick={addPreviewItem}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    이 의상 추가하기
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  다시 분석
                </button>
              </div>
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

                {/* 브랜드 정보 - 강화된 표시 */}
                {previewItem.brand && previewItem.brand !== 'Unknown' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">🏷️</span>
                      브랜드
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        AI 인식
                      </span>
                    </label>
                    <input
                      type="text"
                      value={previewItem.brand}
                      readOnly
                      className="w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 font-medium"
                    />
                  </div>
                )}

                {previewItem.price && previewItem.price > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      실제 가격
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        AI 추정
                      </span>
                    </label>
                    <input
                      type="text"
                      value={`₩${previewItem.price.toLocaleString()}`}
                      readOnly
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-blue-50 font-medium"
                    />
                  </div>
                )}

                {/* 새로운 속성들 */}
                {previewItem.material && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">🧵</span>
                      소재
                    </label>
                    <input
                      type="text"
                      value={previewItem.material}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                )}

                {previewItem.fit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">👔</span>
                      핏/스타일
                    </label>
                    <input
                      type="text"
                      value={previewItem.fit}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                )}

                {previewItem.colors && previewItem.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">🎨</span>
                      주요 색상
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {previewItem.colors.map((color, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {previewItem.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">📝</span>
                      스타일 설명
                    </label>
                    <textarea
                      value={previewItem.description}
                      readOnly
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* AI 분석 상태 정보 - 개선된 버전 */}
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h4 className="font-medium text-indigo-800 mb-3 flex items-center gap-2">
                <span className="text-lg">🤖</span>
                AI 분석 품질 리포트
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    previewItem.imageUrl ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-gray-700">
                    이미지: {previewItem.imageUrl ? '추출 완료' : '없음'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    previewItem.brand && previewItem.brand !== 'Unknown' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></span>
                  <span className="text-gray-700">
                    브랜드: {previewItem.brand && previewItem.brand !== 'Unknown' ? '인식 완료' : '추정'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    previewItem.price && previewItem.price > 0 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></span>
                  <span className="text-gray-700">
                    가격: {previewItem.price && previewItem.price > 0 ? '추정 완료' : '기본값'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-gray-700">GPT-4o Vision</span>
                </div>
              </div>
              
              {autoRegister && (
                <div className="mt-3 p-2 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    자동 등록이 활성화되어 있습니다. 잠시 후 자동으로 의상 목록에 추가됩니다.
                  </p>
                </div>
              )}
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