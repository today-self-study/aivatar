import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import type { UserProfile, WardrobeItem } from '../types';

interface Avatar3DProps {
  userProfile: UserProfile;
  outfit: WardrobeItem[];
  className?: string;
}

interface SimpleAvatarProps {
  bodyType: string;
  height: number;
  weight: number;
}

function SimpleAvatar({ bodyType, height, weight }: SimpleAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // 체형에 따른 기본 비율 계산
  const getBodyRatios = () => {
    const baseScale = Math.min(height / 170, weight / 70);
    
    switch (bodyType) {
      case 'slender':
        return { body: baseScale * 0.8, shoulder: baseScale * 0.7, hip: baseScale * 0.7 };
      case 'athletic':
        return { body: baseScale * 1.0, shoulder: baseScale * 1.1, hip: baseScale * 0.9 };
      case 'pear':
        return { body: baseScale * 0.9, shoulder: baseScale * 0.8, hip: baseScale * 1.2 };
      case 'apple':
        return { body: baseScale * 1.1, shoulder: baseScale * 1.2, hip: baseScale * 0.9 };
      case 'hourglass':
        return { body: baseScale * 0.9, shoulder: baseScale * 1.0, hip: baseScale * 1.0 };
      default:
        return { body: baseScale * 1.0, shoulder: baseScale * 1.0, hip: baseScale * 1.0 };
    }
  };

  const ratios = getBodyRatios();

  return (
    <group ref={groupRef}>
      {/* 머리 */}
      <Sphere args={[0.15]} position={[0, 1.6, 0]}>
        <meshLambertMaterial color="#F4C2A1" />
      </Sphere>
      
      {/* 목 */}
      <Cylinder args={[0.05, 0.08, 0.2]} position={[0, 1.35, 0]}>
        <meshLambertMaterial color="#F4C2A1" />
      </Cylinder>
      
      {/* 상체 */}
      <Box args={[0.4 * ratios.shoulder, 0.6, 0.2]} position={[0, 0.9, 0]}>
        <meshLambertMaterial color="#E8E8E8" />
      </Box>
      
      {/* 허리 */}
      <Cylinder args={[0.15 * ratios.body, 0.18 * ratios.body, 0.3]} position={[0, 0.4, 0]}>
        <meshLambertMaterial color="#E8E8E8" />
      </Cylinder>
      
      {/* 엉덩이 */}
      <Box args={[0.35 * ratios.hip, 0.25, 0.22]} position={[0, 0.1, 0]}>
        <meshLambertMaterial color="#4A90E2" />
      </Box>
      
      {/* 왼쪽 다리 */}
      <Cylinder args={[0.08, 0.06, 0.8]} position={[-0.1, -0.5, 0]}>
        <meshLambertMaterial color="#4A90E2" />
      </Cylinder>
      
      {/* 오른쪽 다리 */}
      <Cylinder args={[0.08, 0.06, 0.8]} position={[0.1, -0.5, 0]}>
        <meshLambertMaterial color="#4A90E2" />
      </Cylinder>
      
      {/* 왼쪽 팔 */}
      <Cylinder args={[0.05, 0.04, 0.6]} position={[-0.3, 0.8, 0]} rotation={[0, 0, Math.PI / 8]}>
        <meshLambertMaterial color="#F4C2A1" />
      </Cylinder>
      
      {/* 오른쪽 팔 */}
      <Cylinder args={[0.05, 0.04, 0.6]} position={[0.3, 0.8, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <meshLambertMaterial color="#F4C2A1" />
      </Cylinder>
      
      {/* 왼쪽 발 */}
      <Box args={[0.12, 0.08, 0.25]} position={[-0.1, -0.95, 0.1]}>
        <meshLambertMaterial color="#333333" />
      </Box>
      
      {/* 오른쪽 발 */}
      <Box args={[0.12, 0.08, 0.25]} position={[0.1, -0.95, 0.1]}>
        <meshLambertMaterial color="#333333" />
      </Box>
    </group>
  );
}

export default function Avatar3D({ userProfile, outfit: _outfit, className }: Avatar3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <SimpleAvatar
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
        />
        
        <gridHelper args={[10, 10, '#888888', '#888888']} position={[0, -1, 0]} />
      </Canvas>
    </div>
  );
} 