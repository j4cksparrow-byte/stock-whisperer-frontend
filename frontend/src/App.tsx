import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import Home from './pages/Home'
import SymbolAnalysis from './pages/SymbolAnalysis'
import Indicators from './pages/Indicators'
import Weights from './pages/Weights'
import Admin from './pages/Admin'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/symbol/:symbol" element={<SymbolAnalysis />} />
        <Route path="/indicators" element={<Indicators />} />
        <Route path="/weights" element={<Weights />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
