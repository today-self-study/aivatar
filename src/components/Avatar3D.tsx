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

    const genderRatios = baseRatios[gender];
    
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
    
    return {
      shoulder: genderRatios.shoulder * adjustment.shoulder * heightRatio,
      chest: genderRatios.chest * adjustment.chest * bmiRatio,
      waist: genderRatios.waist * adjustment.waist * bmiRatio,
      hip: genderRatios.hip * adjustment.hip * bmiRatio,
      thigh: genderRatios.thigh * adjustment.thigh * bmiRatio,
      torsoLength: genderRatios.torsoLength * heightRatio,
      overall: heightRatio
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
    const headGeometry = new THREE.SphereGeometry(0.12 * ratios.overall, 16, 16);
    headGeometry.scale(1, 1.1, 0.9); // 더 자연스러운 머리 형태
    return (
      <mesh geometry={headGeometry} material={skinMaterial} position={[0, 1.58 * ratios.overall, 0]} />
    );
  };

  // 목 생성 함수
  const createNeck = () => {
    const neckGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.15 * ratios.overall, 12);
    return (
      <mesh geometry={neckGeometry} material={skinMaterial} position={[0, 1.42 * ratios.overall, 0]} />
    );
  };

  // 몸통 생성 함수 (더 현실적인 형태)
  const createTorso = () => {
    const torsoGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    torsoGeometry.scale(ratios.chest, 0.7 * ratios.torsoLength, 0.6);
    return (
      <mesh geometry={torsoGeometry} material={clothingMaterial} position={[0, 1.1 * ratios.overall, 0]} />
    );
  };

  // 허리 생성 함수
  const createWaist = () => {
    const waistGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    waistGeometry.scale(ratios.waist, 0.4, 0.5);
    return (
      <mesh geometry={waistGeometry} material={clothingMaterial} position={[0, 0.7 * ratios.overall, 0]} />
    );
  };

  // 엉덩이 생성 함수
  const createHips = () => {
    const hipGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    hipGeometry.scale(ratios.hip, 0.5, 0.8);
    return (
      <mesh geometry={hipGeometry} material={pantsMaterial} position={[0, 0.4 * ratios.overall, 0]} />
    );
  };

  // 다리 생성 함수
  const createLeg = (side: 'left' | 'right') => {
    const xPosition = side === 'left' ? -0.08 * ratios.hip : 0.08 * ratios.hip;
    
    // 허벅지
    const thighGeometry = new THREE.CylinderGeometry(0.08 * ratios.thigh, 0.06 * ratios.thigh, 0.4 * ratios.overall, 12);
    const thighMesh = (
      <mesh geometry={thighGeometry} material={pantsMaterial} position={[xPosition, 0.05 * ratios.overall, 0]} />
    );

    // 무릎
    const kneeGeometry = new THREE.SphereGeometry(0.05 * ratios.overall, 8, 8);
    const kneeMesh = (
      <mesh geometry={kneeGeometry} material={pantsMaterial} position={[xPosition, -0.2 * ratios.overall, 0]} />
    );

    // 정강이
    const shinGeometry = new THREE.CylinderGeometry(0.05 * ratios.overall, 0.045 * ratios.overall, 0.35 * ratios.overall, 12);
    const shinMesh = (
      <mesh geometry={shinGeometry} material={pantsMaterial} position={[xPosition, -0.45 * ratios.overall, 0]} />
    );

    return (
      <group key={side}>
        {thighMesh}
        {kneeMesh}
        {shinMesh}
      </group>
    );
  };

  // 팔 생성 함수
  const createArm = (side: 'left' | 'right') => {
    const xPosition = side === 'left' ? -0.22 * ratios.shoulder : 0.22 * ratios.shoulder;
    const rotation: [number, number, number] = side === 'left' ? [0, 0, 0.15] : [0, 0, -0.15];
    
    // 어깨
    const shoulderGeometry = new THREE.SphereGeometry(0.08 * ratios.overall, 8, 8);
    const shoulderMesh = (
      <mesh geometry={shoulderGeometry} material={clothingMaterial} position={[xPosition, 1.25 * ratios.overall, 0]} />
    );

    // 상완
    const upperArmGeometry = new THREE.CylinderGeometry(0.06 * ratios.overall, 0.05 * ratios.overall, 0.3 * ratios.overall, 12);
    const upperArmMesh = (
      <mesh geometry={upperArmGeometry} material={skinMaterial} position={[xPosition, 1.0 * ratios.overall, 0]} rotation={rotation} />
    );

    // 팔꿈치
    const elbowGeometry = new THREE.SphereGeometry(0.04 * ratios.overall, 8, 8);
    const elbowMesh = (
      <mesh geometry={elbowGeometry} material={skinMaterial} position={[xPosition, 0.8 * ratios.overall, 0]} />
    );

    // 전완
    const forearmGeometry = new THREE.CylinderGeometry(0.05 * ratios.overall, 0.04 * ratios.overall, 0.25 * ratios.overall, 12);
    const forearmMesh = (
      <mesh geometry={forearmGeometry} material={skinMaterial} position={[xPosition, 0.6 * ratios.overall, 0]} rotation={rotation} />
    );

    // 손
    const handGeometry = new THREE.SphereGeometry(0.05 * ratios.overall, 8, 8);
    handGeometry.scale(0.8, 1.2, 0.6);
    const handMesh = (
      <mesh geometry={handGeometry} material={skinMaterial} position={[xPosition, 0.45 * ratios.overall, 0]} />
    );

    return (
      <group key={side}>
        {shoulderMesh}
        {upperArmMesh}
        {elbowMesh}
        {forearmMesh}
        {handMesh}
      </group>
    );
  };

  // 발 생성 함수
  const createFoot = (side: 'left' | 'right') => {
    const xPosition = side === 'left' ? -0.08 * ratios.hip : 0.08 * ratios.hip;
    
    const footGeometry = new THREE.BoxGeometry(0.08 * ratios.overall, 0.05 * ratios.overall, 0.2 * ratios.overall);
    const footMesh = (
      <mesh geometry={footGeometry} material={shoeMaterial} position={[xPosition, -0.67 * ratios.overall, 0.08 * ratios.overall]} />
    );

    return footMesh;
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