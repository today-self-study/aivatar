import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
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
  const [analysisProgress, setAnalysisProgress] = useState<string>('');

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
    if (!watchedUrl) {
      toast.error('URL을 먼저 입력해주세요');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress('웹페이지 내용을 가져오는 중...');
    
    try {
      // 실제 OpenAI API를 통한 분석
      const { getOpenAI } = await import('../utils/openai');
      const openaiUtils = getOpenAI();
      
      if (!openaiUtils) {
        toast.error('AI 설정을 먼저 완료해주세요');
        return;
      }

      setAnalysisProgress('AI가 상품 정보를 분석하는 중...');
      const result = await openaiUtils.analyzeClothingFromUrl(watchedUrl);
      
      setAnalysisResult(result);
      setAnalysisProgress('분석 결과를 적용하는 중...');
      
      // 폼에 자동 입력
      setValue('name', result.name);
      setValue('brand', result.brand);
      setValue('category', result.category);
      setValue('description', result.description);
      setValue('price', result.estimatedPrice);
      setValue('tags', result.tags);
      
      // 색상 자동 선택
      setSelectedColors(result.colors);
      setValue('colors', result.colors);
      
      setAnalysisProgress('');
      toast.success('AI 분석이 완료되었습니다!');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisProgress('');
      
      const errorMessage = error instanceof Error ? error.message : 'AI 분석에 실패했습니다';
      toast.error(errorMessage);
      
      // 실패 시 기본 URL 패턴 분석으로 폴백
      try {
        setAnalysisProgress('URL 패턴을 분석하는 중...');
        const url = watchedUrl.toLowerCase();
        let estimatedBrand = '브랜드명';
        let estimatedCategory: 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories' = 'tops';
        
        if (url.includes('uniqlo')) estimatedBrand = '유니클로';
        else if (url.includes('zara')) estimatedBrand = '자라';
        else if (url.includes('hm') || url.includes('h&m')) estimatedBrand = 'H&M';
        else if (url.includes('musinsa')) estimatedBrand = '무신사';
        else if (url.includes('nike')) estimatedBrand = '나이키';
        else if (url.includes('adidas')) estimatedBrand = '아디다스';
        
        if (url.includes('pants') || url.includes('jean') || url.includes('trouser')) estimatedCategory = 'bottoms';
        else if (url.includes('jacket') || url.includes('coat') || url.includes('outer')) estimatedCategory = 'outerwear';
        else if (url.includes('shoe') || url.includes('sneaker') || url.includes('boot')) estimatedCategory = 'shoes';
        else if (url.includes('bag') || url.includes('watch') || url.includes('accessory')) estimatedCategory = 'accessories';

        setValue('brand', estimatedBrand);
        setValue('category', estimatedCategory);
        
        setAnalysisProgress('');
        toast.success('URL 패턴 분석이 완료되었습니다. 나머지 정보를 입력해주세요.');
        
      } catch (fallbackError) {
        setAnalysisProgress('');
        toast.error('URL 분석에 실패했습니다. 수동으로 입력해주세요.');
      }
      
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
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
    // 유효성 검사
    if (selectedColors.length === 0) {
      toast.error('최소 하나의 색상을 선택해주세요');
      return;
    }
    
    if (selectedSizes.length === 0) {
      toast.error('최소 하나의 사이즈를 선택해주세요');
      return;
    }

    const newItem: ClothingItem = {
      id: `clothing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      colors: selectedColors,
      sizes: selectedSizes,
      tags: data.tags || [],
      imageUrl: '', // 추후 이미지 업로드 기능 추가 시 사용
      createdAt: new Date().toISOString(),
      githubIssueNumber: undefined // GitHub 이슈 연동 제거
    };

    try {
      onSubmit(newItem);
      
      // 폼 초기화
      reset();
      setSelectedColors([]);
      setSelectedSizes([]);
      setAnalysisResult(null);
      
      toast.success('의상이 성공적으로 추가되었습니다!');
    } catch (error) {
      console.error('Failed to add clothing item:', error);
      toast.error('의상 추가 중 오류가 발생했습니다');
    }
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
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                  분석중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI 분석
                </>
              )}
            </button>
          </div>

          {/* 분석 진행 상황 표시 */}
          {analysisProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-sm text-blue-800">{analysisProgress}</span>
              </div>
            </div>
          )}

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
            색상 <span className="text-red-500">*</span>
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
          
          {selectedColors.length > 0 && (
            <div className="text-sm text-gray-600">
              선택된 색상: {selectedColors.join(', ')}
            </div>
          )}
        </div>

        {/* 사이즈 선택 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            사이즈 <span className="text-red-500">*</span>
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
          
          {selectedSizes.length > 0 && (
            <div className="text-sm text-gray-600">
              선택된 사이즈: {selectedSizes.join(', ')}
            </div>
          )}
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