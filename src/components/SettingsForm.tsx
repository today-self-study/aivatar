import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { updateAIConfig, type AIApiConfig } from '../utils/openai';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils';

interface SettingsFormProps {
  onClose: () => void;
  onConfigSave?: (config: AIApiConfig) => void;
  embedded?: boolean;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ onClose, onConfigSave, embedded = false }) => {
  const [apiConfig, setApiConfig] = useLocalStorage<AIApiConfig>('ai-api-config', {
    provider: 'fallback'
  });
  
  const [formData, setFormData] = useState<AIApiConfig>(apiConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    setFormData(apiConfig);
  }, [apiConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 설정 저장
      setApiConfig(formData);
      updateAIConfig(formData);
      
      setTestResult('설정이 저장되었습니다! 이제 고품질 AI 이미지 생성을 사용할 수 있습니다.');
      
      // onConfigSave 콜백 호출
      if (onConfigSave) {
        onConfigSave(formData);
      }
      
      // embedded 모드가 아닐 때만 자동으로 닫기
      if (!embedded) {
        setTimeout(() => {
          onClose();
        }, 3000);
      }
      
    } catch (error) {
      console.error('설정 저장 실패:', error);
      setTestResult('설정 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AIApiConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testApiKey = async (provider: 'openai' | 'replicate' | 'lightx') => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const testConfig = { ...formData, provider };
      updateAIConfig(testConfig);
      
      // 간단한 테스트 요청
      if (provider === 'openai' && formData.openaiApiKey) {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${formData.openaiApiKey}`,
          },
        });
        
        if (response.ok) {
          setTestResult('✅ OpenAI API 키가 유효합니다!');
        } else {
          setTestResult('❌ OpenAI API 키가 유효하지 않습니다.');
        }
      } else if (provider === 'replicate' && formData.replicateApiKey) {
        const response = await fetch('https://api.replicate.com/v1/models', {
          headers: {
            'Authorization': `Token ${formData.replicateApiKey}`,
          },
        });
        
        if (response.ok) {
          setTestResult('✅ Replicate API 키가 유효합니다!');
        } else {
          setTestResult('❌ Replicate API 키가 유효하지 않습니다.');
        }
      } else if (provider === 'lightx' && formData.lightxApiKey) {
        // LightX API 테스트는 실제 요청 없이 형식만 확인
        if (formData.lightxApiKey.length > 10) {
          setTestResult('✅ LightX API 키 형식이 올바릅니다!');
        } else {
          setTestResult('❌ LightX API 키 형식이 올바르지 않습니다.');
        }
      } else {
        setTestResult('❌ API 키를 먼저 입력해주세요.');
      }
      
    } catch (error) {
      console.error('API 키 테스트 실패:', error);
      setTestResult('❌ API 키 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI 제공자 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI 이미지 생성 제공자
        </label>
        <select
          value={formData.provider}
          onChange={(e) => handleInputChange('provider', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="fallback">기본 (무료, 제한적)</option>
          <option value="openai">OpenAI DALL-E 3 (고품질)</option>
          <option value="replicate">Replicate (Virtual Try-On)</option>
          <option value="lightx">LightX (가상 착용)</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">
          고품질 AI 이미지 생성을 위해서는 API 키가 필요합니다.
        </p>
      </div>

      {/* OpenAI API 키 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">OpenAI DALL-E 3</h3>
          <span className="text-sm text-green-600 font-medium">추천</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API 키
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={formData.openaiApiKey || ''}
                onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                placeholder="sk-..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => testApiKey('openai')}
                disabled={isLoading || !formData.openaiApiKey}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
              >
                테스트
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• 최고 품질의 패션 이미지 생성</p>
            <p>• 1024x1792 고해상도 지원</p>
            <p>• 자연스러운 착용감 표현</p>
            <p>• 비용: 이미지당 약 $0.08</p>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              → API 키 발급받기
            </a>
          </div>
        </div>
      </div>

      {/* Replicate API 키 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Replicate</h3>
          <span className="text-sm text-purple-600 font-medium">Virtual Try-On</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API 키
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={formData.replicateApiKey || ''}
                onChange={(e) => handleInputChange('replicateApiKey', e.target.value)}
                placeholder="r8_..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => testApiKey('replicate')}
                disabled={isLoading || !formData.replicateApiKey}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300"
              >
                테스트
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• 최신 Virtual Try-On 모델 사용</p>
            <p>• 실제 착용감 시뮬레이션</p>
            <p>• OutfitAnyone 등 최신 모델 지원</p>
            <p>• 비용: 사용량에 따라 변동</p>
            <a 
              href="https://replicate.com/account/api-tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              → API 키 발급받기
            </a>
          </div>
        </div>
      </div>

      {/* LightX API 키 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">LightX</h3>
          <span className="text-sm text-orange-600 font-medium">가상 착용</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API 키
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={formData.lightxApiKey || ''}
                onChange={(e) => handleInputChange('lightxApiKey', e.target.value)}
                placeholder="lightx_..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => testApiKey('lightx')}
                disabled={isLoading || !formData.lightxApiKey}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300"
              >
                테스트
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• 빠른 의상 변경 API</p>
            <p>• 실시간 미리보기 지원</p>
            <p>• 다양한 스타일 적용</p>
            <p>• 비용: 무료 크레딧 포함</p>
            <a 
              href="https://www.lightxeditor.com/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              → API 키 발급받기
            </a>
          </div>
        </div>
      </div>

      {/* 테스트 결과 */}
      {testResult && (
        <div className={cn(
          "p-4 rounded-lg",
          testResult.includes('✅') ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        )}>
          {testResult}
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="flex justify-end space-x-4">
        {!embedded && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300"
        >
          {isLoading ? '저장 중...' : '설정 저장'}
        </button>
      </div>
    </form>
  );

  // embedded 모드일 때는 모달 래퍼 없이 폼만 반환
  if (embedded) {
    return formContent;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">AI 설정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        {formContent}
      </div>
    </div>
  );
};

export default SettingsForm; 