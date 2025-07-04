import React, { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Plus, Sparkles, Shirt, Settings } from 'lucide-react'
import { cn } from './utils'
import { useLocalStorage } from './hooks/useLocalStorage'
import { VersionInfo } from './components/VersionInfo'
import ClothingItemForm from './components/ClothingItemForm'
import OutfitGenerator from './components/OutfitGenerator'
import UserProfileForm from './components/UserProfileForm'
import SettingsForm from './components/SettingsForm'
import { initializeSimpleGenerator, updateAIConfig, type AIApiConfig } from './utils/openai'
import type { 
  ClothingItem, 
  OutfitGeneration, 
  Gender, 
  BodyType
} from './types'

// 4단계 플로우: API 설정 → 의상 추가 → 프로필 설정 → 코디 생성
type AppStep = 'api-setup' | 'add-clothes' | 'profile' | 'generate'

function App() {
  // 상태 관리
  const [currentStep, setCurrentStep] = useState<AppStep>('api-setup')
  const [clothingItems, setClothingItems] = useLocalStorage<ClothingItem[]>('clothing-items', [])
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  
  // AI 설정 상태
  const [aiConfig, setAiConfig] = useLocalStorage<AIApiConfig>('ai-api-config', { useAI: false })

  // 로컬 스토리지에서 프로필 정보 로드
  const [profileData] = useLocalStorage<{ gender?: string; bodyType?: string }>('user-profile', {})

  // 초기화 함수
  React.useEffect(() => {
    // AI 설정 적용
    updateAIConfig(aiConfig)
    initializeSimpleGenerator()
    
    // 저장된 프로필 데이터가 있으면 로드
    if (profileData?.gender) {
      setSelectedGender(profileData.gender as Gender)
    }
    if (profileData?.bodyType) {
      setSelectedBodyType(profileData.bodyType as any)
    }
    
    // API 키가 설정되어 있으면 의상 추가 단계로 이동
    if (aiConfig.openaiApiKey && currentStep === 'api-setup') {
      setCurrentStep('add-clothes')
    }
  }, [profileData, aiConfig])

  // AI 설정 완료 핸들러
  const handleAIConfigComplete = (config: AIApiConfig) => {
    console.log('AI 설정 완료:', config)
    setAiConfig(config)
    updateAIConfig(config)
    setCurrentStep('add-clothes')
    toast.success('AI 설정이 완료되었습니다!')
  }

  // 의상 아이템 추가
  const handleAddClothingItem = (item: ClothingItem) => {
    setClothingItems([...clothingItems, item])
    toast.success('의상이 추가되었습니다!')
  }

  // 의상 아이템 삭제
  const handleDeleteClothingItem = (index: number) => {
    const newItems = clothingItems.filter((_, i) => i !== index)
    setClothingItems(newItems)
    toast.success('의상이 삭제되었습니다!')
  }

  // 성별 선택
  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender)
  }

  // 프로필 완료
  const handleProfileComplete = (gender: string, bodyType: string) => {
    setSelectedGender(gender as Gender)
    setSelectedBodyType(bodyType as any)
    setCurrentStep('generate')
    toast.success('프로필이 설정되었습니다!')
  }

  // 프로필 단계에서 뒤로가기
  const handleProfileBack = () => {
    setCurrentStep('add-clothes')
  }

  // 단계 진행 체크
  const hasAPIKey = aiConfig.openaiApiKey && aiConfig.useAI
  const canProceedToAddClothes = hasAPIKey
  const canProceedToProfile = clothingItems.length > 0
  const canProceedToGenerate = selectedGender && selectedBodyType

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Toaster position="top-right" />
      
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AIVATAR
              </h1>
              <span className="text-sm text-gray-500">AI Virtual Try-On</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="설정"
              >
                <Settings className="w-5 h-5" />
              </button>
              <VersionInfo />
            </div>
          </div>
        </div>
      </header>

      {/* 진행 상태 표시 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6">
              {/* 1단계: API 설정 */}
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'api-setup' 
                    ? "bg-purple-600 text-white" 
                    : hasAPIKey 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                )}>
                  {hasAPIKey ? '✓' : '1'}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  currentStep === 'api-setup' ? "text-purple-600" : "text-gray-500"
                )}>
                  AI 설정
                </span>
              </div>

              {/* 2단계: 의상 추가 */}
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'add-clothes' 
                    ? "bg-purple-600 text-white" 
                    : canProceedToProfile 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                )}>
                  {canProceedToProfile ? '✓' : '2'}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  currentStep === 'add-clothes' ? "text-purple-600" : "text-gray-500"
                )}>
                  의상 추가
                </span>
              </div>

              {/* 3단계: 프로필 설정 */}
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'profile' 
                    ? "bg-purple-600 text-white" 
                    : canProceedToGenerate 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                )}>
                  {canProceedToGenerate ? '✓' : '3'}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  currentStep === 'profile' ? "text-purple-600" : "text-gray-500"
                )}>
                  프로필 설정
                </span>
              </div>

              {/* 4단계: 코디 생성 */}
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'generate' 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-500"
                )}>
                  4
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  currentStep === 'generate' ? "text-purple-600" : "text-gray-500"
                )}>
                  Virtual Try-On
                </span>
              </div>
            </div>

            {/* 단계 이동 버튼 */}
            <div className="flex items-center space-x-2">
              {currentStep === 'api-setup' && (
                <button
                  onClick={() => setCurrentStep('add-clothes')}
                  disabled={!canProceedToAddClothes}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    canProceedToAddClothes
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  )}
                >
                  다음 단계
                </button>
              )}

              {currentStep === 'add-clothes' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentStep('api-setup')}
                    className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentStep('profile')}
                    disabled={!canProceedToProfile}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors",
                      canProceedToProfile
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    다음 단계
                  </button>
                </div>
              )}
              
              {currentStep === 'profile' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentStep('add-clothes')}
                    className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentStep('generate')}
                    disabled={!canProceedToGenerate}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors",
                      canProceedToGenerate
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    다음 단계
                  </button>
                </div>
              )}
              
              {currentStep === 'generate' && (
                <button
                  onClick={() => setCurrentStep('profile')}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  이전
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 의상 목록 (API 설정 단계가 아닐 때만 표시) */}
          {currentStep !== 'api-setup' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Shirt className="w-5 h-5" />
                    내 의상 ({clothingItems.length})
                  </h2>
                  <button
                    onClick={() => setCurrentStep('add-clothes')}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {clothingItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                        {item.brand && <p className="text-xs text-purple-600">{item.brand}</p>}
                        {item.price && <p className="text-xs text-green-600">{item.price.toLocaleString()}원</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteClothingItem(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  
                  {clothingItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Shirt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>아직 추가된 의상이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 오른쪽: 현재 단계 컨텐츠 */}
          <div className={cn(
            currentStep === 'api-setup' ? 'lg:col-span-3' : 'lg:col-span-2'
          )}>
            {currentStep === 'api-setup' && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">AI 설정</h2>
                  <p className="text-gray-600">
                    AI 기반 의상 분석과 Virtual Try-On 기능을 사용하려면 API 키가 필요합니다.
                  </p>
                </div>
                <SettingsForm 
                  onClose={() => {}} 
                  onConfigSave={handleAIConfigComplete}
                  embedded={true}
                />
              </div>
            )}
            
            {currentStep === 'add-clothes' && (
              <ClothingItemForm onAddItem={handleAddClothingItem} />
            )}
            
            {currentStep === 'profile' && (
              <UserProfileForm
                onComplete={handleProfileComplete}
                onBack={handleProfileBack}
              />
            )}
            
            {currentStep === 'generate' && (
              <OutfitGenerator
                selectedItems={clothingItems}
                userProfile={{ gender: selectedGender as string, bodyType: selectedBodyType as any }}
                onOpenSettings={() => setShowSettings(true)}
              />
            )}
          </div>
        </div>
      </main>

      {/* 설정 모달 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <SettingsForm 
              onClose={() => setShowSettings(false)} 
              onConfigSave={(config) => {
                setAiConfig(config)
                updateAIConfig(config)
                setShowSettings(false)
                toast.success('설정이 저장되었습니다!')
              }}
            />
          </div>
        </div>
      )}

      {/* 사용 가이드 */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h4 className="font-semibold text-gray-800 mb-2">💡 사용 가이드</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {currentStep === 'api-setup' && (
              <>
                <p>• OpenAI API 키를 입력하면 AI 의상 분석 기능을 사용할 수 있습니다</p>
                <p>• API 키 없이도 기본 기능은 사용 가능합니다</p>
                <p>• 더 정확한 분석을 위해 API 키 설정을 권장합니다</p>
              </>
            )}
            {currentStep === 'add-clothes' && (
              <>
                <p>• 온라인 쇼핑몰 상품 URL을 입력하세요</p>
                <p>• 여러 의상을 추가할 수 있습니다</p>
                <p>• '분석' 버튼으로 AI가 의상을 자동 분석합니다</p>
              </>
            )}
            {currentStep === 'profile' && (
              <>
                <p>• 성별과 체형을 선택하세요</p>
                <p>• 더 정확한 AI 추천을 위해 필요합니다</p>
              </>
            )}
            {currentStep === 'generate' && (
              <>
                {aiConfig.openaiApiKey ? (
                  <>
                    <p>• 🎉 AI 기능이 활성화되었습니다!</p>
                    <p>• 실제 AI가 의상을 분석하고 고품질 이미지를 생성합니다</p>
                  </>
                ) : (
                  <>
                    <p>• AI 설정에서 API 키를 등록하면 고품질 이미지를 생성할 수 있습니다</p>
                    <p>• 기준 이미지를 업로드하면 더 정확한 결과를 얻을 수 있습니다</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-medium text-gray-900">처리 중...</span>
            </div>
            <p className="text-gray-600 text-sm">잠시만 기다려주세요</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
