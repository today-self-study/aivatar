import { useState } from 'react'
import { Menu, X, Palette, User, Shirt } from 'lucide-react'
import Avatar3D from './components/Avatar3D'
import BodyTypeSelector from './components/BodyTypeSelector'
import UserProfileForm from './components/UserProfileForm'
import ClothingList from './components/ClothingList'
import GenderSelector from './components/GenderSelector'
import type { UserProfile, BodyType, ClothingItem, ClothingCategoryType, Gender } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { cn } from './utils'

type AppStep = 'gender' | 'bodyType' | 'profile' | 'avatar' | 'clothing'

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('gender')
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(null)
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null)
  const [selectedClothing, setSelectedClothing] = useLocalStorage<Record<ClothingCategoryType, ClothingItem | null>>('selectedClothing', {
    tops: null,
    bottoms: null,
    shoes: null,
    accessories: null,
    outerwear: null
  })
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategoryType | 'all'>('all')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
    setCurrentStep('avatar')
  }

  const handleClothingSelect = (item: ClothingItem) => {
    const categoryId = item.category.id as ClothingCategoryType
    
    setSelectedClothing(prev => {
      const isCurrentlySelected = prev[categoryId]?.id === item.id
      
      return {
        ...prev,
        [categoryId]: isCurrentlySelected ? null : item
      }
    })
  }

  const handleReset = () => {
    setCurrentStep('gender')
    setSelectedGender(null)
    setSelectedBodyType(null)
    setUserProfile(null)
    setSelectedClothing({
      tops: null,
      bottoms: null,
      shoes: null,
      accessories: null,
      outerwear: null
    })
    setSelectedCategory('all')
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'gender':
        return '성별 선택'
      case 'bodyType':
        return '체형 선택'
      case 'profile':
        return '신체 정보 입력'
      case 'avatar':
        return '3D 아바타 보기'
      case 'clothing':
        return '의류 선택'
      default:
        return ''
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'gender':
        return '성별에 따라 더 정확한 체형 분석을 제공합니다'
      case 'bodyType':
        return '나와 가장 비슷한 체형을 선택해주세요'
      case 'profile':
        return '키와 몸무게를 입력해주세요'
      case 'avatar':
        return '생성된 3D 아바타를 확인해보세요'
      case 'clothing':
        return '마음에 드는 의류를 선택해보세요'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Aivatar</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {userProfile && (
                <button
                  onClick={() => setCurrentStep('avatar')}
                  className="btn-secondary"
                >
                  <User className="w-4 h-4 mr-2" />
                  아바타 보기
                </button>
              )}
              
              {userProfile && (
                <button
                  onClick={() => setCurrentStep('clothing')}
                  className="btn-primary"
                >
                  <Shirt className="w-4 h-4 mr-2" />
                  의류 선택
                </button>
              )}
              
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-500 hover:text-gray-700"
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
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="flex flex-col h-full pt-16 md:pt-0">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">단계별 진행</h2>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => setCurrentStep('gender')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  currentStep === 'gender' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'hover:bg-gray-100'
                )}
              >
                <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-sm flex items-center justify-center">
                  1
                </div>
                성별 선택
              </button>
              
              <button
                onClick={() => setCurrentStep('bodyType')}
                disabled={!selectedGender}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  currentStep === 'bodyType' 
                    ? 'bg-primary-100 text-primary-700' 
                    : selectedGender
                      ? 'hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full text-white text-sm flex items-center justify-center',
                  selectedGender ? 'bg-primary-500' : 'bg-gray-300'
                )}>
                  2
                </div>
                체형 선택
              </button>
              
              <button
                onClick={() => setCurrentStep('profile')}
                disabled={!selectedBodyType}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  currentStep === 'profile' 
                    ? 'bg-primary-100 text-primary-700' 
                    : selectedBodyType
                      ? 'hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full text-white text-sm flex items-center justify-center',
                  selectedBodyType ? 'bg-primary-500' : 'bg-gray-300'
                )}>
                  3
                </div>
                신체 정보 입력
              </button>
              
              <button
                onClick={() => setCurrentStep('avatar')}
                disabled={!userProfile}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  currentStep === 'avatar' 
                    ? 'bg-primary-100 text-primary-700' 
                    : userProfile
                      ? 'hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full text-white text-sm flex items-center justify-center',
                  userProfile ? 'bg-primary-500' : 'bg-gray-300'
                )}>
                  4
                </div>
                3D 아바타 보기
              </button>
              
              <button
                onClick={() => setCurrentStep('clothing')}
                disabled={!userProfile}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  currentStep === 'clothing' 
                    ? 'bg-primary-100 text-primary-700' 
                    : userProfile
                      ? 'hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full text-white text-sm flex items-center justify-center',
                  userProfile ? 'bg-primary-500' : 'bg-gray-300'
                )}>
                  5
                </div>
                의류 선택
              </button>
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="w-full btn-secondary"
              >
                처음부터 다시 시작
              </button>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 진행 상태 표시 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
                  <p className="text-gray-600 mt-1">{getStepDescription()}</p>
                </div>
                
                {/* 프로그레스 바 */}
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${
                        currentStep === 'gender' ? 20 :
                        currentStep === 'bodyType' ? 40 :
                        currentStep === 'profile' ? 60 :
                        currentStep === 'avatar' ? 80 :
                        100
                      }%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 단계별 컴포넌트 렌더링 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 좌측 패널 */}
              <div className="lg:col-span-2">
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
                
                {currentStep === 'profile' && (
                  <UserProfileForm
                    selectedGender={selectedGender}
                    selectedBodyType={selectedBodyType}
                    onSubmit={handleProfileSubmit}
                  />
                )}
                
                {currentStep === 'avatar' && userProfile && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">3D 아바타</h3>
                    <div className="w-full h-96 bg-gray-100 rounded-lg">
                      <Avatar3D 
                        userProfile={userProfile} 
                        selectedClothing={selectedClothing}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
                
                {currentStep === 'clothing' && userProfile && (
                  <ClothingList
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    onItemSelect={handleClothingSelect}
                    selectedItems={selectedClothing}
                  />
                )}
              </div>

              {/* 우측 패널 - 3D 아바타 미리보기 */}
              {userProfile && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
                    <h3 className="text-lg font-semibold mb-4">아바타 미리보기</h3>
                    <div className="w-full h-80 bg-gray-100 rounded-lg">
                      <Avatar3D 
                        userProfile={userProfile} 
                        selectedClothing={selectedClothing}
                        className="w-full h-full"
                      />
                    </div>
                    
                    {selectedClothing.tops && selectedClothing.bottoms && selectedClothing.shoes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">착용 중인 아이템</h4>
                        <div className="space-y-1">
                          {Object.entries(selectedClothing).map(([_, item]) => (
                            item && (
                              <div key={item.id} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                                {item.name}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 사이드바 오버레이 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default App
