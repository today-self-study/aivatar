import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Key, Eye, EyeOff, Settings, CheckCircle } from 'lucide-react';
import { cn } from '../utils';
import type { SettingsForm as SettingsFormType, AISettings } from '../types';

const settingsSchema = z.object({
  openaiApiKey: z.string()
    .min(1, 'API Key를 입력해주세요')
    .min(10, 'API Key가 너무 짧습니다')
    .startsWith('sk-', 'OpenAI API Key는 sk-로 시작해야 합니다'),
  model: z.enum(['gpt-4', 'gpt-4-turbo', 'dall-e-3'] as const)
});

interface SettingsFormProps {
  onSubmit: (settings: AISettings) => void;
  initialSettings?: AISettings;
  className?: string;
}

export default function SettingsForm({ onSubmit, initialSettings, className }: SettingsFormProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<SettingsFormType>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      openaiApiKey: initialSettings?.openaiApiKey || '',
      model: initialSettings?.model || 'gpt-4'
    },
    mode: 'onChange'
  });

  const apiKey = watch('openaiApiKey');

  const handleFormSubmit = async (data: SettingsFormType) => {
    setIsConnecting(true);
    
    try {
      // API Key 유효성 검증 (실제로는 OpenAI API 호출)
      await new Promise(resolve => setTimeout(resolve, 1500)); // 임시 지연
      
      onSubmit({
        ...data,
        maxTokens: 4000
      });
    } catch (error) {
      console.error('Settings submission failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 설정</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            AI 기반 코디 추천을 위해<br />
            OpenAI API Key를 설정해주세요
          </p>
        </div>

        {/* API Key 입력 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            OpenAI API Key
          </label>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
              {...register('openaiApiKey')}
              type={showApiKey ? 'text' : 'password'}
              placeholder="sk-..."
              className={cn(
                'w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl',
                'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'transition-all duration-200 text-sm',
                errors.openaiApiKey 
                  ? 'border-red-300 bg-red-50' 
                  : apiKey && isValid 
                    ? 'border-green-300 bg-green-50'
                    : 'bg-gray-50 hover:bg-white focus:bg-white'
              )}
            />
            
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKey ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>

            {apiKey && isValid && (
              <div className="absolute inset-y-0 right-8 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>

          {errors.openaiApiKey && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-600 rounded-full"></span>
              {errors.openaiApiKey.message}
            </p>
          )}
          
          {!errors.openaiApiKey && apiKey && (
            <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              유효한 API Key 형식입니다
            </p>
          )}
        </div>

        {/* 모델 선택 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            AI 모델
          </label>
          
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'gpt-4', label: 'GPT-4', desc: '가장 정확한 분석' },
              { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', desc: '빠르고 효율적' },
              { value: 'dall-e-3', label: 'DALL-E 3', desc: '이미지 생성 특화' }
            ].map((model) => (
              <label 
                key={model.value}
                className={cn(
                  'flex items-center p-3 border rounded-xl cursor-pointer transition-all',
                  'hover:bg-gray-50 hover:border-gray-300'
                )}
              >
                <input
                  {...register('model')}
                  type="radio"
                  value={model.value}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{model.label}</div>
                  <div className="text-xs text-gray-500">{model.desc}</div>
                </div>
                <div className={cn(
                  'w-4 h-4 border-2 rounded-full transition-all',
                  watch('model') === model.value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                )}>
                  {watch('model') === model.value && (
                    <div className="w-full h-full bg-white rounded-full scale-50"></div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* API Key 가이드 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 text-sm mb-2">
            📖 API Key 발급 방법
          </h4>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>OpenAI 웹사이트 회원가입</li>
            <li>API Keys 페이지에서 새 키 생성</li>
            <li>생성된 키를 복사하여 입력</li>
          </ol>
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 text-xs underline mt-2 inline-block hover:text-blue-800"
          >
            OpenAI API Keys 페이지 →
          </a>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!isValid || isConnecting}
          className={cn(
            'w-full py-3 px-4 rounded-xl font-medium transition-all duration-200',
            'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            isValid && !isConnecting
              ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          )}
        >
          {isConnecting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              연결 중...
            </div>
          ) : (
            '설정 완료'
          )}
        </button>

        {/* 보안 안내 */}
        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            🔒 API Key는 브라우저에만 저장되며,<br />
            외부로 전송되지 않습니다
          </p>
        </div>
      </form>
    </div>
  );
} 