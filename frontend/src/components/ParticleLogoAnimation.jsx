import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const logoPaths = [
  "/logos/adobe photoshop.png",
  "/logos/ai.png",
  "/logos/canva app.png",
  "/logos/chat-gpt.png",
  "/logos/docker.png",
  "/logos/google cloud.png",
  "/logos/google.png",
  "/logos/meta.png",
  "/logos/node-js.png",
  "/logos/mysql.png",
  "/logos/powerpoint.png",
  "/logos/power bi.png",
  "/logos/python.png",
  "/logos/react3.png",
  "/logos/redis.png",
  "/logos/slack.png",
  "/logos/unity.png",
  "/logos/unreal engine.png",
  "/logos/jira.png",
  "/logos/adobe-after-effects.png",
  "/logos/adobe-illustrator.png",
  "/logos/jira.png",
  "/logos/facebook.png",
  "/logos/instagram.png",
  "/logos/visual-studio.png",
  "/logos/figma.png",
  "/logos/copilot.png",
  "/logos/github.png",
  "logos/adobe-premiere.png",
  "logos/linkedin.png",
  "logos/javascript.png"
];

const ParticleLogoAnimation = () => {
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Regular Particles
    const particleCount = 20000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color1 = new THREE.Color("#5e72e4");
    const color2 = new THREE.Color("#8965e0");

    // Store original positions for stable Z
    const originalPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 2 + 1;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      originalPositions[i3] = positions[i3];
      originalPositions[i3 + 1] = positions[i3 + 1];
      originalPositions[i3 + 2] = positions[i3 + 2];

      const mixedColor = color1.clone().lerp(color2, (positions[i3 + 1] + 1.5) / 3);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.012,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // Logo Particles
    const logoParticles = [];
    const logoOriginalPositions = [];
    const textureLoader = new THREE.TextureLoader();

    logoPaths.forEach((logo, idx) => {
      const logoGeometry = new THREE.BufferGeometry();
      const logoPositions = new Float32Array(3);
      logoPositions[0] = (Math.random() - 0.5) * 10;
      logoPositions[1] = (Math.random() - 0.5) * 6;
      logoPositions[2] = (Math.random() - 0.5) * 4;
      logoGeometry.setAttribute("position", new THREE.BufferAttribute(logoPositions, 3));

      // Store original positions for each logo particle
      logoOriginalPositions.push([...logoPositions]);

      const logoMaterial = new THREE.PointsMaterial({
        size: 0.2,
        map: textureLoader.load(logo),
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });

      const logoParticle = new THREE.Points(logoGeometry, logoMaterial);
      scene.add(logoParticle);

      logoParticles.push(logoParticle);
    });

    // Mouse interaction
    const handleMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Resize handler
    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate regular particles (stable Z axis!)
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = geometry.attributes.position.getX(i);
        const y = geometry.attributes.position.getY(i);
        const z = geometry.attributes.position.getZ(i);

        const waveX = Math.sin(elapsedTime * 0.7 + x * 0.5) * 0.1;
        const waveY = Math.cos(elapsedTime * 0.7 + y * 0.5) * 0.1;
        const mouseVector = new THREE.Vector2(mouse.current.x * 2, mouse.current.y * 2);
        const particleVector = new THREE.Vector2(x, y);
        const dist = mouseVector.distanceTo(particleVector);
        const force = Math.max(0, 1 - dist * 2);
        const angle = mouseVector.sub(particleVector).angle();
        const pushX = Math.cos(angle) * force * -0.2;
        const pushY = Math.sin(angle) * force * -0.2;

        geometry.attributes.position.setX(
          i,
          THREE.MathUtils.lerp(x, originalPositions[i3] + waveX + pushX, 0.1)
        );
        geometry.attributes.position.setY(
          i,
          THREE.MathUtils.lerp(y, originalPositions[i3 + 1] + waveY + pushY, 0.1)
        );
        // Z axis stays stable
        geometry.attributes.position.setZ(
          i,
          THREE.MathUtils.lerp(z, originalPositions[i3 + 2], 0.1)
        );
      }
      geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsedTime * 0.05;

      // Animate logo particles (stable Z axis!)
      logoParticles.forEach((logoParticle, idx) => {
        const logoGeometry = logoParticle.geometry;
        const logoPositions = logoGeometry.attributes.position;
        const x = logoPositions.getX(0);
        const y = logoPositions.getY(0);
        const z = logoPositions.getZ(0);

        const original = logoOriginalPositions[idx];
        const waveX = Math.sin(elapsedTime * 0.5 + x * 0.5) * 0.1;
        const waveY = Math.cos(elapsedTime * 0.5 + y * 0.5) * 0.1;
        const mouseVector = new THREE.Vector2(mouse.current.x * 2, mouse.current.y * 2);
        const logoVector = new THREE.Vector2(x, y);
        const dist = mouseVector.distanceTo(logoVector);
        const force = Math.max(0, 1 - dist * 2);
        const angle = mouseVector.sub(logoVector).angle();
        const pushX = Math.cos(angle) * force * -0.2;
        const pushY = Math.sin(angle) * force * -0.2;

        logoPositions.setX(0, THREE.MathUtils.lerp(x, original[0] + waveX + pushX, 0.1));
        logoPositions.setY(0, THREE.MathUtils.lerp(y, original[1] + waveY + pushY, 0.1));
        // Z axis stays stable
        logoPositions.setZ(0, THREE.MathUtils.lerp(z, original[2], 0.1));
        logoPositions.needsUpdate = true;
        logoParticle.rotation.y = elapsedTime * 0.05;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      particleMaterial.dispose();
      logoParticles.forEach((logoParticle) => {
        logoParticle.geometry.dispose();
        logoParticle.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default ParticleLogoAnimation;