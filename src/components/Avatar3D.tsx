import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { UserProfile, WardrobeItem, Gender } from '../types';

interface Avatar3DProps {
  userProfile: UserProfile;
  outfit: WardrobeItem[];
  className?: string;
}

interface RealisticAvatarProps {
  gender: Gender;
  bodyType: string;
  height: number;
  weight: number;
}

function RealisticAvatar({ gender, bodyType, height, weight }: RealisticAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // 성별과 체형에 따른 비율 계산
  const getBodyRatios = () => {
    const heightRatio = height / 170;
    const bmiRatio = weight / ((height / 100) * (height / 100)) / 22;
    
    const baseRatios = {
      male: {
        shoulder: 1.2,
        chest: 1.0,
        waist: 0.8,
        hip: 0.9,
        thigh: 1.0,
        torsoLength: 1.0
      },
      female: {
        shoulder: 1.0,
        chest: 1.1,
        waist: 0.7,
        hip: 1.2,
        thigh: 1.1,
        torsoLength: 0.95
      }
    };

    // 안전한 gender 값 확인 및 기본값 설정
    const safeGender = gender === 'male' || gender === 'female' ? gender : 'male';
    const genderRatios = baseRatios[safeGender];
    
    // 체형별 조정
    const bodyTypeAdjustments = {
      slender: { shoulder: 0.85, chest: 0.9, waist: 0.8, hip: 0.9, thigh: 0.9 },
      athletic: { shoulder: 1.1, chest: 1.05, waist: 0.9, hip: 1.0, thigh: 1.05 },
      pear: { shoulder: 0.9, chest: 0.95, waist: 0.85, hip: 1.15, thigh: 1.1 },
      apple: { shoulder: 1.05, chest: 1.1, waist: 1.1, hip: 1.0, thigh: 1.0 },
      hourglass: { shoulder: 1.0, chest: 1.05, waist: 0.75, hip: 1.05, thigh: 1.0 },
      rectangle: { shoulder: 1.0, chest: 1.0, waist: 0.95, hip: 1.0, thigh: 1.0 }
    };

    const adjustment = bodyTypeAdjustments[bodyType as keyof typeof bodyTypeAdjustments] || bodyTypeAdjustments.rectangle;
    
    // 안전한 계산을 위한 기본값 보장
    const safeHeightRatio = heightRatio || 1.0;
    const safeBmiRatio = bmiRatio || 1.0;
    
    return {
      shoulder: (genderRatios?.shoulder || 1.0) * (adjustment?.shoulder || 1.0) * safeHeightRatio,
      chest: (genderRatios?.chest || 1.0) * (adjustment?.chest || 1.0) * safeBmiRatio,
      waist: (genderRatios?.waist || 1.0) * (adjustment?.waist || 1.0) * safeBmiRatio,
      hip: (genderRatios?.hip || 1.0) * (adjustment?.hip || 1.0) * safeBmiRatio,
      thigh: (genderRatios?.thigh || 1.0) * (adjustment?.thigh || 1.0) * safeBmiRatio,
      torsoLength: (genderRatios?.torsoLength || 1.0) * safeHeightRatio,
      overall: safeHeightRatio
    };
  };

  const ratios = getBodyRatios();

  // 피부색과 재질 정의
  const skinColor = '#F4C2A1';
  const skinMaterial = useMemo(() => new THREE.MeshPhongMaterial({ 
    color: skinColor,
    shininess: 30,
    specular: 0x111111
  }), []);

  const clothingMaterial = useMemo(() => new THREE.MeshPhongMaterial({
    color: '#E0E0E0',
    shininess: 10
  }), []);

  const pantsMaterial = useMemo(() => new THREE.MeshPhongMaterial({
    color: '#4A90E2',
    shininess: 5
  }), []);

  const shoeMaterial = useMemo(() => new THREE.MeshPhongMaterial({
    color: '#2C3E50',
    shininess: 20
  }), []);

  // 머리 생성 함수
  const createHead = () => {
    return (
      <mesh position={[0, 1.58 * ratios.overall, 0]} material={skinMaterial}>
        <sphereGeometry args={[0.12 * ratios.overall, 16, 16]} />
      </mesh>
    );
  };

  // 목 생성 함수
  const createNeck = () => {
    return (
      <mesh position={[0, 1.42 * ratios.overall, 0]} material={skinMaterial}>
        <cylinderGeometry args={[0.06, 0.08, 0.15 * ratios.overall, 12]} />
      </mesh>
    );
  };

  // 몸통 생성 함수 (더 현실적인 형태)
  const createTorso = () => {
    return (
      <mesh position={[0, 1.1 * ratios.overall, 0]} material={clothingMaterial} scale={[ratios.chest, 0.7 * ratios.torsoLength, 0.6]}>
        <sphereGeometry args={[0.2, 16, 16]} />
      </mesh>
    );
  };

  // 허리 생성 함수
  const createWaist = () => {
    return (
      <mesh position={[0, 0.7 * ratios.overall, 0]} material={clothingMaterial} scale={[ratios.waist, 0.4, 0.5]}>
        <sphereGeometry args={[0.15, 16, 16]} />
      </mesh>
    );
  };

  // 엉덩이 생성 함수
  const createHips = () => {
    return (
      <mesh position={[0, 0.4 * ratios.overall, 0]} material={pantsMaterial} scale={[ratios.hip, 0.5, 0.8]}>
        <sphereGeometry args={[0.18, 16, 16]} />
      </mesh>
    );
  };

  // 다리 생성 함수
  const createLeg = (side: 'left' | 'right') => {
    const xPosition = side === 'left' ? -0.08 * ratios.hip : 0.08 * ratios.hip;
    
    return (
      <group key={side}>
        {/* 허벅지 */}
        <mesh position={[xPosition, 0.05 * ratios.overall, 0]} material={pantsMaterial}>
          <cylinderGeometry args={[0.08 * ratios.thigh, 0.06 * ratios.thigh, 0.4 * ratios.overall, 12]} />
        </mesh>

        {/* 무릎 */}
        <mesh position={[xPosition, -0.2 * ratios.overall, 0]} material={pantsMaterial}>
          <sphereGeometry args={[0.05 * ratios.overall, 8, 8]} />
        </mesh>

        {/* 정강이 */}
        <mesh position={[xPosition, -0.45 * ratios.overall, 0]} material={pantsMaterial}>
          <cylinderGeometry args={[0.05 * ratios.overall, 0.045 * ratios.overall, 0.35 * ratios.overall, 12]} />
        </mesh>
      </group>
    );
  };

  // 팔 생성 함수
  const createArm = (side: 'left' | 'right') => {
    const xPosition = side === 'left' ? -0.22 * ratios.shoulder : 0.22 * ratios.shoulder;
    const rotation: [number, number, number] = side === 'left' ? [0, 0, 0.15] : [0, 0, -0.15];
    
    return (
      <group key={side}>
        {/* 어깨 */}
        <mesh position={[xPosition, 1.25 * ratios.overall, 0]} material={clothingMaterial}>
          <sphereGeometry args={[0.08 * ratios.overall, 8, 8]} />
        </mesh>

        {/* 상완 */}
        <mesh position={[xPosition, 1.0 * ratios.overall, 0]} rotation={rotation} material={skinMaterial}>
          <cylinderGeometry args={[0.06 * ratios.overall, 0.05 * ratios.overall, 0.3 * ratios.overall, 12]} />
        </mesh>

        {/* 팔꿈치 */}
        <mesh position={[xPosition, 0.8 * ratios.overall, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.04 * ratios.overall, 8, 8]} />
        </mesh>

        {/* 전완 */}
        <mesh position={[xPosition, 0.6 * ratios.overall, 0]} rotation={rotation} material={skinMaterial}>
          <cylinderGeometry args={[0.05 * ratios.overall, 0.04 * ratios.overall, 0.25 * ratios.overall, 12]} />
        </mesh>

        {/* 손 */}
        <mesh position={[xPosition, 0.45 * ratios.overall, 0]} material={skinMaterial} scale={[0.8, 1.2, 0.6]}>
          <sphereGeometry args={[0.05 * ratios.overall, 8, 8]} />
        </mesh>
      </group>
    );
  };

  // 발 생성 함수
  const createFoot = (side: 'left' | 'right') => {
    const xPosition = side === 'left' ? -0.08 * ratios.hip : 0.08 * ratios.hip;
    
    return (
      <mesh position={[xPosition, -0.67 * ratios.overall, 0.08 * ratios.overall]} material={shoeMaterial}>
        <boxGeometry args={[0.08 * ratios.overall, 0.05 * ratios.overall, 0.2 * ratios.overall]} />
      </mesh>
    );
  };

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      {createHead()}
      {createNeck()}
      {createTorso()}
      {createWaist()}
      {createHips()}
      {createLeg('left')}
      {createLeg('right')}
      {createArm('left')}
      {createArm('right')}
      {createFoot('left')}
      {createFoot('right')}
    </group>
  );
}

export default function Avatar3D({ userProfile, outfit: _outfit, className }: Avatar3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <directionalLight position={[-10, 10, 5]} intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.3} />
        <pointLight position={[-5, -5, -5]} intensity={0.2} />
        
        <RealisticAvatar
          gender={userProfile.gender}
          bodyType={userProfile.bodyType.id}
          height={userProfile.height}
          weight={userProfile.weight}
        />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
        
        <gridHelper args={[10, 10, '#CCCCCC', '#CCCCCC']} position={[0, -0.7, 0]} />
      </Canvas>
    </div>
  );
} 