"use client"
import  JasoComposer from  "./jaso-composer"
import "./App.css"
import { AppHeader } from "./app-header"
import { useEffect, useState } from "react"
import { AppTab } from "./types"
import SplashScreen from "./splash-screen"
import { InfoModal } from "./info"

export default function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [activeTab, setActiveTab] = useState<AppTab>("swap")
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1000) // 2.5초 후 전환
    return () => clearTimeout(timer)
  }, [showInfo])


  const openInfoModal = ()=>{

    
  }

  return (

    <>

      {showSplash ? (
        
        <SplashScreen />
      ) : (
         <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100">
          <AppHeader activeTab={activeTab} onTabChange={setActiveTab} onHelpClick={() => setShowInfo(true)} onInfoClick={()=>setShowInfo(true)} />
          <main className="flex-1 min-h-0">
            <JasoComposer/>
          </main>
          <InfoModal isOpen={showInfo} onClose={()=> setShowInfo(false)}/>     
        </div>
      )}
    </>

  
  )
}
