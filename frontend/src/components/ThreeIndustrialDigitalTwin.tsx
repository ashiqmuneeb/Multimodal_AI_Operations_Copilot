import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { type AppTheme } from '../i18n';

interface ThreeIndustrialDigitalTwinProps {
  theme?: AppTheme;
  onSelectHotspot?: (defectType: 'pump' | 'motor' | 'compressor') => void;
  mode?: 'stage' | 'fullscreen' | 'compact';
  activeEquipmentId?: string;
}

export const ThreeIndustrialDigitalTwin: React.FC<ThreeIndustrialDigitalTwinProps> = ({
  theme = 'cyber',
  onSelectHotspot,
  mode = 'stage',
  activeEquipmentId = 'PMP-702-B'
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);

  // Store exploded state and activeEquipmentId in refs for animation loop access
  const isExplodedRef = useRef<boolean>(false);
  isExplodedRef.current = isExploded;

  const activeEquipmentIdRef = useRef<string>(activeEquipmentId);
  activeEquipmentIdRef.current = activeEquipmentId;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || (mode === 'fullscreen' ? window.innerWidth : 640);
    const height = container.clientHeight || (mode === 'fullscreen' ? window.innerHeight : 420);

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const fogColor = 0x090a0f;
    scene.fog = new THREE.FogExp2(fogColor, 0.028);

    const camera = new THREE.PerspectiveCamera(
      40,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 3.2, 9.8);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Silver & Black Engineering Palette
    const colors = {
      primary: 0xf8fafc,
      secondary: 0xcbd5e1,
      accent: 0x94a3b8,
      grid: 0x222634,
      laser: '#38bdf8'
    };

    // Precision Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight1.position.set(6, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x94a3b8, 1.8);
    dirLight2.position.set(-8, 6, -8);
    scene.add(dirLight2);

    const rimLight = new THREE.PointLight(0x38bdf8, 2.0, 15);
    rimLight.position.set(0, 4, 3);
    scene.add(rimLight);

    // Master Machine Assembly Container
    const machineContainer = new THREE.Group();
    machineContainer.position.set(0, 0.1, 0);
    scene.add(machineContainer);

    // Materials: Gunmetal Cast Iron + Polished Brushed Silver
    const baseMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0x14161f,
      metalness: 0.92,
      roughness: 0.28,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15
    });

    const polishedSteelMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.14,
      clearcoat: 1.0
    });

    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      wireframe: true,
      transparent: true,
      opacity: 0.32
    });

    const defectRedMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e
    });

    const defectAmberMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b
    });

    const dialGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.05
    });

    // =========================================================================
    // MODEL 1: CENTRIFUGAL SLURRY PUMP (PMP-702-B)
    // =========================================================================
    const pumpMasterGroup = new THREE.Group();
    machineContainer.add(pumpMasterGroup);

    // Pump Base Skid
    const pumpBaseGeo = new THREE.BoxGeometry(4.8, 0.22, 2.2);
    const pumpBase = new THREE.Mesh(pumpBaseGeo, baseMetalMat);
    pumpBase.position.set(0, -1.2, 0);
    pumpMasterGroup.add(pumpBase);

    // Sub-assemblies for pump exploded view
    const pumpVoluteGroup = new THREE.Group();
    const pumpImpellerGroup = new THREE.Group();
    const pumpBeltGroup = new THREE.Group();
    const pumpPedestalGroup = new THREE.Group();
    pumpMasterGroup.add(pumpVoluteGroup);
    pumpMasterGroup.add(pumpImpellerGroup);
    pumpMasterGroup.add(pumpBeltGroup);
    pumpMasterGroup.add(pumpPedestalGroup);

    // 1a. Bearing Pedestal
    const pedestalGeo = new THREE.BoxGeometry(1.6, 1.2, 1.4);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, baseMetalMat);
    pedestalMesh.position.set(-0.2, -0.5, 0);
    pumpPedestalGroup.add(pedestalMesh);

    // 1b. Volute Spiral Casing
    const voluteGeo = new THREE.TorusGeometry(1.4, 0.52, 20, 36);
    const voluteMesh = new THREE.Mesh(voluteGeo, baseMetalMat);
    voluteMesh.position.set(1.4, 0.2, 0);
    pumpVoluteGroup.add(voluteMesh);

    const voluteWire = new THREE.Mesh(voluteGeo, wireframeMat);
    voluteWire.position.copy(voluteMesh.position);
    pumpVoluteGroup.add(voluteWire);

    // Axial Suction Inlet Nozzle
    const suctionGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.2, 24);
    suctionGeo.rotateZ(Math.PI / 2);
    const suctionNozzle = new THREE.Mesh(suctionGeo, polishedSteelMat);
    suctionNozzle.position.set(2.4, 0.2, 0);
    pumpVoluteGroup.add(suctionNozzle);

    // Suction Flange Lip Ring
    const suctionFlangeGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.15, 24);
    suctionFlangeGeo.rotateZ(Math.PI / 2);
    const suctionFlange = new THREE.Mesh(suctionFlangeGeo, baseMetalMat);
    suctionFlange.position.set(3.0, 0.2, 0);
    pumpVoluteGroup.add(suctionFlange);

    // Vertical Discharge Outlet Nozzle
    const dischargeGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.3, 24);
    const dischargeNozzle = new THREE.Mesh(dischargeGeo, polishedSteelMat);
    dischargeNozzle.position.set(1.4, 1.6, 0);
    pumpVoluteGroup.add(dischargeNozzle);

    // Discharge Flange Top Ring
    const dischargeFlangeGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.15, 24);
    const dischargeFlange = new THREE.Mesh(dischargeFlangeGeo, baseMetalMat);
    dischargeFlange.position.set(1.4, 2.25, 0);
    pumpVoluteGroup.add(dischargeFlange);

    // 1c. Internal Impeller
    const impellerGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.25, 16);
    impellerGeo.rotateZ(Math.PI / 2);
    const impellerMesh = new THREE.Mesh(impellerGeo, polishedSteelMat);
    impellerMesh.position.set(1.4, 0.2, 0);
    pumpImpellerGroup.add(impellerMesh);

    // Impeller Vanes (5 curved vanes)
    for (let v = 0; v < 5; v++) {
      const vaneGeo = new THREE.BoxGeometry(0.08, 0.65, 0.22);
      const vane = new THREE.Mesh(vaneGeo, polishedSteelMat);
      const ang = (v / 5) * Math.PI * 2;
      vane.position.set(1.4, 0.2 + Math.sin(ang) * 0.45, Math.cos(ang) * 0.45);
      vane.rotation.x = ang + 0.35;
      pumpImpellerGroup.add(vane);
    }

    // 1d. V-Belt Pulley Drive Assembly
    const pumpShaftGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.6, 24);
    pumpShaftGeo.rotateZ(Math.PI / 2);
    const pumpShaft = new THREE.Mesh(pumpShaftGeo, polishedSteelMat);
    pumpShaft.position.set(-0.2, 0.2, 0);
    pumpPedestalGroup.add(pumpShaft);

    // Driven Pulley on pump shaft
    const drivenPulleyGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.25, 32);
    drivenPulleyGeo.rotateX(Math.PI / 2);
    const drivenPulley = new THREE.Mesh(drivenPulleyGeo, baseMetalMat);
    drivenPulley.position.set(-1.6, 0.2, 0.8);
    pumpBeltGroup.add(drivenPulley);

    // Driver Pulley (offset higher)
    const driverPulleyGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.25, 32);
    driverPulleyGeo.rotateX(Math.PI / 2);
    const driverPulley = new THREE.Mesh(driverPulleyGeo, baseMetalMat);
    driverPulley.position.set(-1.6, 1.5, 0.8);
    pumpBeltGroup.add(driverPulley);

    // V-Belt Connecting Loop with Loose 32mm Slack Deflection
    const beltSpanGeo = new THREE.BoxGeometry(0.12, 1.4, 0.09);
    const pumpBeltSpan = new THREE.Mesh(beltSpanGeo, defectAmberMat);
    pumpBeltSpan.position.set(-1.6, 0.85, 0.8);
    pumpBeltGroup.add(pumpBeltSpan);

    // Hotspot 1: Belt Slack Indicator
    const beltHotspotGeo = new THREE.TorusGeometry(0.32, 0.06, 12, 24);
    beltHotspotGeo.rotateY(Math.PI / 2);
    const beltHotspotRing = new THREE.Mesh(beltHotspotGeo, defectAmberMat);
    beltHotspotRing.position.set(-1.6, 0.85, 0.8);
    pumpBeltGroup.add(beltHotspotRing);

    // Hotspot 2: Volute Casing Inspection Point
    const voluteHotspotGeo = new THREE.TorusGeometry(0.4, 0.06, 12, 24);
    const voluteHotspotRing = new THREE.Mesh(voluteHotspotGeo, defectRedMat);
    voluteHotspotRing.position.set(1.4, 0.2, 0.6);
    pumpVoluteGroup.add(voluteHotspotRing);

    // =========================================================================
    // MODEL 2: ELECTRIC INDUCTION MOTOR (MTR-401-A)
    // =========================================================================
    const motorMasterGroup = new THREE.Group();
    machineContainer.add(motorMasterGroup);

    // Motor Base Skid
    const motorBaseGeo = new THREE.BoxGeometry(4.2, 0.22, 2.4);
    const motorBase = new THREE.Mesh(motorBaseGeo, baseMetalMat);
    motorBase.position.set(0, -1.2, 0);
    motorMasterGroup.add(motorBase);

    // Sub-assemblies for motor exploded view
    const motorStatorGroup = new THREE.Group();
    const motorBearingGroup = new THREE.Group();
    const motorShaftGroup = new THREE.Group();
    const motorFanGroup = new THREE.Group();
    motorMasterGroup.add(motorStatorGroup);
    motorMasterGroup.add(motorBearingGroup);
    motorMasterGroup.add(motorShaftGroup);
    motorMasterGroup.add(motorFanGroup);

    // 2a. Motor Stator Main Body
    const statorGeo = new THREE.CylinderGeometry(1.35, 1.35, 3.2, 36);
    statorGeo.rotateZ(Math.PI / 2);
    const statorBody = new THREE.Mesh(statorGeo, baseMetalMat);
    statorBody.position.set(0, 0, 0);
    motorStatorGroup.add(statorBody);

    const statorWire = new THREE.Mesh(statorGeo, wireframeMat);
    statorWire.position.copy(statorBody.position);
    motorStatorGroup.add(statorWire);

    // 12 Longitudinal Perimeter Cooling Fins
    for (let f = 0; f < 12; f++) {
      const angle = (f / 12) * Math.PI * 2;
      const finGeo = new THREE.BoxGeometry(3.0, 0.12, 0.35);
      const finMesh = new THREE.Mesh(finGeo, polishedSteelMat);
      finMesh.position.set(0, Math.sin(angle) * 1.42, Math.cos(angle) * 1.42);
      finMesh.rotation.x = angle;
      motorStatorGroup.add(finMesh);
    }

    // Top Electrical Terminal / Junction Box
    const termGeo = new THREE.BoxGeometry(0.9, 0.55, 0.85);
    const termMesh = new THREE.Mesh(termGeo, baseMetalMat);
    termMesh.position.set(-0.1, 1.65, 0);
    motorStatorGroup.add(termMesh);

    // Terminal wire gland nut
    const glandGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16);
    const glandMesh = new THREE.Mesh(glandGeo, polishedSteelMat);
    glandMesh.position.set(-0.1, 1.95, 0);
    motorStatorGroup.add(glandMesh);

    // 2b. Drive-End (DE) Bearing Housing with Red Hotspot
    const deBearingGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.55, 32);
    deBearingGeo.rotateZ(Math.PI / 2);
    const deBearingHousing = new THREE.Mesh(deBearingGeo, baseMetalMat);
    deBearingHousing.position.set(1.7, 0, 0);
    motorBearingGroup.add(deBearingHousing);

    // Hotspot 1: 94.5°C Bearing Hotspot (Pulsing Alarm Ring)
    const motorHotspotGeo = new THREE.TorusGeometry(0.72, 0.1, 16, 32);
    motorHotspotGeo.rotateY(Math.PI / 2);
    const motorHotspotRing = new THREE.Mesh(motorHotspotGeo, defectRedMat);
    motorHotspotRing.position.set(1.9, 0, 0);
    motorBearingGroup.add(motorHotspotRing);

    // 2c. Machined Rotating Drive Output Shaft
    const mtrShaftGeo = new THREE.CylinderGeometry(0.32, 0.32, 4.4, 24);
    mtrShaftGeo.rotateZ(Math.PI / 2);
    const mtrShaft = new THREE.Mesh(mtrShaftGeo, polishedSteelMat);
    mtrShaft.position.set(0.6, 0, 0);
    motorShaftGroup.add(mtrShaft);

    // Shaft Keyway slot
    const keywayGeo = new THREE.BoxGeometry(0.7, 0.08, 0.08);
    const keyway = new THREE.Mesh(keywayGeo, baseMetalMat);
    keyway.position.set(2.4, 0.32, 0);
    motorShaftGroup.add(keyway);

    // 2d. Rear Non-Drive-End (NDE) Fan Shroud & Internal Cooling Fan
    const fanCowlGeo = new THREE.CylinderGeometry(1.38, 1.38, 0.8, 32);
    fanCowlGeo.rotateZ(Math.PI / 2);
    const fanCowl = new THREE.Mesh(fanCowlGeo, baseMetalMat);
    fanCowl.position.set(-1.8, 0, 0);
    motorFanGroup.add(fanCowl);

    const fanCowlWire = new THREE.Mesh(fanCowlGeo, wireframeMat);
    fanCowlWire.position.copy(fanCowl.position);
    motorFanGroup.add(fanCowlWire);

    // Rotating 6-blade cooling fan inside shroud
    const mtrFanBlades = new THREE.Group();
    mtrFanBlades.position.set(-1.75, 0, 0);
    motorFanGroup.add(mtrFanBlades);
    for (let fb = 0; fb < 6; fb++) {
      const bladeGeo = new THREE.BoxGeometry(0.06, 0.85, 0.2);
      const bladeMesh = new THREE.Mesh(bladeGeo, polishedSteelMat);
      bladeMesh.rotation.x = (fb / 6) * Math.PI * 2;
      mtrFanBlades.add(bladeMesh);
    }

    // =========================================================================
    // MODEL 3: ROTARY AIR COMPRESSOR (CMP-108-C)
    // =========================================================================
    const compressorMasterGroup = new THREE.Group();
    machineContainer.add(compressorMasterGroup);

    // Compressor Skid & Saddles
    const compBaseGeo = new THREE.BoxGeometry(5.2, 0.2, 2.4);
    const compBase = new THREE.Mesh(compBaseGeo, baseMetalMat);
    compBase.position.set(0, -1.2, 0);
    compressorMasterGroup.add(compBase);

    // Sub-assemblies for compressor exploded view
    const compTankGroup = new THREE.Group();
    const compScrewHeadGroup = new THREE.Group();
    const compFilterGroup = new THREE.Group();
    const compValveGroup = new THREE.Group();
    compressorMasterGroup.add(compTankGroup);
    compressorMasterGroup.add(compScrewHeadGroup);
    compressorMasterGroup.add(compFilterGroup);
    compressorMasterGroup.add(compValveGroup);

    // 3a. Horizontal Pressure Receiver Tank
    const tankGeo = new THREE.CylinderGeometry(1.05, 1.05, 4.2, 32);
    tankGeo.rotateZ(Math.PI / 2);
    const tankMesh = new THREE.Mesh(tankGeo, baseMetalMat);
    tankMesh.position.set(0, -0.2, 0);
    compTankGroup.add(tankMesh);

    const tankWire = new THREE.Mesh(tankGeo, wireframeMat);
    tankWire.position.copy(tankMesh.position);
    compTankGroup.add(tankWire);

    // Left and Right Hemispherical End Caps
    const leftCapGeo = new THREE.SphereGeometry(1.05, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    leftCapGeo.rotateZ(Math.PI / 2);
    const leftCap = new THREE.Mesh(leftCapGeo, baseMetalMat);
    leftCap.position.set(-2.1, -0.2, 0);
    compTankGroup.add(leftCap);

    const rightCapGeo = new THREE.SphereGeometry(1.05, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    rightCapGeo.rotateZ(-Math.PI / 2);
    const rightCap = new THREE.Mesh(rightCapGeo, baseMetalMat);
    rightCap.position.set(2.1, -0.2, 0);
    compTankGroup.add(rightCap);

    // Two Tank Mounting Saddles
    const saddle1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 2.0), polishedSteelMat);
    saddle1.position.set(-1.4, -0.9, 0);
    compTankGroup.add(saddle1);

    const saddle2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 2.0), polishedSteelMat);
    saddle2.position.set(1.4, -0.9, 0);
    compTankGroup.add(saddle2);

    // 3b. Top-Mounted Twin Screw Compressor Head Module
    const screwBoxGeo = new THREE.BoxGeometry(1.9, 1.15, 1.25);
    const screwBox = new THREE.Mesh(screwBoxGeo, baseMetalMat);
    screwBox.position.set(-0.4, 1.25, 0);
    compScrewHeadGroup.add(screwBox);

    const screwBoxWire = new THREE.Mesh(screwBoxGeo, wireframeMat);
    screwBoxWire.position.copy(screwBox.position);
    compScrewHeadGroup.add(screwBoxWire);

    // Screw motor drive coupling tube
    const compCouplingGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.1, 24);
    compCouplingGeo.rotateZ(Math.PI / 2);
    const compCoupling = new THREE.Mesh(compCouplingGeo, polishedSteelMat);
    compCoupling.position.set(1.0, 1.25, 0);
    compScrewHeadGroup.add(compCoupling);

    // 3c. Air Suction Filter Canister
    const filterCanisterGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.95, 24);
    const filterCanister = new THREE.Mesh(filterCanisterGeo, polishedSteelMat);
    filterCanister.position.set(-1.1, 2.2, 0);
    compFilterGroup.add(filterCanister);

    // 3d. Safety Relief Valve & Pressure Port (Hissing Air Leak Defect at 8.2 Bar)
    const valveStemGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.65, 16);
    const valveStem = new THREE.Mesh(valveStemGeo, polishedSteelMat);
    valveStem.position.set(0.6, 2.1, 0.4);
    compValveGroup.add(valveStem);

    // Hotspot 1: 8.2 Bar Air Leak Hissing Beacon
    const leakBeaconGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const leakBeacon = new THREE.Mesh(leakBeaconGeo, defectAmberMat);
    leakBeacon.position.set(0.6, 2.45, 0.4);
    compValveGroup.add(leakBeacon);

    const leakPulseRingGeo = new THREE.TorusGeometry(0.35, 0.05, 12, 24);
    leakPulseRingGeo.rotateX(Math.PI / 2);
    const leakPulseRing = new THREE.Mesh(leakPulseRingGeo, defectAmberMat);
    leakPulseRing.position.set(0.6, 2.45, 0.4);
    compValveGroup.add(leakPulseRing);

    // Analog Dial Pressure Gauge on front tank port
    const gaugeBodyGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 24);
    gaugeBodyGeo.rotateX(Math.PI / 2);
    const gaugeBody = new THREE.Mesh(gaugeBodyGeo, baseMetalMat);
    gaugeBody.position.set(1.2, 0.1, 1.15);
    compTankGroup.add(gaugeBody);

    const gaugeGlassGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.05, 24);
    gaugeGlassGeo.rotateX(Math.PI / 2);
    const gaugeGlass = new THREE.Mesh(gaugeGlassGeo, dialGlassMat);
    gaugeGlass.position.set(1.2, 0.1, 1.22);
    compTankGroup.add(gaugeGlass);

    // Needle dial pointer inside gauge
    const needleGeo = new THREE.BoxGeometry(0.04, 0.28, 0.02);
    const needleMesh = new THREE.Mesh(needleGeo, defectRedMat);
    needleMesh.position.set(1.2, 0.15, 1.2);
    needleMesh.rotation.z = -0.7; // ~8.2 bar marker
    compTankGroup.add(needleMesh);

    // =========================================================================
    // HOLOGRAPHIC SCANNING LASER & CYBERNETIC GROUND GRID
    // =========================================================================
    const laserPlaneGeo = new THREE.PlaneGeometry(8.5, 4.5);
    const laserPlaneMat = new THREE.MeshBasicMaterial({
      color: colors.primary,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const laserPlane = new THREE.Mesh(laserPlaneGeo, laserPlaneMat);
    laserPlane.rotation.x = Math.PI / 2;
    scene.add(laserPlane);

    // Cybernetic Floor Grid
    const floorGrid = new THREE.GridHelper(35, 35, colors.primary, colors.grid);
    floorGrid.position.y = -1.35;
    scene.add(floorGrid);

    // Neural Telemetry Particles (600 particles)
    const PARTICLE_COUNT = 600;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    const pColor = new Float32Array(PARTICLE_COUNT * 3);
    const primaryColorObj = new THREE.Color(colors.primary);
    const amberColorObj = new THREE.Color(0xf59e0b);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const rad = 1.0 + Math.random() * 3.6;
      pPos[i3] = (Math.random() - 0.5) * 6.5;
      pPos[i3 + 1] = -1.0 + Math.random() * 3.2;
      pPos[i3 + 2] = Math.sin(angle) * rad;

      const c = Math.random() > 0.4 ? primaryColorObj : amberColorObj;
      pColor[i3] = c.r;
      pColor[i3 + 1] = c.g;
      pColor[i3 + 2] = c.b;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColor, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particleField = new THREE.Points(pGeo, pMat);
    scene.add(particleField);

    // =========================================================================
    // MOUSE INTERACTION & DRAG ORBIT
    // =========================================================================
    let targetRotY = 0.35;
    let targetRotX = 0.12;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const domTarget = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = domTarget.getBoundingClientRect();
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        targetRotY += deltaX * 0.008;
        targetRotX += deltaY * 0.008;
        targetRotX = Math.max(-0.4, Math.min(0.8, targetRotX));
      } else {
        targetRotX = THREE.MathUtils.lerp(targetRotX, 0.12 + normY * 0.15, 0.1);
      }
    };

    domTarget.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    // Raycaster for 3D Hotspot Click
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onCanvasClick = (e: MouseEvent) => {
      const rect = domTarget.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);

      const activeId = activeEquipmentIdRef.current;
      if (activeId === 'PMP-702-B') {
        const intersects = raycaster.intersectObjects([beltHotspotRing, voluteHotspotRing, drivenPulley, voluteMesh]);
        if (intersects.length > 0 && onSelectHotspot) {
          onSelectHotspot('pump');
        }
      } else if (activeId === 'MTR-401-A') {
        const intersects = raycaster.intersectObjects([motorHotspotRing, deBearingHousing, statorBody]);
        if (intersects.length > 0 && onSelectHotspot) {
          onSelectHotspot('motor');
        }
      } else if (activeId === 'CMP-108-C') {
        const intersects = raycaster.intersectObjects([leakBeacon, leakPulseRing, gaugeBody, tankMesh]);
        if (intersects.length > 0 && onSelectHotspot) {
          onSelectHotspot('compressor');
        }
      }
    };

    domTarget.addEventListener('click', onCanvasClick);

    // Animation Loop
    const clock = new THREE.Clock();
    const lookTarget = new THREE.Vector3(0, 0.2, 0);

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const activeId = activeEquipmentIdRef.current;

      // Smooth Switch between the 3 distinct 3D models
      const isPump = activeId === 'PMP-702-B';
      const isMotor = activeId === 'MTR-401-A';
      const isCompressor = activeId === 'CMP-108-C';

      const pumpTargetScale = isPump ? 1.0 : 0.0001;
      const motorTargetScale = isMotor ? 1.0 : 0.0001;
      const compTargetScale = isCompressor ? 1.0 : 0.0001;

      pumpMasterGroup.scale.lerp(new THREE.Vector3(pumpTargetScale, pumpTargetScale, pumpTargetScale), 0.12);
      motorMasterGroup.scale.lerp(new THREE.Vector3(motorTargetScale, motorTargetScale, motorTargetScale), 0.12);
      compressorMasterGroup.scale.lerp(new THREE.Vector3(compTargetScale, compTargetScale, compTargetScale), 0.12);

      pumpMasterGroup.visible = pumpMasterGroup.scale.x > 0.03;
      motorMasterGroup.visible = motorMasterGroup.scale.x > 0.03;
      compressorMasterGroup.visible = compressorMasterGroup.scale.x > 0.03;

      // Dynamic Camera Position per machine
      let targetCamX = 0;
      let targetCamY = 3.2;
      let targetCamZ = 9.8;
      let targetLookX = 0;
      let targetLookY = 0.2;

      if (isPump) {
        targetCamX = 1.0;
        targetCamY = 2.8;
        targetCamZ = 9.2;
        targetLookX = 0.2;
      } else if (isMotor) {
        targetCamX = 0.0;
        targetCamY = 3.0;
        targetCamZ = 9.0;
        targetLookX = 0.1;
      } else if (isCompressor) {
        targetCamX = 0.4;
        targetCamY = 3.4;
        targetCamZ = 9.6;
        targetLookX = 0.1;
      }

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.06);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.06);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.06);

      lookTarget.x = THREE.MathUtils.lerp(lookTarget.x, targetLookX, 0.06);
      lookTarget.y = THREE.MathUtils.lerp(lookTarget.y, targetLookY, 0.06);
      camera.lookAt(lookTarget);

      // Exploded View Expansion
      const expDist = isExplodedRef.current ? 1.0 : 0.0;

      // Pump Exploded offsets
      pumpVoluteGroup.position.x = THREE.MathUtils.lerp(pumpVoluteGroup.position.x, expDist * 1.5, 0.07);
      pumpImpellerGroup.position.z = THREE.MathUtils.lerp(pumpImpellerGroup.position.z, expDist * 1.2, 0.07);
      pumpBeltGroup.position.x = THREE.MathUtils.lerp(pumpBeltGroup.position.x, -expDist * 1.4, 0.07);

      // Motor Exploded offsets
      motorBearingGroup.position.x = THREE.MathUtils.lerp(motorBearingGroup.position.x, expDist * 1.6, 0.07);
      motorFanGroup.position.x = THREE.MathUtils.lerp(motorFanGroup.position.x, -expDist * 1.5, 0.07);
      motorShaftGroup.position.z = THREE.MathUtils.lerp(motorShaftGroup.position.z, expDist * 0.9, 0.07);

      // Compressor Exploded offsets
      compScrewHeadGroup.position.y = THREE.MathUtils.lerp(compScrewHeadGroup.position.y, expDist * 1.2, 0.07);
      compFilterGroup.position.y = THREE.MathUtils.lerp(compFilterGroup.position.y, expDist * 1.5, 0.07);
      compValveGroup.position.z = THREE.MathUtils.lerp(compValveGroup.position.z, expDist * 1.1, 0.07);

      // Rotating Mechanical Components
      if (isPump) {
        impellerMesh.rotation.x += delta * 7.5;
        drivenPulley.rotation.z -= delta * 4.5;
        driverPulley.rotation.z -= delta * 7.2;
      }
      if (isMotor) {
        mtrShaft.rotation.x += delta * 8.0;
        mtrFanBlades.rotation.x += delta * 8.0;
      }

      // Scanning Laser Plane Sweep
      laserPlane.position.y = -1.1 + (Math.sin(elapsed * 1.8) + 1.0) * 1.4;

      // Pulsing Hotspots
      const pulseFast = (Math.sin(elapsed * 6.0) + 1.0) * 0.5;
      const pulseSlow = (Math.sin(elapsed * 4.0) + 1.0) * 0.5;

      beltHotspotRing.scale.setScalar(1.0 + pulseFast * 0.18);
      voluteHotspotRing.scale.setScalar(1.0 + pulseSlow * 0.15);
      motorHotspotRing.scale.setScalar(1.0 + pulseFast * 0.22);
      leakPulseRing.scale.setScalar(1.0 + pulseFast * 0.25);

      // Swirling Neural Particle Motion
      const posArray = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        posArray[i3 + 1] += delta * 0.42;
        if (posArray[i3 + 1] > 2.6) {
          posArray[i3 + 1] = -1.1;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      // Auto Orbit Rotation
      if (isAutoRotate && !isDragging) {
        targetRotY += delta * 0.22;
      }
      machineContainer.rotation.y = THREE.MathUtils.lerp(machineContainer.rotation.y, targetRotY, 0.08);
      machineContainer.rotation.x = THREE.MathUtils.lerp(machineContainer.rotation.x, targetRotX, 0.08);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    // Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const currentW = entry.contentRect.width;
        const currentH = entry.contentRect.height;
        if (currentW > 0 && currentH > 0) {
          camera.aspect = currentW / currentH;
          camera.updateProjectionMatrix();
          renderer.setSize(currentW, currentH);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      domTarget.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      domTarget.removeEventListener('click', onCanvasClick);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme, isAutoRotate, onSelectHotspot, mode]);

  // Current machine defect metadata for the bottom HUD
  const isPump = activeEquipmentId === 'PMP-702-B';
  const isMotor = activeEquipmentId === 'MTR-401-A';
  const isCompressor = activeEquipmentId === 'CMP-108-C';

  return (
    <div
      className={`digital-twin-wrapper ${mode === 'fullscreen' ? 'twin-fullscreen' : 'twin-stage-mode'}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: mode === 'stage' ? '410px' : '100vh',
        overflow: 'hidden',
        borderRadius: mode === 'stage' ? '14px' : '0'
      }}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          cursor: 'grab'
        }}
      />

      {/* Futuristic Corner Brackets (Stage Mode) */}
      {mode === 'stage' && (
        <>
          <div className="stage-corner corner-tl" />
          <div className="stage-corner corner-tr" />
          <div className="stage-corner corner-bl" />
          <div className="stage-corner corner-br" />
        </>
      )}

      {/* Top HUD Bar */}
      <div
        className="stage-top-hud"
        style={{
          position: 'absolute',
          top: 12,
          left: 14,
          right: 14,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(7, 10, 18, 0.84)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            padding: '5px 12px',
            borderRadius: '6px'
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isExploded ? '#f43f5e' : '#38bdf8',
              boxShadow: `0 0 8px ${isExploded ? '#f43f5e' : '#38bdf8'}`,
              display: 'inline-block'
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.04em'
            }}
          >
            {isPump && '3D TWIN: CENTRIFUGAL SLURRY PUMP (PMP-702-B)'}
            {isMotor && '3D TWIN: INDUSTRIAL ELECTRIC MOTOR (MTR-401-A)'}
            {isCompressor && '3D TWIN: ROTARY AIR COMPRESSOR (CMP-108-C)'}
            {' · '}
            {isExploded ? 'EXPLODED VIEW' : 'ASSEMBLED'}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          <button
            onClick={() => setIsExploded((prev) => !prev)}
            style={{
              background: isExploded ? 'rgba(244, 63, 94, 0.25)' : 'rgba(56, 189, 248, 0.15)',
              border: `1px solid ${isExploded ? '#f43f5e' : '#38bdf8'}`,
              color: isExploded ? '#fecdd3' : '#bae6fd',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: '5px',
              transition: 'all 0.2s ease'
            }}
            title="Toggle Exploded CAD breakdown"
          >
            {isExploded ? '🧩 Reassemble' : '💥 Explode 3D'}
          </button>

          <button
            onClick={() => setIsAutoRotate((prev) => !prev)}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '5px',
              transition: 'all 0.2s'
            }}
            title="Pause / Resume continuous rotation"
          >
            {isAutoRotate ? '⏸ Pause' : '🔄 Rotate'}
          </button>
        </div>
      </div>

      {/* Bottom Hotspots HUD Strip */}
      <div
        className="stage-bottom-hud"
        style={{
          position: 'absolute',
          bottom: 12,
          left: 14,
          right: 14,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {isPump && (
            <>
              <button
                onClick={() => onSelectHotspot && onSelectHotspot('pump')}
                style={{
                  background: 'rgba(245, 158, 11, 0.22)',
                  border: '1px solid #f59e0b',
                  color: '#fef3c7',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 9px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
                }}
                title="Diagnose V-Belt Slack Deflection"
              >
                <span>⚠️</span> 32mm Belt Slack Deflection
              </button>
              <button
                onClick={() => onSelectHotspot && onSelectHotspot('pump')}
                style={{
                  background: 'rgba(244, 63, 94, 0.2)',
                  border: '1px solid #f43f5e',
                  color: '#fecdd3',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 9px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Inspect Volute Casing & Impeller Cavitation"
              >
                <span>⚙️</span> Volute Casing & Impeller
              </button>
            </>
          )}

          {isMotor && (
            <>
              <button
                onClick={() => onSelectHotspot && onSelectHotspot('motor')}
                style={{
                  background: 'rgba(244, 63, 94, 0.25)',
                  border: '1px solid #f43f5e',
                  color: '#fecdd3',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 9px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 0 12px rgba(244, 63, 94, 0.3)'
                }}
                title="Diagnose Motor Drive-End Bearing Hotspot"
              >
                <span>🔴</span> 94.5°C Bearing Hotspot
              </button>
              <button
                onClick={() => onSelectHotspot && onSelectHotspot('motor')}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  color: '#bae6fd',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 9px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Inspect 480V Terminal & Cooling Fins"
              >
                <span>⚡</span> 480V Terminal & Cooling Fins
              </button>
            </>
          )}

          {isCompressor && (
            <>
              <button
                onClick={() => onSelectHotspot && onSelectHotspot('compressor')}
                style={{
                  background: 'rgba(245, 158, 11, 0.22)',
                  border: '1px solid #f59e0b',
                  color: '#fef3c7',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 9px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
                }}
                title="Diagnose 8.2 Bar Safety Relief Valve Hiss"
              >
                <span>⚠️</span> 8.2 Bar Air Leak Hissing
              </button>
              <button
                onClick={() => onSelectHotspot && onSelectHotspot('compressor')}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  color: '#bae6fd',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 9px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Inspect Receiver Vessel & Pressure Dial"
              >
                <span>📊</span> Pressure Vessel & Gauge
              </button>
            </>
          )}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--text-dim)',
            background: 'rgba(6, 10, 18, 0.8)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          🖱 Drag to Orbit · Click Hotspot to Inspect
        </div>
      </div>
    </div>
  );
};
