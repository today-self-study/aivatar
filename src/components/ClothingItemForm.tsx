import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Plus, Sparkles, ShoppingBag, AlertCircle } from 'lucide-react';
import { cn } from '../utils';
import type { ClothingItem, ImageAnalysisResult } from '../types';

const clothingItemSchema = z.object({
  originalUrl: z.string()
    .min(1, '상품 URL을 입력해주세요')
    .url('올바른 URL 형식이 아닙니다')
    .refine(url => {
      const domain = url.toLowerCase();
      return domain.includes('musinsa') || 
             domain.includes('29cm') || 
             domain.includes('무신사') ||
             domain.includes('스타일쉐어') ||
             domain.includes('styleshare') ||
             domain.includes('brandi') ||
             domain.includes('zigzag') ||
             domain.includes('coupang') ||
             domain.includes('gmarket') ||
             domain.includes('11st') ||
             domain.includes('auction') ||
             domain.includes('wconcept') ||
             domain.includes('lookbook') ||
             domain.includes('uniqlo') ||
             domain.includes('zara') ||
             domain.includes('hm.com') ||
             domain.includes('adidas') ||
             domain.includes('nike');
    }, '지원되는 쇼핑몰 URL을 입력해주세요'),
  category: z.enum(['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'] as const),
  name: z.string().min(1, '상품명을 입력해주세요'),
  brand: z.string().min(1, '브랜드명을 입력해주세요'),
  price: z.number().min(0, '가격을 입력해주세요'),
  description: z.string().min(1, '상품 설명을 입력해주세요'),
  colors: z.array(z.string()).min(1, '최소 하나의 색상을 선택해주세요'),
  sizes: z.array(z.string()).min(1, '최소 하나의 사이즈를 선택해주세요'),
  tags: z.array(z.string()).optional()
});

type ClothingItemFormType = z.infer<typeof clothingItemSchema>;

interface ClothingItemFormProps {
  onSubmit: (item: ClothingItem) => void;
  onCancel?: () => void;
  className?: string;
}

const COLORS = [
  { value: '블랙', label: '블랙', color: '#000000' },
  { value: '화이트', label: '화이트', color: '#FFFFFF' },
  { value: '그레이', label: '그레이', color: '#808080' },
  { value: '네이비', label: '네이비', color: '#000080' },
  { value: '베이지', label: '베이지', color: '#F5F5DC' },
  { value: '브라운', label: '브라운', color: '#A0522D' },
  { value: '레드', label: '레드', color: '#FF0000' },
  { value: '블루', label: '블루', color: '#0000FF' },
  { value: '그린', label: '그린', color: '#008000' },
  { value: '옐로우', label: '옐로우', color: '#FFFF00' },
  { value: '핑크', label: '핑크', color: '#FFC0CB' },
  { value: '퍼플', label: '퍼플', color: '#800080' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '프리사이즈'];

const CATEGORIES = [
  { value: 'tops', label: '상의', icon: '👕' },
  { value: 'bottoms', label: '하의', icon: '👖' },
  { value: 'outerwear', label: '아우터', icon: '🧥' },
  { value: 'shoes', label: '신발', icon: '👟' },
  { value: 'accessories', label: '액세서리', icon: '👜' }
];

export default function ClothingItemForm({ onSubmit, onCancel, className }: ClothingItemFormProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ClothingItemFormType>({
    resolver: zodResolver(clothingItemSchema),
    defaultValues: {
      colors: [],
      sizes: [],
      tags: []
    }
  });

  const watchedUrl = watch('originalUrl');

  const analyzeWithAI = async () => {
    if (!watchedUrl) return;

    setIsAnalyzing(true);
    try {
      // 실제로는 OpenAI API를 통해 URL 분석
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock 분석 결과
      const mockResult: ImageAnalysisResult = {
        name: '오버핏 기본 티셔츠',
        brand: '무신사 스탠다드',
        category: 'tops',
        description: '시원한 면 소재의 오버핏 반팔 티셔츠입니다.',
        estimatedPrice: 29000,
        colors: ['화이트', '블랙', '네이비'],
        tags: ['캐주얼', '기본템', '면100%']
      };

      setAnalysisResult(mockResult);
      
      // 폼에 자동 입력
      setValue('name', mockResult.name);
      setValue('brand', mockResult.brand);
      setValue('category', mockResult.category);
      setValue('description', mockResult.description);
      setValue('price', mockResult.estimatedPrice);
      setValue('colors', mockResult.colors);
      setValue('tags', mockResult.tags);
      
      setSelectedColors(mockResult.colors);
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleColorToggle = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    
    setSelectedColors(newColors);
    setValue('colors', newColors);
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    
    setSelectedSizes(newSizes);
    setValue('sizes', newSizes);
  };

  const handleFormSubmit = (data: ClothingItemFormType) => {
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      ...data,
      tags: data.tags || [], // undefined일 경우 빈 배열로 설정
      imageUrl: '', // 실제로는 이미지 URL 추출
      createdAt: new Date().toISOString(),
      githubIssueNumber: undefined
    };

    onSubmit(newItem);
    reset();
    setSelectedColors([]);
    setSelectedSizes([]);
    setAnalysisResult(null);
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-pink-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">의상 추가</h2>
          <p className="text-gray-600 text-sm">
            온라인 쇼핑몰 링크를 입력하면 AI가 자동으로 분석해드려요
          </p>
        </div>

        {/* URL 입력 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            상품 URL
          </label>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
              {...register('originalUrl')}
              type="url"
              placeholder="https://..."
              className={cn(
                'w-full pl-10 pr-24 py-3 border border-gray-200 rounded-xl',
                'focus:ring-2 focus:ring-pink-500 focus:border-transparent',
                'transition-all duration-200 text-sm bg-gray-50 hover:bg-white focus:bg-white',
                errors.originalUrl && 'border-red-300 bg-red-50'
              )}
            />
            
            <button
              type="button"
              onClick={analyzeWithAI}
              disabled={!watchedUrl || isAnalyzing}
              className={cn(
                'absolute inset-y-0 right-0 pr-3 flex items-center gap-1',
                'text-sm font-medium transition-all',
                watchedUrl && !isAnalyzing
                  ? 'text-pink-600 hover:text-pink-700'
                  : 'text-gray-400'
              )}
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? '분석중...' : 'AI 분석'}
            </button>
          </div>

          {errors.originalUrl && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.originalUrl.message}
            </p>
          )}

          {/* 지원 쇼핑몰 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 font-medium mb-1">지원 쇼핑몰</p>
            <p className="text-xs text-blue-700">
              무신사, 29CM, 스타일쉐어, 브랜디, 지그재그, 쿠팡, 지마켓, 11번가, 더블유컨셉, 유니클로, 자라, H&M, 아디다스, 나이키 등
            </p>
          </div>
        </div>

        {/* AI 분석 결과 표시 */}
        {analysisResult && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">AI 분석 완료</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">상품명:</span>
                <span className="ml-2 font-medium">{analysisResult.name}</span>
              </div>
              <div>
                <span className="text-gray-600">브랜드:</span>
                <span className="ml-2 font-medium">{analysisResult.brand}</span>
              </div>
              <div>
                <span className="text-gray-600">카테고리:</span>
                <span className="ml-2 font-medium">
                  {CATEGORIES.find(c => c.value === analysisResult.category)?.label}
                </span>
              </div>
              <div>
                <span className="text-gray-600">예상 가격:</span>
                <span className="ml-2 font-medium">{analysisResult.estimatedPrice.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        )}

        {/* 카테고리 선택 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            카테고리
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(category => (
              <label key={category.value} className="cursor-pointer">
                <input
                  {...register('category')}
                  type="radio"
                  value={category.value}
                  className="sr-only"
                />
                <div className={cn(
                  'p-3 border-2 rounded-xl text-center transition-all',
                  watch('category') === category.value
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}>
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-sm font-medium">{category.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 기본 정보 입력 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              상품명
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="상품명을 입력해주세요"
              className={cn(
                'w-full px-3 py-2 border border-gray-200 rounded-lg',
                'focus:ring-2 focus:ring-pink-500 focus:border-transparent',
                'text-sm bg-gray-50 hover:bg-white focus:bg-white',
                errors.name && 'border-red-300 bg-red-50'
              )}
            />
            {errors.name && (
              <p className="text-red-600 text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              브랜드
            </label>
            <input
              {...register('brand')}
              type="text"
              placeholder="브랜드명을 입력해주세요"
              className={cn(
                'w-full px-3 py-2 border border-gray-200 rounded-lg',
                'focus:ring-2 focus:ring-pink-500 focus:border-transparent',
                'text-sm bg-gray-50 hover:bg-white focus:bg-white',
                errors.brand && 'border-red-300 bg-red-50'
              )}
            />
            {errors.brand && (
              <p className="text-red-600 text-xs">{errors.brand.message}</p>
            )}
          </div>
        </div>

        {/* 가격 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            가격
          </label>
          <div className="relative">
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              placeholder="0"
              className={cn(
                'w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg',
                'focus:ring-2 focus:ring-pink-500 focus:border-transparent',
                'text-sm bg-gray-50 hover:bg-white focus:bg-white',
                errors.price && 'border-red-300 bg-red-50'
              )}
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">
              원
            </span>
          </div>
          {errors.price && (
            <p className="text-red-600 text-xs">{errors.price.message}</p>
          )}
        </div>

        {/* 색상 선택 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            색상
          </label>
          
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map(color => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleColorToggle(color.value)}
                className={cn(
                  'p-2 border-2 rounded-lg text-center transition-all',
                  selectedColors.includes(color.value)
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-1 border"
                  style={{ backgroundColor: color.color }}
                />
                <div className="text-xs">{color.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 사이즈 선택 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            사이즈
          </label>
          
          <div className="flex flex-wrap gap-2">
            {SIZES.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={cn(
                  'px-3 py-1 border-2 rounded-lg text-sm transition-all',
                  selectedSizes.includes(size)
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 상품 설명 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            상품 설명
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="상품에 대한 간단한 설명을 입력해주세요"
            className={cn(
              'w-full px-3 py-2 border border-gray-200 rounded-lg',
              'focus:ring-2 focus:ring-pink-500 focus:border-transparent',
              'text-sm bg-gray-50 hover:bg-white focus:bg-white resize-none',
              errors.description && 'border-red-300 bg-red-50'
            )}
          />
          {errors.description && (
            <p className="text-red-600 text-xs">{errors.description.message}</p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          )}
          
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            의상 추가하기
          </button>
        </div>
      </form>
    </div>
  );
} 