import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { UserProfile, ClothingItem, ClothingCategoryType, Gender } from '../types';

interface Avatar3DProps {
  userProfile: UserProfile;
  selectedClothing?: Record<ClothingCategoryType, ClothingItem | null>;
  className?: string;
}

interface RealisticAvatarProps {
  gender: Gender;
  bodyType: string;
  height: number;
  weight: number;
  selectedClothing?: Record<ClothingCategoryType, ClothingItem | null>;
}

function RealisticAvatar({ gender, bodyType, height, weight, selectedClothing }: RealisticAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  // 성별과 체형에 따른 비율 계산
  const getBodyRatios = () => {
    const heightRatio = height / 170;
    const bmiRatio = weight / ((height / 100) * (height / 100)) / 22;
    
    const baseRatios = {
      male: {
        shoulder: 1.3,
        chest: 1.2,
        waist: 0.85,
        hip: 0.95,
        thigh: 1.0,
        torsoLength: 1.0,
        neckLength: 1.0,
        armLength: 1.0,
        legLength: 1.0,
        headSize: 1.0
      },
      female: {
        shoulder: 1.0,
        chest: 1.15,
        waist: 0.72,
        hip: 1.25,
        thigh: 1.1,
        torsoLength: 0.95,
        neckLength: 0.95,
        armLength: 0.95,
        legLength: 1.05,
        headSize: 0.95
      }
    };

    const safeGender = gender === 'male' || gender === 'female' ? gender : 'male';
    const genderRatios = baseRatios[safeGender];
    
    // 체형별 세밀한 조정
    const bodyTypeAdjustments = {
      slender: { 
        shoulder: 0.88, chest: 0.85, waist: 0.82, hip: 0.88, thigh: 0.85,
        torsoLength: 1.05, armLength: 1.02, legLength: 1.05
      },
      athletic: { 
        shoulder: 1.15, chest: 1.1, waist: 0.92, hip: 1.02, thigh: 1.08,
        torsoLength: 1.02, armLength: 1.0, legLength: 1.0
      },
      pear: { 
        shoulder: 0.9, chest: 0.95, waist: 0.88, hip: 1.18, thigh: 1.15,
        torsoLength: 0.98, armLength: 0.98, legLength: 1.0
      },
      apple: { 
        shoulder: 1.08, chest: 1.15, waist: 1.1, hip: 1.05, thigh: 1.05,
        torsoLength: 0.95, armLength: 0.98, legLength: 0.98
      },
      hourglass: { 
        shoulder: 1.05, chest: 1.1, waist: 0.75, hip: 1.1, thigh: 1.02,
        torsoLength: 1.0, armLength: 1.0, legLength: 1.0
      },
      rectangle: { 
        shoulder: 1.0, chest: 1.0, waist: 0.95, hip: 1.0, thigh: 1.0,
        torsoLength: 1.0, armLength: 1.0, legLength: 1.0
      }
    };

    const adjustment = bodyTypeAdjustments[bodyType as keyof typeof bodyTypeAdjustments] || bodyTypeAdjustments.rectangle;
    
    const safeHeightRatio = heightRatio || 1.0;
    const safeBmiRatio = Math.max(0.8, Math.min(1.3, bmiRatio || 1.0));
    
    return {
      shoulder: (genderRatios?.shoulder || 1.0) * (adjustment?.shoulder || 1.0) * safeHeightRatio * safeBmiRatio,
      chest: (genderRatios?.chest || 1.0) * (adjustment?.chest || 1.0) * safeBmiRatio,
      waist: (genderRatios?.waist || 1.0) * (adjustment?.waist || 1.0) * safeBmiRatio,
      hip: (genderRatios?.hip || 1.0) * (adjustment?.hip || 1.0) * safeBmiRatio,
      thigh: (genderRatios?.thigh || 1.0) * (adjustment?.thigh || 1.0) * safeBmiRatio,
      torsoLength: (genderRatios?.torsoLength || 1.0) * (adjustment?.torsoLength || 1.0) * safeHeightRatio,
      neckLength: (genderRatios?.neckLength || 1.0) * safeHeightRatio,
      armLength: (genderRatios?.armLength || 1.0) * (adjustment?.armLength || 1.0) * safeHeightRatio,
      legLength: (genderRatios?.legLength || 1.0) * (adjustment?.legLength || 1.0) * safeHeightRatio,
      headSize: (genderRatios?.headSize || 1.0) * safeHeightRatio,
      overall: safeHeightRatio
    };
  };

  const ratios = getBodyRatios();

  // 재질 정의
  const materials = useMemo(() => {
    const skinColor = '#F5DEB3';
    const skinMaterial = new THREE.MeshStandardMaterial({ 
      color: skinColor,
      roughness: 0.6,
      metalness: 0.1
    });

    const getClothingColor = (category: ClothingCategoryType, defaultColor: string) => {
      if (!selectedClothing?.[category]) return defaultColor;
      
      const item = selectedClothing[category];
      if (!item?.colors || item.colors.length === 0) return defaultColor;
      
      const colorMap: { [key: string]: string } = {
        '화이트': '#FFFFFF',
        '블랙': '#1a1a1a',
        '네이비': '#1e3a8a',
        '그레이': '#6b7280',
        '베이지': '#f5f5dc',
        '브라운': '#8b4513',
        '연청': '#6495ed',
        '진청': '#1e40af',
        '로즈골드': '#e8b4b8',
        '골드': '#ffd700',
        '실버': '#c0c0c0',
        '올리브': '#808000'
      };
      
      return colorMap[item.colors[0]] || defaultColor;
    };

    return {
      skin: skinMaterial,
      clothing: new THREE.MeshStandardMaterial({
        color: getClothingColor('tops', '#e2e8f0'),
        roughness: 0.4,
        metalness: 0.1
      }),
      pants: new THREE.MeshStandardMaterial({
        color: getClothingColor('bottoms', '#3b82f6'),
        roughness: 0.5,
        metalness: 0.1
      }),
      shoes: new THREE.MeshStandardMaterial({
        color: getClothingColor('shoes', '#374151'),
        roughness: 0.3,
        metalness: 0.2
      }),
      outerwear: new THREE.MeshStandardMaterial({
        color: getClothingColor('outerwear', '#1f2937'),
        roughness: 0.4,
        metalness: 0.1
      })
    };
  }, [selectedClothing]);

  // 고도화된 사람 형태 생성 함수들
  const createHead = () => {
    return (
      <group>
        {/* 머리 */}
        <mesh position={[0, 1.7 * ratios.overall, 0.02]} material={materials.skin}>
          <sphereGeometry args={[0.11 * ratios.headSize, 20, 16]} />
        </mesh>
        
        {/* 얼굴 특징 */}
        <mesh position={[0, 1.68 * ratios.overall, 0.08]} material={materials.skin}>
          <sphereGeometry args={[0.08 * ratios.headSize, 16, 12]} />
        </mesh>
        
        {/* 목 */}
        <mesh position={[0, 1.52 * ratios.overall, 0]} material={materials.skin}>
          <cylinderGeometry args={[0.045, 0.055, 0.16 * ratios.neckLength, 12]} />
        </mesh>
      </group>
    );
  };

  const createTorso = () => {
    return (
      <group>
        {/* 가슴/상체 */}
        <mesh position={[0, 1.25 * ratios.overall, 0]} material={materials.clothing}>
          <cylinderGeometry args={[0.08 * ratios.waist, 0.12 * ratios.chest, 0.35 * ratios.torsoLength, 16]} />
        </mesh>
        
        {/* 어깨 */}
        <mesh position={[0, 1.38 * ratios.overall, 0]} material={materials.clothing}>
          <sphereGeometry args={[0.14 * ratios.shoulder, 0.08, 0.1, 16, 12]} />
        </mesh>
        
        {/* 복부 */}
        <mesh position={[0, 1.05 * ratios.overall, 0]} material={materials.clothing}>
          <sphereGeometry args={[0.09 * ratios.waist, 0.12, 0.08, 16, 12]} />
        </mesh>
        
        {/* 허리 */}
        <mesh position={[0, 0.88 * ratios.overall, 0]} material={materials.pants}>
          <cylinderGeometry args={[0.075 * ratios.waist, 0.085 * ratios.hip, 0.12, 16]} />
        </mesh>
        
        {/* 엉덩이 */}
        <mesh position={[0, 0.75 * ratios.overall, 0]} material={materials.pants}>
          <sphereGeometry args={[0.095 * ratios.hip, 0.08, 0.12, 16, 12]} />
        </mesh>
      </group>
    );
  };

  const createArm = (side: 'left' | 'right') => {
    const sideMultiplier = side === 'left' ? -1 : 1;
    const armX = 0.18 * ratios.shoulder * sideMultiplier;
    
    return (
      <group>
        {/* 상완 */}
        <mesh 
          position={[armX, 1.15 * ratios.overall, 0]} 
          material={materials.skin}
          rotation={[0, 0, 0.1 * sideMultiplier]}
        >
          <cylinderGeometry args={[0.035, 0.045, 0.25 * ratios.armLength, 12]} />
        </mesh>
        
        {/* 팔꿈치 */}
        <mesh position={[armX, 1.0 * ratios.overall, 0]} material={materials.skin}>
          <sphereGeometry args={[0.04, 12, 8]} />
        </mesh>
        
        {/* 전완 */}
        <mesh 
          position={[armX, 0.85 * ratios.overall, 0]} 
          material={materials.skin}
          rotation={[0, 0, 0.05 * sideMultiplier]}
        >
          <cylinderGeometry args={[0.03, 0.035, 0.22 * ratios.armLength, 12]} />
        </mesh>
        
        {/* 손 */}
        <mesh position={[armX, 0.7 * ratios.overall, 0]} material={materials.skin}>
          <sphereGeometry args={[0.04, 0.06, 0.04, 12, 10]} />
        </mesh>
      </group>
    );
  };

  const createLeg = (side: 'left' | 'right') => {
    const sideMultiplier = side === 'left' ? -1 : 1;
    const legX = 0.08 * ratios.hip * sideMultiplier;
    
    return (
      <group>
        {/* 허벅지 */}
        <mesh 
          position={[legX, 0.5 * ratios.overall, 0]} 
          material={materials.pants}
          rotation={[0, 0, 0.02 * sideMultiplier]}
        >
          <cylinderGeometry args={[0.055 * ratios.thigh, 0.065 * ratios.thigh, 0.35 * ratios.legLength, 12]} />
        </mesh>
        
        {/* 무릎 */}
        <mesh position={[legX, 0.3 * ratios.overall, 0]} material={materials.pants}>
          <sphereGeometry args={[0.05, 12, 8]} />
        </mesh>
        
        {/* 정강이 */}
        <mesh 
          position={[legX, 0.15 * ratios.overall, 0]} 
          material={materials.pants}
          rotation={[0, 0, -0.01 * sideMultiplier]}
        >
          <cylinderGeometry args={[0.04, 0.05, 0.25 * ratios.legLength, 12]} />
        </mesh>
        
        {/* 발목 */}
        <mesh position={[legX, 0.05 * ratios.overall, 0]} material={materials.skin}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
        
        {/* 발 */}
        <mesh position={[legX, 0.02 * ratios.overall, 0.05]} material={materials.shoes}>
          <boxGeometry args={[0.06, 0.04, 0.15]} />
        </mesh>
      </group>
    );
  };

  const createOuterwear = () => {
    if (!selectedClothing?.outerwear) return null;
    
    return (
      <group>
        {/* 외투 */}
        <mesh position={[0, 1.25 * ratios.overall, 0]} material={materials.outerwear}>
          <cylinderGeometry args={[0.09 * ratios.waist, 0.14 * ratios.chest, 0.4 * ratios.torsoLength, 16]} />
        </mesh>
        
        {/* 외투 어깨 */}
        <mesh position={[0, 1.4 * ratios.overall, 0]} material={materials.outerwear}>
          <sphereGeometry args={[0.16 * ratios.shoulder, 0.1, 0.12, 16, 12]} />
        </mesh>
      </group>
    );
  };

  const createAccessories = () => {
    if (!selectedClothing?.accessories) return null;
    
    return (
      <group>
        {/* 액세서리 예시 (목걸이) */}
        <mesh position={[0, 1.45 * ratios.overall, 0.08]} material={materials.outerwear}>
          <torusGeometry args={[0.08, 0.008, 8, 16]} />
        </mesh>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      {/* 조명 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 8, 5]} intensity={0.4} />
      <pointLight position={[0, 5, 3]} intensity={0.3} />
      
      {/* 아바타 구성 요소들 */}
      {createHead()}
      {createTorso()}
      {createArm('left')}
      {createArm('right')}
      {createLeg('left')}
      {createLeg('right')}
      {createOuterwear()}
      {createAccessories()}
    </group>
  );
}

export default function Avatar3D({ userProfile, selectedClothing, className }: Avatar3DProps) {
  const safeGender = userProfile.gender === 'male' || userProfile.gender === 'female' ? userProfile.gender : 'male';
  
  return (
    <div className={`w-full h-full ${className || ''}`}>
      <Canvas
        camera={{
          position: [0, 1.5, 2.5],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)' }}
      >
        <RealisticAvatar
          gender={safeGender}
          bodyType={userProfile.bodyType.id}
          height={userProfile.height}
          weight={userProfile.weight}
          selectedClothing={selectedClothing}
        />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          target={[0, 1, 0]}
        />
        
        {/* 바닥 */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#f1f5f9" transparent opacity={0.6} />
        </mesh>
      </Canvas>
    </div>
  );
} 