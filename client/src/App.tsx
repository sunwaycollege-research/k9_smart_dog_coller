import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import AboutPage from './components/AboutPage'
import Login from './components/Login'
import Register from './components/Register'
import SelectPet from './components/SelectPet'
import PetDetails from './components/PetDetails'
import Dashboard from './components/Dashboard'
import { useAppSelector } from './store/hooks'
import { useGetMeQuery } from './store/apiSlice'

export default function App() {
  const navigate   = useNavigate()
  const auth       = useAppSelector(s => s.auth)
  const { data: meData, isLoading } = useGetMeQuery(undefined, { skip: !auth.isAuthenticated })

  const hasPets = (meData?.user?.pets?.length ?? 0) > 0

  if (auth.isAuthenticated && isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#fff' }}>
        <div className="lv-spin" style={{ width: 40, height: 40, border: '4px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Unauthenticated Only Routes */}
      <Route 
        path="/login" 
        element={
          auth.isAuthenticated 
            ? <Navigate to={hasPets ? '/dashboard' : '/select-pet'} replace />
            : <Login
                onNext={hasPetsAfterLogin => navigate(hasPetsAfterLogin ? '/dashboard' : '/select-pet')}
                onToRegister={() => navigate('/register')}
              />
        } 
      />
      <Route 
        path="/register" 
        element={
          auth.isAuthenticated 
            ? <Navigate to={hasPets ? '/select-pet' : '/dashboard'} replace />
            : <Register
                onNext={() => navigate('/select-pet')}
                onToLogin={() => navigate('/login')}
              />
        } 
      />

      {/* Authenticated Only Routes */}
      <Route 
        path="/dashboard" 
        element={
          auth.isAuthenticated 
            ? <Dashboard onSignOut={() => navigate('/')} />
            : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/select-pet" 
        element={
          auth.isAuthenticated 
            ? <SelectPet onNext={() => navigate('/pet-details')} />
            : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/pet-details" 
        element={
          auth.isAuthenticated 
            ? <PetDetails onNext={() => navigate('/dashboard')} />
            : <Navigate to="/login" replace />
        } 
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
