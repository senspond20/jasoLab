"use client"

import { motion } from "framer-motion"
import { X, Sparkles, Heart } from "lucide-react"
import { Button } from "./components/ui/button"
interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-[#1e1e1e]/95 border border-[#3e3e42] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-center"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-900 to-rose-800 py-6">
          <h2 className="text-2xl font-extrabold text-white drop-shadow-md">JasoLab</h2>
          <p className="text-sm text-white/80 font-light mt-1">자소 합성 · 분리 도구</p>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-gray-300">
          <p className="text-xs leading-relaxed">
            한글 자모가 분리된 파일을 쉽고 빠르게 복원하거나, <br/>
            필요할 때 자소 단위로 분리할 수 있는 도구입니다.
          </p>

          <div className="flex flex-col items-center mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span>버전</span>
              <span className="font-semibold text-white">v1.0.0</span>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-700/50 pt-4 text-xs text-gray-500">
            <p>© 2025 RgbitSoft. All rights reserved.</p>
            {/* <p className="flex items-center justify-center gap-1 mt-1 text-gray-400">
              Made with <Heart className="h-3 w-3 text-rose-400" /> by RgbitSoft
            </p> */}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#252526] border-t border-[#3e3e42] py-3 px-6 flex justify-center">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold px-8 shadow-md"
          >
            닫기
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
