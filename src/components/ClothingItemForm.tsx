import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Plus, Sparkles } from 'lucide-react';
import { cn, generateId } from '../utils';
import { analyzeClothingFromUrl, getSimpleGenerator } from '../utils/openai';
import type { ClothingItem } from '../types';

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

export default function ClothingItemForm({ onSubmit, onCancel, className }: ClothingItemFormProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

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

  // URL에서 자동 분석
  const analyzeWithAI = async () => {
    if (!watchedUrl?.trim()) {
      toast.error('URL을 입력해주세요');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('URL에서 정보 추출 중...');

    try {
      const result = await analyzeClothingFromUrl(watchedUrl);
      
      setAnalysisStep('상품 정보 설정 중...');
      
      // 분석 결과로 폼 자동 채우기
      if (result.name) {
        setValue('name', result.name);
      }
      if (result.category) {
        setValue('category', result.category as any);
      }
      if (result.price) {
        setValue('price', result.price);
      }

      setAnalysisStep('완료!');
      toast.success('상품 정보가 자동으로 입력되었습니다!');
      
    } catch (error) {
      console.error('분석 실패:', error);
      toast.error('분석에 실패했습니다. 수동으로 입력해주세요.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
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

  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        
        {/* URL 입력 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            상품 URL
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                {...register('originalUrl')}
                type="url"
                placeholder="https://musinsa.com/... 또는 다른 쇼핑몰 URL"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
                  errors.originalUrl ? 'border-red-300' : 'border-gray-300'
                )}
              />
              {errors.originalUrl && (
                <p className="text-red-600 text-xs mt-1">{errors.originalUrl.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={analyzeWithAI}
              disabled={!watchedUrl || isAnalyzing}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
                watchedUrl && !isAnalyzing
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              )}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  분석중
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  자동분석
                </>
              )}
            </button>
          </div>
          
          {isAnalyzing && (
            <div className="text-sm text-purple-600 animate-pulse">
              {analysisStep}
            </div>
          )}
        </div>

        {/* 상품명 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            상품명
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="예: 오버사이즈 후드티"
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
              errors.name ? 'border-red-300' : 'border-gray-300'
            )}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* 카테고리 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            카테고리
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {CATEGORIES.map((category) => (
              <label
                key={category.value}
                className={cn(
                  'flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors',
                  watch('category') === category.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  {...register('category')}
                  type="radio"
                  value={category.value}
                  className="sr-only"
                />
                <span className="text-2xl mb-1">{category.icon}</span>
                <span className="text-xs font-medium text-gray-700">{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 가격 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            가격 (원)
          </label>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            min="0"
            step="1000"
            placeholder="50000"
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
              errors.price ? 'border-red-300' : 'border-gray-300'
            )}
          />
          {errors.price && (
            <p className="text-red-600 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>

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
} 