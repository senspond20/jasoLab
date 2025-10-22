// "use client"

import { useState } from "react"
import { Button } from "./components/ui/button"
import { Checkbox } from "./components/ui/checkbox"
import { FolderOpen, Play } from "lucide-react"

interface FileItem {
  name: string
  path: string
  selected: boolean
}

export default function JasoComposer() {
  const [folderPath, setFolderPath] = useState<string>("")
  const [files, setFiles] = useState<FileItem[]>([])

  // Tauri에서 폴더 선택 다이얼로그 열기
  const handleOpenFolder = async () => {
    // TODO: Tauri의 dialog API 연동
    // const selected = await open({ directory: true, multiple: false })

    // 임시 데모 데이터
    setFolderPath("C:\\Users\\Documents\\jaso-files")
    setFiles([
      { name: "ㄱㅏㄴㅏㄷㅏ.txt", path: "C:\\Users\\Documents\\jaso-files\\ㄱㅏㄴㅏㄷㅏ.txt", selected: false },
      { name: "ㅎㅏㄴㄱㅜㄱ.txt", path: "C:\\Users\\Documents\\jaso-files\\ㅎㅏㄴㄱㅜㄱ.txt", selected: false },
      { name: "ㅇㅣㄹㅂㅗㄴ.txt", path: "C:\\Users\\Documents\\jaso-files\\ㅇㅣㄹㅂㅗㄴ.txt", selected: false },
      { name: "ㅁㅣㄱㅜㄱ.txt", path: "C:\\Users\\Documents\\jaso-files\\ㅁㅣㄱㅜㄱ.txt", selected: false },
    ])
  }

  const handleToggleFile = (index: number) => {
    setFiles((prev) => prev.map((file, i) => (i === index ? { ...file, selected: !file.selected } : file)))
  }

  const handleToggleAll = () => {
    const allSelected = files.every((f) => f.selected)
    setFiles((prev) => prev.map((file) => ({ ...file, selected: !allSelected })))
  }

  const handleCompose = async () => {
    const selectedFiles = files.filter((f) => f.selected)
    if (selectedFiles.length === 0) {
      alert("파일을 선택해주세요")
      return
    }

    // TODO: Tauri의 Rust 백엔드로 자소합성 요청
    console.log("[v0] Composing files:", selectedFiles)
    alert(`${selectedFiles.length}개 파일 자소합성 실행`)
  }

  const selectedCount = files.filter((f) => f.selected).length

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* 상단: 폴더 경로 및 열기 버튼 */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4">
        <Button onClick={handleOpenFolder} variant="outline" size="sm">
          <FolderOpen className="mr-2 h-4 w-4" />
          폴더 열기
        </Button>
        <div className="flex-1 text-sm text-muted-foreground">{folderPath || "폴더를 선택하세요"}</div>
      </div>

      {/* 중앙: 파일 목록 */}
      <div className="flex-1 overflow-auto">
        {files.length > 0 ? (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
              <Checkbox checked={files.every((f) => f.selected)} onCheckedChange={handleToggleAll} />
              <span className="text-sm font-medium">
                전체 선택 ({selectedCount}/{files.length})
              </span>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={file.path}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
                >
                  <Checkbox checked={file.selected} onCheckedChange={() => handleToggleFile(index)} />
                  <div className="flex-1">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{file.path}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            폴더를 열어 파일 목록을 확인하세요
          </div>
        )}
      </div>

      {/* 하단: 실행 버튼 */}
      <div className="border-t border-border bg-card px-6 py-4">
        <Button onClick={handleCompose} disabled={selectedCount === 0} className="w-full" size="lg">
          <Play className="mr-2 h-5 w-5" />
          자소합성 실행 {selectedCount > 0 && `(${selectedCount}개)`}
        </Button>
      </div>
    </div>
  )
}
