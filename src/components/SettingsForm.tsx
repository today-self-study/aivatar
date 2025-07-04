import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { updateAIConfig, type AIApiConfig } from '../utils/openai';
import { Eye, EyeOff, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '../utils';

interface SettingsFormProps {
  onClose: () => void;
  onConfigSave?: (config: AIApiConfig) => void;
  embedded?: boolean;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ onClose, onConfigSave, embedded = false }) => {
  const [apiConfig, setApiConfig] = useLocalStorage<AIApiConfig>('ai-api-config', {
    useAI: false
  });
  
  const [formData, setFormData] = useState<AIApiConfig>(apiConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setFormData(apiConfig);
  }, [apiConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // OpenAI API 키가 있으면 AI 사용 활성화
      const configToSave = {
        ...formData,
        useAI: !!(formData.openaiApiKey && formData.openaiApiKey.trim())
      };
      
      // 설정 저장
      setApiConfig(configToSave);
      updateAIConfig(configToSave);
      
      if (configToSave.useAI) {
        setTestResult('✅ OpenAI API가 설정되었습니다! 이제 GPT-4o Vision 의상 분석과 DALL-E 3 이미지 생성을 사용할 수 있습니다.');
      } else {
        setTestResult('⚠️ 설정이 저장되었습니다. API 키를 입력하면 더 정확한 AI 분석을 사용할 수 있습니다.');
      }
      
      // onConfigSave 콜백 호출
      if (onConfigSave) {
        onConfigSave(configToSave);
      }
      
      // embedded 모드가 아닐 때만 자동으로 닫기
      if (!embedded) {
        setTimeout(() => {
          onClose();
        }, 3000);
      }
      
    } catch (error) {
      console.error('설정 저장 실패:', error);
      setTestResult('❌ 설정 저장에 실패했습니다. 다시 시도해주세요.');
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

  const testOpenAIKey = async () => {
    if (!formData.openaiApiKey) {
      setTestResult('❌ OpenAI API 키를 먼저 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${formData.openaiApiKey}`,
        },
      });
      
      if (response.ok) {
        setTestResult('✅ OpenAI API 키가 유효합니다! GPT-4o Vision과 DALL-E 3를 사용할 수 있습니다.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestResult(`❌ OpenAI API 키가 유효하지 않습니다. (${response.status}: ${errorData.error?.message || 'Unknown error'})`);
      }
      
    } catch (error) {
      console.error('API 키 테스트 실패:', error);
      setTestResult('❌ API 키 테스트 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Sparkles className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">OpenAI API 설정</h2>
        </div>
        <p className="text-sm text-gray-600">
          GPT-4o Vision 의상 분석과 DALL-E 3 이미지 생성을 위한 API 키를 설정하세요
        </p>
      </div>

      {/* OpenAI API 키 설정 */}
      <div className="border-2 border-blue-100 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <img 
              src="https://openai.com/favicon.ico" 
              alt="OpenAI" 
              className="w-5 h-5 mr-2"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            OpenAI API
          </h3>
          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            권장
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API 키
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={formData.openaiApiKey || ''}
                onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-3 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={testOpenAIKey}
                disabled={isLoading || !formData.openaiApiKey}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                테스트
              </button>
            </div>
          </div>

          {/* 기능 설명 */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">포함된 기능:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span><strong>GPT-4o Vision:</strong> 의상 이미지 정밀 분석 (브랜드, 가격, 색상, 스타일)</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                <span><strong>DALL-E 3:</strong> 1024x1792 고해상도 Virtual Try-On 이미지 생성</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                <span><strong>자동 분석:</strong> URL에서 의상 정보 자동 추출</span>
              </div>
            </div>
          </div>

          {/* 비용 정보 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-1">💰 예상 비용</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• 의상 분석 (GPT-4o Vision): ~$0.01/분석</p>
              <p>• 이미지 생성 (DALL-E 3): ~$0.08/이미지</p>
              <p>• 월 10회 사용 시 약 $1 정도</p>
            </div>
          </div>

          {/* API 키 발급 링크 */}
          <div className="text-center">
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              OpenAI API 키 발급받기
            </a>
          </div>
        </div>
      </div>

      {/* 테스트 결과 */}
      {testResult && (
        <div className={cn(
          "p-4 rounded-lg border",
          testResult.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' :
          testResult.includes('⚠️') ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          'bg-red-50 border-red-200 text-red-800'
        )}>
          <p className="text-sm">{testResult}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3">
        {!embedded && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300",
            embedded ? "w-full" : "flex-1"
          )}
        >
          {isLoading ? '저장 중...' : '설정 저장'}
        </button>
      </div>

      {/* 무료 모드 안내 */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 API 키 없이도 기본 키워드 분석과 콜라주 생성을 사용할 수 있습니다
        </p>
      </div>
    </form>
  );

  if (embedded) {
    return <div className="space-y-4">{formContent}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {formContent}
        </div>
      </div>
    </div>
  );
};

export default SettingsForm; 