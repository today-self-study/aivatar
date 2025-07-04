import React, { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Plus, Sparkles, Shirt, User, Check, Wand2 } from 'lucide-react'
import { cn } from './utils'
import { useLocalStorage } from './hooks/useLocalStorage'
import { VersionInfo } from './components/VersionInfo'
import ClothingItemForm from './components/ClothingItemForm'
import OutfitGenerator from './components/OutfitGenerator'
import UserProfileForm from './components/UserProfileForm'
import SettingsForm from './components/SettingsForm'
import { initializeSimpleGenerator } from './utils/openai'
import type { 
  ClothingItem, 
  OutfitGeneration, 
  Gender, 
  BodyType
} from './types'

// 간단한 3단계 플로우
type AppStep = 'add-clothes' | 'profile' | 'generate'

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('add-clothes')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // 간단한 프로필 (성별, 체형만)
  const [selectedGender, setSelectedGender] = useLocalStorage<Gender | null>('aivatar-selected-gender', null)
  const [selectedBodyType, setSelectedBodyType] = useLocalStorage<BodyType | null>('aivatar-selected-body-type', null)
  const [clothingItems, setClothingItems] = useLocalStorage<ClothingItem[]>('aivatar-clothing-items', [])
  const [selectedItems, setSelectedItems] = useLocalStorage<ClothingItem[]>('aivatar-selected-items', [])
  const [generatedOutfits, setGeneratedOutfits] = useLocalStorage<OutfitGeneration[]>('aivatar-generated-outfits', [])

  // 무료 API 초기화
  React.useEffect(() => {
    initializeSimpleGenerator()
  }, [])

  const handleClothingItemAdd = (item: ClothingItem) => {
    try {
      setIsLoading(true)
      const newItems = [...clothingItems, item]
      setClothingItems(newItems)
      toast.success('의상이 추가되었습니다!')
    } catch (error) {
      console.error('Failed to add clothing item:', error)
      toast.error('의상 추가에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemSelect = (item: ClothingItem) => {
    const isSelected = selectedItems.find(i => i.id === item.id)
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender)
  }

  const handleBodyTypeSelect = (bodyType: BodyType) => {
    setSelectedBodyType(bodyType)
  }

  const handleOutfitGenerate = async (outfit: OutfitGeneration) => {
    setGeneratedOutfits([outfit, ...generatedOutfits])
    toast.success('멋진 코디가 완성되었습니다!')
  }

  const handleReset = () => {
    setCurrentStep('add-clothes')
    setSelectedGender(null)
    setSelectedBodyType(null)
    setSelectedItems([])
    toast.success('처음부터 다시 시작합니다')
  }

  const handleProfileComplete = (gender: string, bodyType: string) => {
    setSelectedGender(gender as Gender)
    setSelectedBodyType(bodyType as BodyType)
    setCurrentStep('generate')
  }

  const getStepInfo = () => {
    switch (currentStep) {
      case 'add-clothes':
        return { title: '의상 추가', description: '코디에 사용할 의상들을 추가해보세요', progress: 33 }
      case 'profile':
        return { title: '간단한 정보', description: '성별과 체형을 선택해주세요', progress: 66 }
      case 'generate':
        return { title: 'AI 코디 생성', description: 'AI가 완벽한 코디를 만들어드려요', progress: 100 }
      default:
        return { title: '', description: '', progress: 0 }
    }
  }

  const stepInfo = getStepInfo()
  const canGoToProfile = clothingItems.length > 0
  const canGenerate = selectedGender && selectedBodyType && selectedItems.length > 0

  const steps = [
    { 
      id: 'add-clothes', 
      label: '의상 추가', 
      icon: Plus, 
      enabled: true,
      completed: clothingItems.length > 0
    },
    { 
      id: 'profile', 
      label: '기본 정보', 
      icon: User, 
      enabled: canGoToProfile,
      completed: selectedGender && selectedBodyType
    },
    { 
      id: 'generate', 
      label: 'AI 코디', 
      icon: Sparkles, 
      enabled: canGenerate,
      completed: false
    }
  ]

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
            <VersionInfo />
          </div>
        </div>
      </header>

      {/* 진행 상태 표시 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-8">
              {/* 1단계: 의상 추가 */}
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'add-clothes' 
                    ? 'bg-purple-500 text-white' 
                    : canGoToProfile
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {canGoToProfile && currentStep !== 'add-clothes' ? '✓' : '1'}
                </div>
                <span className={`font-medium ${
                  currentStep === 'add-clothes' ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  의상 추가
                </span>
              </div>

              {/* 연결선 */}
              <div className={`w-16 h-0.5 ${
                canGoToProfile ? 'bg-green-500' : 'bg-gray-200'
              }`} />

              {/* 2단계: 프로필 설정 */}
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'profile' 
                    ? 'bg-purple-500 text-white' 
                    : canGoToProfile
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {canGoToProfile && currentStep !== 'profile' ? '✓' : '2'}
                </div>
                <span className={`font-medium ${
                  currentStep === 'profile' ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  기본 정보
                </span>
              </div>

              {/* 연결선 */}
              <div className={`w-16 h-0.5 ${
                canGoToProfile ? 'bg-green-500' : 'bg-gray-200'
              }`} />

              {/* 3단계: 코디 생성 */}
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'generate' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className={`font-medium ${
                  currentStep === 'generate' ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  Virtual Try-On
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 단계 헤더 */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{stepInfo.title}</h2>
          <p className="text-gray-600">{stepInfo.description}</p>
        </div>

        {/* 단계별 컴포넌트 렌더링 */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'add-clothes' && (
            <div className="space-y-8">
              {/* 의상 추가 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-purple-600" />
                  새 의상 추가
                </h3>
                <ClothingItemForm
                  onSubmit={handleClothingItemAdd}
                />
              </div>

              {/* 등록된 의상 목록 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Shirt className="w-6 h-6 text-blue-600" />
                  등록된 의상 ({clothingItems.length}개)
                </h3>
                
                {clothingItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">아직 등록된 의상이 없습니다</p>
                    <p className="text-gray-400 text-sm">위에서 의상을 추가해보세요</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clothingItems.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Shirt className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                              <p className="text-xs text-gray-500">{item.brand}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleItemSelect(item)}
                            className={cn(
                              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                              selectedItems.find(i => i.id === item.id)
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'border-gray-300 hover:border-purple-400'
                            )}
                          >
                            {selectedItems.find(i => i.id === item.id) && (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                        
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.category}</span>
                          <span className="font-medium text-purple-600">
                            {item.price.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedItems.length > 0 && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-purple-900">
                          {selectedItems.length}개 의상 선택됨
                        </div>
                        <div className="text-sm text-purple-700">
                          총 {selectedItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}원
                        </div>
                      </div>
                      <button
                        onClick={() => setCurrentStep('profile')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        다음 단계
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'profile' && (
            <div className="space-y-8">
              <UserProfileForm
                selectedGender={selectedGender}
                selectedBodyType={selectedBodyType}
                onGenderSelect={handleGenderSelect}
                onBodyTypeSelect={handleBodyTypeSelect}
                onComplete={handleProfileComplete}
              />
            </div>
          )}

          {currentStep === 'generate' && selectedGender && selectedBodyType && (
            <OutfitGenerator
              selectedGender={selectedGender}
              selectedBodyType={selectedBodyType}
              selectedItems={selectedItems}
              onGenerate={handleOutfitGenerate}
            />
          )}
        </div>
      </main>

      {/* 설정 모달 */}
      {showSettings && (
        <SettingsForm onClose={() => setShowSettings(false)} />
      )}

      {/* 플로팅 도움말 버튼 */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h4 className="font-semibold text-gray-800 mb-2">💡 사용 가이드</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {currentStep === 'add-clothes' && (
              <>
                <p>• 온라인 쇼핑몰 상품 URL을 입력하세요</p>
                <p>• 여러 의상을 추가할 수 있습니다</p>
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
                <p>• AI 설정에서 API 키를 등록하면 고품질 이미지를 생성할 수 있습니다</p>
                <p>• 기준 이미지를 업로드하면 더 정확한 결과를 얻을 수 있습니다</p>
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
