"use client"

import { Minus, Square, X, Info, HelpCircle } from "lucide-react"
import { Button } from "./components/ui/button"
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { AppTab } from "./types"
import icon from "./assets/icon.png"
interface AppHeaderProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  onHelpClick: () => void
  onInfoClick: () => void
}

export function AppHeader({ activeTab, onTabChange, onHelpClick, onInfoClick }: AppHeaderProps) {
  const appWindow = getCurrentWindow()

  const minimizeWindow = () => appWindow.minimize()
  const toggleMaximizeWindow = async () => appWindow.toggleMaximize()
  const closeWindow = () => appWindow.close()

  return (
    <div
      data-tauri-drag-region
      className="h-11 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-between px-4 select-none shadow-md"
    >
      {/* Left - App Info */}
      <div className="flex items-center space-x-3">
        {/* <SparklesIcon /> */}
        <img src={icon} alt="App Icon" className="w-8 h-8 rounded-lg" />
        <h1 className="text-lg font-semibold tracking-tight">JasoLab</h1>
        <p className="text-xs text-white/80 font-light">자소 합성 · 분리 도구</p>
      </div>

      {/* Right - Info, Help, Window Controls */}
      <div className="flex items-center space-x-2">
        {/* Info */}
        <Button
          variant="ghost"
          onClick={onInfoClick}
          className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
          title="정보"
        >
          <Info className="h-4 w-4" />
        </Button>

        {/* Help
        <Button
          variant="ghost"
          onClick={onHelpClick}
          className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
          title="도움말"
        >
          <HelpCircle className="h-4 w-4" />
        </Button> */}

        <div className="w-px h-6 bg-white/20 mx-2"></div>

        {/* Window Controls */}
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-10 rounded-none text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation()
              minimizeWindow()
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-10 rounded-none text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation()
              toggleMaximizeWindow()
            }}
          >
            <Square className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-10 rounded-none text-white hover:bg-white/10 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              closeWindow()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function SparklesIcon() {
  return (
    <div className="flex items-center justify-center h-6 w-6 bg-white/20 rounded-md">
      <span className="text-yellow-300 text-sm">✨</span>
    </div>
  )
}
