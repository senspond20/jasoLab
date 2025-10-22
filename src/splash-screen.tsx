"use client"
import { motion } from "framer-motion"

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white select-none z-50">
      {/* 메인 로고 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-center"
      >
        {/* RgbitSoft 로고 */}
        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-md">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-yellow-200 to-blue-200">
            RgbitSoft
          </span>
        </h1>

        <div className="py-4">
          {/* 제품명: JasoLab */}
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="mt-1 text-2xl font-semibold text-white/90 tracking-tight"
          >
            JasoLab — 자소 합성 · 분리 도구
          </motion.h2>

          {/* ✨ 간결한 한 줄 슬로건 */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-3 text-sm text-white/80 font-light"
          >
            쉽고 빠르게, 자소 합성과 분리를 한 번에.
          </motion.p>
        </div>
      </motion.div>

      {/* 로딩 애니메이션 */}
      <motion.div
        className="mt-8 flex space-x-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { delay: 0.3, staggerChildren: 0.1 },
          },
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-white/80"
            variants={{
              hidden: { scale: 0 },
              visible: {
                scale: [1, 1.4, 1],
                transition: { repeat: Infinity, duration: 0.45, delay: i * 0.15 },
              },
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
