import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { ColorCorrectionShader } from 'three/examples/jsm/shaders/ColorCorrectionShader';

const VHSShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // Add scanlines (finer and even more subtle)
      float scanline = sin(uv.y * 1500.0 + time * 10.0) * 0.8;
      vec4 color = texture2D(tDiffuse, uv);
      color.rgb -= scanline;

      // Add chromatic aberration (gentler offset)
      float chromaOffset = 0.0015 * sin(time * 3.0);
      vec4 r = texture2D(tDiffuse, uv + vec2(chromaOffset, 0.0));
      vec4 g = texture2D(tDiffuse, uv);
      vec4 b = texture2D(tDiffuse, uv - vec2(chromaOffset, 0.0));
      color = vec4(r.r, g.g, b.b, 1.0);

      // Add noise (lower intensity)
      float noise = (fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.02;
      color.rgb += noise;

      // Add a slight vignette effect
      float vignette = smoothstep(0.9, 0.6, distance(uv, vec2(0.5, 0.5)));
      color.rgb *= mix(1.0, 0.85, vignette); // Subtle darkening at edges

      // Add a mild color shift (like old TV phosphor glow)
      color.r *= 1.02;
      color.b *= 0.98;

      gl_FragColor = color;
    }
  `,
};

const ThreeBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background
    mountRef.current.appendChild(renderer.domElement);

    // Post-processing setup
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add VHS Shader Pass
    const vhsPass = new ShaderPass(VHSShader);
    composer.addPass(vhsPass);

    // Add Unreal Bloom Pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // Strength
      0.4, // Radius
      0.85 // Threshold
    );
    composer.addPass(bloomPass);

    // Add Film Pass
    const filmPass = new FilmPass(
      0.35, // Noise intensity
      0.025, // Scanline intensity
      648, // Scanline count
      false // Grayscale
    );
    composer.addPass(filmPass);

    // Add Bokeh Pass (Depth of Field)
    const bokehPass = new BokehPass(scene, camera, {
      focus: 100.0, // Focus distance
      aperture: 0.25, // Aperture size
      maxblur: 0.001, // Maximum blur
    });
    composer.addPass(bokehPass);

    // Add Color Correction Pass
    const colorCorrectionPass = new ShaderPass(ColorCorrectionShader);
    colorCorrectionPass.uniforms['powRGB'].value = new THREE.Vector3(1.4, 1.4, 1.4); // Adjust RGB
    colorCorrectionPass.uniforms['mulRGB'].value = new THREE.Vector3(1.2, 1.2, 1.2); // Adjust brightness
    composer.addPass(colorCorrectionPass);

    // Create multiple grids for depth illusion
    const gridSize = 100;
    const gridDivisions = 50;
    const gridLayers = []; // Array to hold multiple grid layers
    const numLayers = 3; // Number of grid layers
    const layerSpacing = 20; // Distance between grid layers

    for (let i = 0; i < numLayers; i++) {
      const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ff00, 0x00ff00);
      gridHelper.material.opacity = 0.5;
      gridHelper.material.transparent = true;
      gridHelper.position.z = -i * layerSpacing; // Stagger grids along the Z-axis
      scene.add(gridHelper);
      gridLayers.push(gridHelper);
    }

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const globeTexture = textureLoader.load('/globe.png'); // Load globe.png
    const atlasTexture = textureLoader.load('/atlas.png'); // Load atlas.png
    const titleTexture = textureLoader.load('/title.png');
    const subtitleTexture = textureLoader.load('/subtitle.png');
    const footerTexture = textureLoader.load('/footer.png');

    // Create a plane for the title
const titleGeometry = new THREE.PlaneGeometry(40, 5, 10); // Adjust width and height as needed
const titleMaterial = new THREE.MeshBasicMaterial({
  map: titleTexture,
  transparent: true, // Enable transparency if the image has an alpha channel
});
const titlePlane = new THREE.Mesh(titleGeometry, titleMaterial);

// Position the title plane
titlePlane.position.set(0, 32, -20); // Adjust X, Y, Z positions as needed
scene.add(titlePlane);

// Create a plane for the subtitle
const subtitleGeometry = new THREE.PlaneGeometry(12, 4, 1.5); // Adjust width and height as needed
const subtitleMaterial = new THREE.MeshBasicMaterial({
  map: subtitleTexture,
  transparent: true, // Enable transparency if the image has an alpha channel
});
const subtitlePlane = new THREE.Mesh(subtitleGeometry, subtitleMaterial);

// Position the subtitle plane
subtitlePlane.position.set(15, 29, -19); // Adjust X, Y, Z positions as needed
subtitlePlane.rotation.set(0, 0, 0.2); // Rotate the subtitle plane slightly
scene.add(subtitlePlane);

// Create a plane for the footer
const footerGeometry = new THREE.PlaneGeometry(17, 13, 10); // Adjust width and height as needed
const footerMaterial = new THREE.MeshBasicMaterial({
  map: footerTexture,
  transparent: true, // Enable transparency if the image has an alpha channel
});
const footerPlane = new THREE.Mesh(footerGeometry, footerMaterial);

// Position the footer plane
scene.add(footerPlane);


    // Create a sphere with the globe texture
    const globeGeometry = new THREE.SphereGeometry(5, 24, 10);
    const globeMaterial = new THREE.MeshBasicMaterial({ map: globeTexture });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.position.set(-25, 10.5, -15); // Position the globe in the scene
    globe.scale.set(1, 1.2, 1); // Scale Y-axis by 1.2 to make it taller
    scene.add(globe);

    // Create a mirrored globe on the opposite side
    const globeMirror = new THREE.Mesh(globeGeometry, globeMaterial);
    globeMirror.position.set(25, 10.5, -15); // Position the mirrored globe
    globeMirror.scale.set(1, 1.2, 1); // Scale Y-axis by 1.2 to make it taller
    globeMirror.rotation.y = Math.PI; // Rotate to face the opposite direction
    scene.add(globeMirror);

    // Create a plane with the atlas texture
    const atlasGeometry = new THREE.PlaneGeometry(6, 6);
    const atlasMaterial = new THREE.MeshBasicMaterial({
      map: atlasTexture,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide, // Enable rendering on both sides
    });
    const atlas = new THREE.Mesh(atlasGeometry, atlasMaterial);
    atlas.position.set(-20, 3, -10); // Position the atlas in the scene
    scene.add(atlas);

    // Create a mirrored atlas on the opposite side
    const atlasMirror = new THREE.Mesh(atlasGeometry, atlasMaterial);
    atlasMirror.position.set(20, 3, -10); // Position the mirrored atlas
    atlasMirror.rotation.y = Math.PI; // Rotate to face the opposite direction
    scene.add(atlasMirror);

    // Adjust camera position and tilt
    camera.position.set(0, 2, 10); // Lower the camera and move it closer
    camera.lookAt(0, 4, 0); // Tilt the camera upward slightly

    // Create a clock to track time
const clock = new THREE.Clock();

// Define initial state for the footer animation
let footerStartPosition = { x: 0, y: 5, z: 0 }; // Start position in front of the viewer
let footerTargetPosition = { x: -83, y: 116, z: -100 }; // Default position
let footerAnimationDuration = 2; // Duration of the animation in seconds
let footerAnimationDelay = 0.75;
let footerAnimationStartTime = null; // Track when the animation starts


    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Move each grid layer toward the viewer at different speeds
      gridLayers.forEach((grid, index) => {
        grid.position.z += 0.1 * (index + 1); // Faster movement for closer grids
        if (grid.position.z > 0) {
          grid.position.z = -((numLayers - 1) * layerSpacing); // Reset position for infinite scrolling
        }
      });

      // Rotate the globe and its mirrored counterpart
      globe.rotation.y += 0.01;
      globeMirror.rotation.y += 0.01;

       // Pulsate the title plane
  const elapsedTime = clock.getElapsedTime(); // Get the elapsed time
  const scale = 1 + 0.001 * Math.sin(elapsedTime * 2); // Calculate scale using a sine wave
  titlePlane.scale.set(scale, scale, scale); // Apply the scale to the title plane

 // Animate the footer plane
 if (!footerAnimationStartTime) {
  footerAnimationStartTime = elapsedTime; // Set the start time for the footer animation
}
const footerElapsedTime = elapsedTime - footerAnimationStartTime;

if (footerElapsedTime > footerAnimationDelay) {
  // Start animating after the delay
  const animationTime = footerElapsedTime - footerAnimationDelay; // Time since animation started
  if (animationTime < footerAnimationDuration) {
    const t = animationTime / footerAnimationDuration; // Calculate normalized time (0 to 1)
    footerPlane.position.x = THREE.MathUtils.lerp(footerStartPosition.x, footerTargetPosition.x, t); // Interpolate X position
    footerPlane.position.y = THREE.MathUtils.lerp(footerStartPosition.y, footerTargetPosition.y, t); // Interpolate Y position
    footerPlane.position.z = THREE.MathUtils.lerp(footerStartPosition.z, footerTargetPosition.z, t); // Interpolate Z position
  } else {
    footerPlane.position.set(
      footerTargetPosition.x,
      footerTargetPosition.y,
      footerTargetPosition.z
    ); // Snap to the target position after animation ends
  }
} else {
  // Keep the footer in its start position during the delay
  footerPlane.position.set(
    footerStartPosition.x,
    footerStartPosition.y,
    footerStartPosition.z
  );
}
      // Update VHS effect time
      vhsPass.uniforms.time.value += 0.05;

      composer.render();
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default ThreeBackground;