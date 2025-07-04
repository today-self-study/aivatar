import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Plus, Sparkles, Shirt, User, Check } from 'lucide-react'
import { cn } from './utils'
import { useLocalStorage } from './hooks/useLocalStorage'
import { VersionInfo } from './components/VersionInfo'
import ClothingItemForm from './components/ClothingItemForm'
import OutfitGenerator from './components/OutfitGenerator'
import UserProfileForm from './components/UserProfileForm'
import { initializeSimpleGenerator } from './utils/openai'
import type { 
  ClothingItem, 
  OutfitGeneration, 
  Gender, 
  BodyType
} from './types'

// 간단한 3단계 플로우
type AppStep = 'clothes' | 'profile' | 'generate'

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('clothes')
  const [isLoading, setIsLoading] = useState(false)

  // 간단한 프로필 (성별, 체형만)
  const [selectedGender, setSelectedGender] = useLocalStorage<Gender | null>('aivatar-selected-gender', null)
  const [selectedBodyType, setSelectedBodyType] = useLocalStorage<BodyType | null>('aivatar-selected-body-type', null)
  const [clothingItems, setClothingItems] = useLocalStorage<ClothingItem[]>('aivatar-clothing-items', [])
  const [selectedItems, setSelectedItems] = useLocalStorage<ClothingItem[]>('aivatar-selected-items', [])
  const [generatedOutfits, setGeneratedOutfits] = useLocalStorage<OutfitGeneration[]>('aivatar-generated-outfits', [])

  // 무료 API 초기화
  useEffect(() => {
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
    setCurrentStep('clothes')
    setSelectedGender(null)
    setSelectedBodyType(null)
    setSelectedItems([])
    toast.success('처음부터 다시 시작합니다')
  }

  const handleProfileComplete = () => {
    setCurrentStep('generate')
  }

  const getStepInfo = () => {
    switch (currentStep) {
      case 'clothes':
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
      id: 'clothes', 
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
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AIVATAR
              </h1>
              <div className="hidden md:block ml-4 text-sm text-gray-500">
                AI 착장 생성 플랫폼
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                처음부터 다시 시작
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex space-x-8">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => step.enabled && setCurrentStep(step.id as AppStep)}
                  disabled={!step.enabled}
                  className={cn(
                    'flex items-center gap-3 px-4 py-4 text-sm font-medium border-b-2 transition-colors',
                    currentStep === step.id
                      ? 'border-purple-500 text-purple-600'
                      : step.enabled
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        : 'border-transparent text-gray-400 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                    currentStep === step.id
                      ? 'bg-purple-500 text-white'
                      : step.completed
                        ? 'bg-green-500 text-white'
                        : step.enabled
                          ? 'bg-gray-300 text-gray-700'
                          : 'bg-gray-200 text-gray-400'
                  )}>
                    {step.completed ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="hidden sm:block">{step.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 프로그레스 바 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>진행률</span>
              <span>{stepInfo.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stepInfo.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 단계 헤더 */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{stepInfo.title}</h2>
          <p className="text-gray-600">{stepInfo.description}</p>
        </div>

        {/* 단계별 컴포넌트 렌더링 */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'clothes' && (
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

      {/* 버전 정보 */}
      <footer className="fixed bottom-4 right-4 z-30">
        <VersionInfo />
      </footer>

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
