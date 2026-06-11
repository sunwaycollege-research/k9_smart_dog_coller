import { useState } from 'react'
import TopNav from './components/TopNav'
import Login from './components/Login'
import SelectPet from './components/SelectPet'
import PetDetails from './components/PetDetails'
import Dashboard from './components/Dashboard'

type Screen = 'login' | 'select-pet' | 'pet-details' | 'dashboard'

const STEP: Record<Screen, number> = {
  'login': 0,
  'select-pet': 1,
  'pet-details': 2,
  'dashboard': 3,
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')

  if (screen === 'dashboard') {
    return <Dashboard onSignOut={() => setScreen('login')} />
  }

  return (
    <>
      <TopNav currentStep={STEP[screen]} />
      {screen === 'login'       && <Login      onNext={() => setScreen('select-pet')}  />}
      {screen === 'select-pet'  && <SelectPet  onNext={() => setScreen('pet-details')} />}
      {screen === 'pet-details' && <PetDetails onNext={() => setScreen('dashboard')}   />}
    </>
  )
}
