import { useStore } from './store'
import { Scene } from './three/Scene'
import { Picker } from './ui/Picker'
import { HoverTip, Workbench } from './ui/Workbench'

export default function App() {
  const mode = useStore((s) => s.mode)
  return (
    <div className="app" data-mode={mode}>
      <div className="stage">
        <Scene />
      </div>
      {mode === 'select' ? <Picker /> : <Workbench />}
      <HoverTip />
    </div>
  )
}
