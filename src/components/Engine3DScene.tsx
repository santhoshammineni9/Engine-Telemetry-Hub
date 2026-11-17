import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CalculationResult, SensorInputs } from '../types/engine';
import {
  RotateCcw,
  Eye,
  Layers,
  Thermometer,
  Zap,
  ChevronDown,
  ChevronUp,
  Maximize2,
} from 'lucide-react';

interface Engine3DSceneProps {
  sensors: SensorInputs;
  result: CalculationResult;
  onChangeSensor: (key: keyof SensorInputs, val: number) => void;
}

export const Engine3DScene: React.FC<Engine3DSceneProps> = ({
  sensors,
  result,
  onChangeSensor,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [activeCameraView, setActiveCameraView] = useState<string>('iso');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  // Mutable refs for animation loop
  const explodedTargetRef = useRef<number>(0);
  const wireframeRef = useRef<boolean>(false);
  const rpmRef = useRef<number>(sensors.rpm);
  const lubTempRef = useRef<number>(sensors.lubOilTemp);
  const coolTempRef = useRef<number>(sensors.coolantTemp);
  const pHealthyRef = useRef<number>(result.pHealthy);

  // Sync refs when props change
  useEffect(() => {
    explodedTargetRef.current = explodedFactor;
  }, [explodedFactor]);

  useEffect(() => {
    wireframeRef.current = isWireframe;
  }, [isWireframe]);

  useEffect(() => {
    rpmRef.current = sensors.rpm;
    lubTempRef.current = sensors.lubOilTemp;
    coolTempRef.current = sensors.coolantTemp;
    pHealthyRef.current = result.pHealthy;
  }, [sensors, result]);

  // Camera preset controller ref
  const setCameraViewRef = useRef<(view: string) => void>(() => {});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.FogExp2(0x080c14, 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(4.5, 3.2, 5.0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go below ground
    controls.minDistance = 2.0;
    controls.maxDistance = 14.0;
    controls.target.set(0, 1.1, 0);

    // Camera preset transition state
    let targetCamPos = camera.position.clone();
    let targetLookAt = controls.target.clone();
    let isTransitioningCam = false;

    setCameraViewRef.current = (view: string) => {
      isTransitioningCam = true;
      if (view === 'iso') {
        targetCamPos.set(4.5, 3.2, 5.0);
        targetLookAt.set(0, 1.1, 0);
      } else if (view === 'front') {
        targetCamPos.set(0.0, 1.4, 5.5);
        targetLookAt.set(0, 1.1, 0);
      } else if (view === 'top') {
        targetCamPos.set(0.1, 6.5, 0.8);
        targetLookAt.set(0, 1.0, 0);
      } else if (view === 'exhaust') {
        targetCamPos.set(-4.2, 2.0, 2.5);
        targetLookAt.set(0, 1.1, 0);
      } else if (view === 'intake') {
        targetCamPos.set(4.2, 2.0, -2.5);
        targetLookAt.set(0, 1.1, 0);
      }
    };

    controls.addEventListener('start', () => {
      isTransitioningCam = false;
    });

    // Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.8);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(6, 8, 6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    // Ground Dyno Stage Platform & Contact Shadow
    const groundGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.15, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.4,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.075;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Dyno mounting rails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.85,
    });
    const railGeo = new THREE.BoxGeometry(0.2, 0.12, 3.6);
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(-0.8, 0.06, 0);
    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(0.8, 0.06, 0);
    scene.add(rail1);
    scene.add(rail2);

    // Grid markings on dyno stage
    const grid = new THREE.GridHelper(8, 24, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // ==========================================
    // PROCEDURAL COMPOSITE ENGINE (THREE.Group)
    // 3-12 parts with distinct silhouettes & PBR
    // ==========================================
    const engineRoot = new THREE.Group();
    scene.add(engineRoot);

    // Materials Library
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x1e2638,
      roughness: 0.4,
      metalness: 0.75,
    });

    const cylinderHeadMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.25,
      metalness: 0.85,
    });

    const valveCoverMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.9,
    });

    const pistonMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.12,
      metalness: 0.95,
    });

    const rodMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.8,
    });

    const exhaustMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.4,
      metalness: 0.8,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    });

    const intakeMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.65,
      metalness: 0.2,
    });

    const fuelRailMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.9,
    });

    const pulleyMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.85,
    });

    // 1. Lower Crankcase / Oil Sump
    const sumpGeo = new THREE.BoxGeometry(1.3, 0.45, 2.6);
    const sump = new THREE.Mesh(sumpGeo, blockMat);
    sump.position.set(0, 0.35, 0);
    sump.castShadow = !isSoftwareGl;
    engineRoot.add(sump);

    // 2. Main Engine Cylinder Block
    const blockGeo = new THREE.BoxGeometry(1.2, 0.9, 2.4);
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.set(0, 1.0, 0);
    block.castShadow = !isSoftwareGl;
    engineRoot.add(block);

    // 3. Cylinder Head (Separable in Exploded View)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.55, 0);
    const headGeo = new THREE.BoxGeometry(1.24, 0.4, 2.45);
    const cylinderHead = new THREE.Mesh(headGeo, cylinderHeadMat);
    cylinderHead.castShadow = !isSoftwareGl;
    headGroup.add(cylinderHead);

    // Cam Cover atop Cylinder Head
    const coverGeo = new THREE.CylinderGeometry(0.55, 0.58, 2.4, 24);
    coverGeo.rotateX(Math.PI / 2);
    const camCover = new THREE.Mesh(coverGeo, valveCoverMat);
    camCover.position.set(0, 0.3, 0);
    camCover.scale.set(1.0, 0.55, 1.0);
    headGroup.add(camCover);
    engineRoot.add(headGroup);

    // 4. Reciprocating Pistons & Connecting Rods (4 Inline Cylinders)
    const pistons: THREE.Mesh[] = [];
    const conRods: THREE.Mesh[] = [];
    const pistonPivots: THREE.Group[] = [];

    const pistonGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.3, 24);
    const rodGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.65, 16);

    const cylinderZPositions = [-0.85, -0.28, 0.28, 0.85];
    const cylinderPhases = [0, Math.PI, Math.PI, 0]; // 1-4, 2-3 inline-4 firing cadence

    cylinderZPositions.forEach((zPos, idx) => {
      const pivot = new THREE.Group();
      pivot.position.set(0, 1.0, zPos);

      const piston = new THREE.Mesh(pistonGeo, pistonMat);
      piston.castShadow = !isSoftwareGl;
      pivot.add(piston);

      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.set(0, -0.35, 0);
      pivot.add(rod);

      pistons.push(piston);
      conRods.push(rod);
      pistonPivots.push(pivot);
      engineRoot.add(pivot);
    });

    // 5. Crankshaft Front Pulley & Flywheel
    const flywheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 32);
    flywheelGeo.rotateX(Math.PI / 2);
    const flywheel = new THREE.Mesh(flywheelGeo, pulleyMat);
    flywheel.position.set(0, 0.45, 1.35);
    engineRoot.add(flywheel);

    const frontPulleyGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 24);
    frontPulleyGeo.rotateX(Math.PI / 2);
    const frontPulley = new THREE.Mesh(frontPulleyGeo, pulleyMat);
    frontPulley.position.set(0, 0.45, -1.35);
    engineRoot.add(frontPulley);

    // 6. Fuel Injection Rail (Top Right)
    const fuelRailGroup = new THREE.Group();
    fuelRailGroup.position.set(0.65, 1.6, 0);
    const railTubeGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 16);
    railTubeGeo.rotateX(Math.PI / 2);
    const fuelRail = new THREE.Mesh(railTubeGeo, fuelRailMat);
    fuelRailGroup.add(fuelRail);

    // 4 injector feeds
    cylinderZPositions.forEach((z) => {
      const injectorGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.22, 12);
      injectorGeo.rotateZ(Math.PI / 4);
      const injector = new THREE.Mesh(injectorGeo, fuelRailMat);
      injector.position.set(-0.08, -0.08, z);
      fuelRailGroup.add(injector);
    });
    engineRoot.add(fuelRailGroup);

    // 7. Exhaust Manifold (Left Side) - Thermal Glowing
    const exhaustGroup = new THREE.Group();
    exhaustGroup.position.set(-0.68, 1.25, 0);
    cylinderZPositions.forEach((z) => {
      const runnerGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.45, 16);
      runnerGeo.rotateZ(Math.PI / 2.5);
      const runner = new THREE.Mesh(runnerGeo, exhaustMat);
      runner.position.set(-0.15, 0, z);
      exhaustGroup.add(runner);
    });
    const collectorGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.3, 20);
    collectorGeo.rotateX(Math.PI / 2);
    const collector = new THREE.Mesh(collectorGeo, exhaustMat);
    collector.position.set(-0.35, 0, 0);
    exhaustGroup.add(collector);
    engineRoot.add(exhaustGroup);

    // 8. Intake Manifold (Right Side)
    const intakeGroup = new THREE.Group();
    intakeGroup.position.set(0.68, 1.25, 0);
    const plenumGeo = new THREE.BoxGeometry(0.35, 0.4, 2.2);
    const plenum = new THREE.Mesh(plenumGeo, intakeMat);
    plenum.position.set(0.2, 0, 0);
    intakeGroup.add(plenum);
    cylinderZPositions.forEach((z) => {
      const runnerGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.35, 16);
      runnerGeo.rotateZ(-Math.PI / 2.5);
      const runner = new THREE.Mesh(runnerGeo, intakeMat);
      runner.position.set(0.08, 0, z);
      intakeGroup.add(runner);
    });
    engineRoot.add(intakeGroup);

    // 9. Coolant Radiator Hose & Thermostat Housing
    const thermoGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.3, 16);
    const thermoHousing = new THREE.Mesh(thermoGeo, cylinderHeadMat);
    thermoHousing.position.set(0, 1.5, -1.3);
    engineRoot.add(thermoHousing);

    // Animation variables
    let animationFrameId = 0;
    const clock = new THREE.Clock();
    let crankAngle = 0;
    let currentExploded = 0;

    const allMaterials = [
      blockMat,
      cylinderHeadMat,
      valveCoverMat,
      pistonMat,
      rodMat,
      exhaustMat,
      intakeMat,
      fuelRailMat,
      pulleyMat,
    ];

    // Main 60fps Render Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const rpm = rpmRef.current;
      const lubTemp = lubTempRef.current;
      const coolTemp = coolTempRef.current;

      // Crankshaft angular velocity in rad/s: (rpm / 60) * 2 * PI
      // Scaled down visually for human inspection comfort at high RPM
      const visualSpeed = (rpm / 60) * Math.PI * 0.8;
      crankAngle += visualSpeed * delta;

      // Piston stroke amplitude = 0.22 units
      const strokeAmp = 0.22;
      pistons.forEach((piston, idx) => {
        const phase = cylinderPhases[idx];
        const disp = Math.sin(crankAngle + phase) * strokeAmp;
        piston.position.y = disp;
        // Connect rod tilt
        conRods[idx].position.y = disp - 0.35;
        conRods[idx].rotation.z = Math.cos(crankAngle + phase) * 0.15;
      });

      // Rotate flywheel and front pulley
      flywheel.rotation.z = crankAngle;
      frontPulley.rotation.z = crankAngle;

      // Thermal Emissive Radiation on Exhaust based on Temperatures
      // Nominal is ~77-78 °C. Above 82 °C it heats up, above 88 °C it glows bright red/amber
      const maxTemp = Math.max(lubTemp, coolTemp);
      const heatFactor = THREE.MathUtils.clamp((maxTemp - 75.0) / 15.0, 0.0, 1.0);

      if (heatFactor > 0.05) {
        // Interpolate between dark red and incandescent orange
        const heatColor = new THREE.Color().lerpColors(
          new THREE.Color(0xb91c1c), // red-700
          new THREE.Color(0xf59e0b), // amber-500
          heatFactor
        );
        exhaustMat.emissive.copy(heatColor);
        exhaustMat.emissiveIntensity = heatFactor * 1.8;
      } else {
        exhaustMat.emissiveIntensity = 0.0;
      }

      // Smooth Exploded View Interpolation using Damping
      const targetExp = explodedTargetRef.current;
      currentExploded = THREE.MathUtils.damp(currentExploded, targetExp, 6.0, delta);

      // Separate components along axes
      headGroup.position.y = 1.55 + currentExploded * 1.2;
      fuelRailGroup.position.x = 0.65 + currentExploded * 0.6;
      fuelRailGroup.position.y = 1.6 + currentExploded * 1.3;
      exhaustGroup.position.x = -0.68 - currentExploded * 0.8;
      intakeGroup.position.x = 0.68 + currentExploded * 0.8;
      sump.position.y = 0.35 - currentExploded * 0.5;

      // Wireframe toggle
      const wf = wireframeRef.current;
      allMaterials.forEach((m) => {
        if (m.wireframe !== wf) m.wireframe = wf;
      });

      // Smooth camera preset interpolation
      if (isTransitioningCam) {
        camera.position.lerp(targetCamPos, 0.08);
        controls.target.lerp(targetLookAt, 0.08);
        if (camera.position.distanceTo(targetCamPos) < 0.05) {
          isTransitioningCam = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Window resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleSelectView = (view: string) => {
    setActiveCameraView(view);
    setCameraViewRef.current(view);
  };

  return (
    <div className="hud-panel relative w-full h-[680px] rounded-xl overflow-hidden flex flex-col">
      {/* Top Telemetry HUD Strip */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Engine Model & RPM Tag */}
        <div className="hud-chamfer bg-[#060a14]/90 px-3.5 py-1.5 border border-sky-500/40 text-xs font-mono pointer-events-auto flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            <span className="font-display font-bold tracking-wider uppercase text-slate-100">Inline-4 Powertrain Simulator</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-sky-300 font-bold tabular-nums">
            {sensors.rpm} <span className="text-[10px] text-slate-400 font-normal">RPM</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-amber-400 font-bold tabular-nums">
            {sensors.lubOilTemp.toFixed(1)}°C <span className="text-[10px] text-slate-400 font-normal">Oil</span>
          </div>
        </div>

        {/* Right: Quick Camera View Buttons */}
        <div className="bg-[#060a14]/90 p-1 rounded-lg border border-sky-500/35 pointer-events-auto flex items-center gap-1 shadow-lg">
          {[
            { id: 'iso', label: 'Isometric' },
            { id: 'front', label: 'Front Crank' },
            { id: 'top', label: 'Head Top' },
            { id: 'exhaust', label: 'Exhaust Runner' },
            { id: 'intake', label: 'Intake Plenum' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleSelectView(v.id)}
              className={`px-2.5 py-1 text-[11px] font-display tracking-wide uppercase rounded transition-colors cursor-pointer ${
                activeCameraView === v.id
                  ? 'bg-sky-500/25 text-sky-200 font-bold border border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Viewport Ergonomic Bottom Dock (Collapsible, <= 15% height footprint) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-4xl transition-all duration-300 ${
          isControlsCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Toggle Tab */}
        <div className="flex justify-center -mb-px">
          <button
            type="button"
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="px-3.5 py-1 bg-[#0a101d] border-t border-x border-sky-500/40 text-[11px] font-display tracking-wider uppercase text-sky-300 hover:text-white rounded-t-md flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            {isControlsCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isControlsCollapsed ? 'Show 3D Engine Controls' : 'Hide Controls'}</span>
          </button>
        </div>

        {/* Floating Dock Body */}
        <div className="hud-panel rounded-xl p-3.5 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Control 1: Exploded View Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>Exploded Cutaway:</span>
                </span>
                <span className="text-sky-300 font-bold tabular-nums">
                  {Math.round(explodedFactor * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedFactor}
                onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                className="hud-slider w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>Assembled</span>
                <span>Exploded View</span>
              </div>
            </div>

            {/* Control 2: Live Engine RPM Quick Scrub */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dyno RPM:</span>
                </span>
                <span className="text-amber-300 font-bold tabular-nums">
                  {sensors.rpm} RPM
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="2240"
                step="10"
                value={sensors.rpm}
                onChange={(e) => onChangeSensor('rpm', parseInt(e.target.value))}
                className="hud-slider w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>60 RPM (Idle)</span>
                <span>2,240 RPM (Surge)</span>
              </div>
            </div>

            {/* Control 3: Wireframe Mode & Thermal Indicator */}
            <div className="flex items-center justify-between md:justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsWireframe(!isWireframe)}
                className={`hud-chamfer px-3 py-1.5 border text-xs font-display tracking-wide uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isWireframe
                    ? 'bg-sky-500/25 border-sky-400/60 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isWireframe ? 'Solid Surface' : 'X-Ray Wireframe'}</span>
              </button>

              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Thermal Radiation</div>
                <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  <span>{sensors.coolantTemp.toFixed(1)}°C Jacket</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
