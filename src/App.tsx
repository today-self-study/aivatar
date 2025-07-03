import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Menu, X, Settings, User, Shirt, Sparkles, Plus, List } from 'lucide-react'
import BodyTypeSelector from './components/BodyTypeSelector'
import UserProfileForm from './components/UserProfileForm'
import GenderSelector from './components/GenderSelector'
import VersionInfo from './components/VersionInfo'
import type { 
  UserProfile, 
  BodyType, 
  ClothingItem, 
  Gender,
  AISettings,
  OutfitGeneration,
  AppStep
} from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { cn } from './utils'
import { initializeOpenAI } from './utils/openai'

// Components
import SettingsForm from './components/SettingsForm'
import ClothingItemForm from './components/ClothingItemForm'
import OutfitGenerator from './components/OutfitGenerator'

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('settings')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [aiSettings, setAiSettings] = useLocalStorage<AISettings | null>('aivatar-ai-settings', null)
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('aivatar-user-profile', null)
  const [selectedGender, setSelectedGender] = useLocalStorage<Gender | null>('aivatar-selected-gender', null)
  const [selectedBodyType, setSelectedBodyType] = useLocalStorage<BodyType | null>('aivatar-selected-body-type', null)
  const [clothingItems, setClothingItems] = useLocalStorage<ClothingItem[]>('aivatar-clothing-items', [])
  const [selectedItems, setSelectedItems] = useLocalStorage<ClothingItem[]>('aivatar-selected-items', [])
  const [generatedOutfits, setGeneratedOutfits] = useLocalStorage<OutfitGeneration[]>('aivatar-generated-outfits', [])

  useEffect(() => {
    if (aiSettings) {
      try {
        initializeOpenAI(aiSettings)
        if (currentStep === 'settings') {
          setCurrentStep('gender')
        }
      } catch (error) {
        console.error('Failed to initialize OpenAI:', error)
        toast.error('AI 설정을 다시 확인해주세요')
      }
    }
  }, [aiSettings])

  // GitHub 동기화 제거 - 브라우저 캐시만 사용

  const handleSettingsSubmit = (settings: AISettings) => {
    setAiSettings(settings)
    toast.success('AI 설정이 완료되었습니다!')
    setCurrentStep('gender')
  }

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender)
    setCurrentStep('bodyType')
  }

  const handleBodyTypeSelect = (bodyType: BodyType) => {
    setSelectedBodyType(bodyType)
    setCurrentStep('profile')
  }

  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile)
    toast.success('프로필이 저장되었습니다!')
    setCurrentStep('items')
  }

  const handleClothingItemAdd = (item: ClothingItem) => {
    try {
      setIsLoading(true)
      const newItems = [...clothingItems, item]
      setClothingItems(newItems)
      // toast는 ClothingItemForm에서 처리하므로 여기서는 제거
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

  const handleOutfitGenerate = async (outfit: OutfitGeneration) => {
    setGeneratedOutfits([outfit, ...generatedOutfits])
    toast.success('멋진 코디가 완성되었습니다!')
  }

  const handleReset = () => {
    setCurrentStep('settings')
    setUserProfile(null)
    setSelectedGender(null)
    setSelectedBodyType(null)
    setSelectedItems([])
    setIsSidebarOpen(false)
    toast.success('처음부터 다시 시작합니다')
  }

  const getStepInfo = () => {
    switch (currentStep) {
      case 'settings':
        return { title: 'AI 설정', description: 'OpenAI API Key를 설정해주세요', progress: 10 }
      case 'gender':
        return { title: '성별 선택', description: '성별에 따라 맞춤 추천을 제공합니다', progress: 25 }
      case 'bodyType':
        return { title: '체형 선택', description: '체형에 맞는 스타일을 추천해드려요', progress: 40 }
      case 'profile':
        return { title: '신체 정보', description: '키와 몸무게를 입력해주세요', progress: 55 }
      case 'items':
        return { title: '의상 관리', description: '의상을 추가하고 선택해보세요', progress: 70 }
      case 'outfit':
        return { title: 'AI 코디 생성', description: 'AI가 완벽한 코디를 만들어드려요', progress: 100 }
      default:
        return { title: '', description: '', progress: 0 }
    }
  }

  const stepInfo = getStepInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">AIVATAR</h1>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                AI Powered
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 빠른 액세스 버튼 */}
              {aiSettings && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep('items')}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    의상 추가
                  </button>
                  
                  <button
                    onClick={() => setCurrentStep('outfit')}
                    disabled={selectedItems.length === 0}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                      selectedItems.length > 0
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    AI 코디
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="flex flex-col h-full">
            {/* 사이드바 헤더 */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">진행 단계</h2>
              
              {/* 프로그레스 바 */}
              <div className="mt-4">
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

            {/* 단계별 네비게이션 */}
            <nav className="flex-1 p-6 space-y-2">
              {[
                { id: 'settings', label: 'AI 설정', icon: Settings, enabled: true },
                { id: 'gender', label: '성별 선택', icon: User, enabled: !!aiSettings },
                { id: 'bodyType', label: '체형 선택', icon: User, enabled: !!selectedGender },
                { id: 'profile', label: '신체 정보', icon: User, enabled: !!selectedBodyType },
                { id: 'items', label: '의상 관리', icon: Shirt, enabled: !!userProfile },
                { id: 'outfit', label: 'AI 코디', icon: Sparkles, enabled: selectedItems.length > 0 }
              ].map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => step.enabled && setCurrentStep(step.id as AppStep)}
                  disabled={!step.enabled}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors',
                    currentStep === step.id 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : step.enabled
                        ? 'hover:bg-gray-100 text-gray-700'
                        : 'text-gray-400 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-medium',
                    currentStep === step.id
                      ? 'bg-purple-500'
                      : step.enabled
                        ? 'bg-gray-400'
                        : 'bg-gray-300'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{step.label}</div>
                  </div>
                  <step.icon className="w-4 h-4" />
                </button>
              ))}
            </nav>

            {/* 사이드바 하단 */}
            <div className="p-6 border-t border-gray-200 space-y-3">
              {/* 통계 */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{clothingItems.length}</div>
                  <div className="text-xs text-blue-600">등록 의상</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedItems.length}</div>
                  <div className="text-xs text-green-600">선택 의상</div>
                </div>
              </div>
              
              <button
                onClick={handleReset}
                className="w-full py-2 px-4 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                처음부터 다시 시작
              </button>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-h-screen md:ml-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 단계 헤더 */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{stepInfo.title}</h2>
              <p className="text-gray-600">{stepInfo.description}</p>
            </div>

            {/* 단계별 컴포넌트 렌더링 */}
            <div className="max-w-4xl mx-auto">
              {currentStep === 'settings' && (
                <SettingsForm
                  onSubmit={handleSettingsSubmit}
                  initialSettings={aiSettings || undefined}
                />
              )}

              {currentStep === 'gender' && (
                <GenderSelector
                  selectedGender={selectedGender}
                  onGenderSelect={handleGenderSelect}
                />
              )}

              {currentStep === 'bodyType' && (
                <BodyTypeSelector
                  selectedBodyType={selectedBodyType}
                  onBodyTypeSelect={handleBodyTypeSelect}
                />
              )}

              {currentStep === 'profile' && selectedGender && selectedBodyType && (
                <UserProfileForm
                  selectedGender={selectedGender}
                  selectedBodyType={selectedBodyType}
                  onSubmit={handleProfileSubmit}
                />
              )}

              {currentStep === 'items' && (
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
                      <List className="w-6 h-6 text-blue-600" />
                      등록된 의상 ({clothingItems.length}개)
                    </h3>
                    
                    {clothingItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">아직 등록된 의상이 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-1">위에서 첫 번째 의상을 추가해보세요!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clothingItems.map(item => (
                          <div
                            key={item.id}
                            className={cn(
                              'p-4 border-2 rounded-xl cursor-pointer transition-all',
                              selectedItems.find(i => i.id === item.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                            onClick={() => handleItemSelect(item)}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="text-2xl">
                                {item.category === 'tops' && '👕'}
                                {item.category === 'bottoms' && '👖'}
                                {item.category === 'outerwear' && '🧥'}
                                {item.category === 'shoes' && '👟'}
                                {item.category === 'accessories' && '👜'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.brand}</div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-purple-600">
                                {item.price.toLocaleString()}원
                              </span>
                              {selectedItems.find(i => i.id === item.id) && (
                                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                                  선택됨
                                </span>
                              )}
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
                            onClick={() => setCurrentStep('outfit')}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            AI 코디 생성
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 'outfit' && userProfile && (
                <OutfitGenerator
                  userProfile={userProfile}
                  selectedItems={selectedItems}
                  onGenerate={handleOutfitGenerate}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 버전 정보 */}
      <footer className="fixed bottom-4 right-4 z-30">
        <VersionInfo />
      </footer>

      {/* 사이드바 오버레이 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-900 font-medium">처리 중...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
