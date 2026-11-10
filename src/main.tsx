import '@fontsource-variable/schibsted-grotesk'
import '@fontsource/saira-condensed/500.css'
import '@fontsource/saira-condensed/600.css'
import '@fontsource/saira-condensed/700.css'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// Merkelappene på delene tegnes med skriften, så den må være lastet før 3D-scenen bygges
const fonts = Promise.all(
  [500, 600, 700].map((w) => document.fonts.load(`${w} 40px "Saira Condensed"`)),
)
const timeout = new Promise((resolve) => setTimeout(resolve, 1500))

void Promise.race([fonts, timeout]).then(() => {
  createRoot(document.getElementById('root')!).render(<App />)
})
