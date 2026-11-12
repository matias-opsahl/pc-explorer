import { ContactShadows, Environment, Grid, Lightformer } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useBuild, useDevice, useStore } from '../store'
import { CameraRig } from './CameraRig'
import { DesktopModel } from './DesktopModel'
import { LaptopModel } from './LaptopModel'

const LOOK = {
  dark: { stage: '#0c1416', cell: '#17302f', section: '#27504a', shadow: 0.62, vignette: 0.6, ambient: 0.5 },
  light: { stage: '#e4ebe6', cell: '#c6d6cd', section: '#9fbcae', shadow: 0.38, vignette: 0.18, ambient: 0.9 },
}

function Studio({ ambient }: { ambient: number }) {
  return (
    <>
      <ambientLight intensity={ambient} />
      <directionalLight
        castShadow
        position={[6, 11, 8]}
        intensity={2.2}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-7, 7, 7, -7, 0.5, 34]} />
      </directionalLight>
      <directionalLight position={[-7, 5, -6]} intensity={1.5} color="#9ad4ff" />
      {/* Light boxes that reflect in metal and glass. Drawn once. */}
      <Environment resolution={256} frames={1} environmentIntensity={1.35}>
        <color attach="background" args={['#060a0b']} />
        <Lightformer form="rect" intensity={3.2} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer form="rect" intensity={2.4} position={[-8, 2.5, 2]} rotation-y={Math.PI / 2} scale={[9, 4, 1]} color="#c3e8ff" />
        <Lightformer form="rect" intensity={1.8} position={[8, 2.5, 3]} rotation-y={-Math.PI / 2} scale={[9, 4, 1]} color="#fff0d2" />
        <Lightformer form="rect" intensity={1.6} position={[0, 2, 9]} rotation-y={Math.PI} scale={[10, 2, 1]} />
        <Lightformer form="ring" intensity={2.2} position={[3, 4, -8]} scale={4} color="#bff3df" />
      </Environment>
    </>
  )
}

function Floor({ look }: { look: (typeof LOOK)['dark'] }) {
  return (
    <>
      <Grid
        position={[0, 0, 0]}
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.7}
        cellColor={look.cell}
        sectionSize={2.5}
        sectionThickness={1.1}
        sectionColor={look.section}
        fadeDistance={30}
        fadeStrength={1.8}
      />
      <ContactShadows position={[0, 0.004, 0]} scale={18} far={6} blur={2.3} opacity={look.shadow} resolution={1024} color="#000000" />
    </>
  )
}

export function Scene() {
  const device = useDevice()
  const build = useBuild()
  const look = LOOK[useStore((s) => s.theme)]
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 32, near: 0.1, far: 140, position: [9, 5, 11] }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onPointerMissed={() => {
        const s = useStore.getState()
        if (s.mode === 'inspect' && s.selected) s.select(null)
      }}
    >
      <color attach="background" args={[look.stage]} />
      <fog attach="fog" args={[look.stage, 26, 70]} />
      <Studio ambient={look.ambient} />
      <Floor look={look} />
      <group key={device.id}>
        {device.kind === 'desktop' ? <DesktopModel build={build} /> : <LaptopModel device={device} build={build} />}
      </group>
      <CameraRig />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={1.35} luminanceSmoothing={0.2} intensity={0.55} radius={0.72} />
        <Vignette offset={0.22} darkness={look.vignette} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </Canvas>
  )
}
