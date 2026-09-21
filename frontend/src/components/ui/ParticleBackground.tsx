import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleBackground = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { pointer, viewport } = useThree();

  const particleCount = 150;
  const connectionDistance = 2.5;
  const nodeColor = new THREE.Color('#06b6d4'); // Cyan
  const lineColor = new THREE.Color('#9333ea'); // Purple

  // Initialize particles
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = [];
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5; // z
      vel.push(new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02));
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Parallax effect on mouse move
    const targetX = (pointer.x * viewport.width) / 4;
    const targetY = (pointer.y * viewport.height) / 4;
    
    pointsRef.current.rotation.y += 0.001;
    pointsRef.current.rotation.x += 0.0005;
    linesRef.current.rotation.y = pointsRef.current.rotation.y;
    linesRef.current.rotation.x = pointsRef.current.rotation.x;

    // Move particles
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;

      // Bounce off walls
      if (Math.abs(positions[i * 3]) > 10) velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 10) velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2] + 5) > 5) velocities[i].z *= -1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Calculate lines
    const linePositions = [];
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }
    
    linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    
    // Subtle camera parallax
    pointsRef.current.position.x += (targetX - pointsRef.current.position.x) * 0.02;
    pointsRef.current.position.y += (targetY - pointsRef.current.position.y) * 0.02;
    linesRef.current.position.x = pointsRef.current.position.x;
    linesRef.current.position.y = pointsRef.current.position.y;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#06b6d4" transparent opacity={0.8} sizeAttenuation />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#9333ea" transparent opacity={0.15} />
      </lineSegments>
    </>
  );
};

export default ParticleBackground;
