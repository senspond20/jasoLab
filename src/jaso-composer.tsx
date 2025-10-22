// "use client"

import { useState } from "react"
import { Button } from "./components/ui/button"
import { Checkbox } from "./components/ui/checkbox"
import { FolderOpen, Play, FileText, FileArchive, Image, FileType  } from "lucide-react"
import { invoke } from "@tauri-apps/api/core"
import { sep } from "@tauri-apps/api/path"
import { open } from "@tauri-apps/plugin-dialog";

interface FileItem {
  name: string
  path: string
  ext: string
  jaso: boolean
  selected: boolean
}

export default function JasoComposer() {
  const [folderPath, setFolderPath] = useState<string>("")
  const [files, setFiles] = useState<FileItem[]>([])

  // Tauri에서 폴더 선택 다이얼로그 열기
  // const handleOpenFolder = async () => {
  //   // TODO: Tauri의 dialog API 연동
  //   // const selected = await open({ directory: true, multiple: false })

  //   // 임시 데모 데이터
  //   setFolderPath("C:\\Users\\Documents\\jaso-files")
  //   setFiles([
  //     { name: "ㄱㅏㄴㅏㄷㅏ.txt", path: "C:\\Users\\Documents\\jaso-files\\ㄱㅏㄴㅏㄷㅏ.txt", selected: false },
  //     { name: "ㅎㅏㄴㄱㅜㄱ.txt", path: "C:\\Users\\Documents\\jaso-files\\ㅎㅏㄴㄱㅜㄱ.txt", selected: false },
  //     { name: "ㅇㅣㄹㅂㅗㄴ.txt", path: "C:\\Users\\Documents\\jaso-files\\ㅇㅣㄹㅂㅗㄴ.txt", selected: false },
  //     { name: "ㅁㅣㄱㅜㄱ.txt", path: "C:\\Users\\Documents\\jaso-files\\ㅁㅣㄱㅜㄱ.txt", selected: false },
  //   ])
  // }


   const handleOpenFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "자소파일 폴더 선택",
      });
      if (!selected) return;

      setFolderPath(selected as string);

      // Rust 명령 호출 → 파일 목록 가져오기
      const files = await invoke<FileItem[]>("list_jaso_files", {
        dirPath: selected,
      });

      console.log(files)
      setFiles(files);
    } catch (err) {
      console.error("폴더 열기 실패:", err);
    }
  };

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

  const getFileIcon = (ext: string) => {
    const iconProps = { size: 18, className: "text-white" }
    switch (ext) {
      case "pdf":
        return <div className="rounded-md bg-red-500"><FileText {...iconProps} /></div>
      case "zip":
      case "rar":
        return <div className="rounded-md bg-yellow-500"><FileArchive {...iconProps} /></div>
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <div className="rounded-md bg-blue-500"><Image {...iconProps} /></div>
      case "hwp":
      case "doc":
      case "docx":
        return <div className="rounded-md bg-green-500"><FileType {...iconProps} /></div>
      default:
        return <div className="rounded-md bg-gray-400"><FileText {...iconProps} /></div>
    }
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
        <div className="p-6 space-y-4">
          {/* 자소 분리 파일 섹션 */}
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-sm font-semibold text-rose-500">자소 분리 파일</h2>
              <span className="text-xs text-muted-foreground">
                {files.filter((f) => f.jaso).length}개
              </span>
            </div>
            {files.filter((f) => f.jaso).length > 0 ? (
              <div className="space-y-1">
                {files
                  .filter((f) => f.jaso)
                  .map((file, index) => (
                    <div
                      key={file.path}
                      className="flex items-center gap-3 rounded-lg px-4 "
                    >
                      <Checkbox
                        checked={file.selected}
                        onCheckedChange={() => handleToggleFile(index)}
                      />
                      {getFileIcon(file.ext)}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{file.name}</div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">
                자소 분리된 파일이 없습니다.
              </div>
            )}
          </div>

          {/* ✅ 정상 파일 섹션 */}
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-sm font-semibold text-blue-500">정상 파일</h2>
              <span className="text-xs text-muted-foreground">
                {files.filter((f) => !f.jaso).length}개
              </span>
            </div>
            {files.filter((f) => !f.jaso).length > 0 ? (
              <div className="space-y-1">
                {files
                  .filter((f) => !f.jaso)
                  .map((file, index) => (
                    <div
                      key={file.path}
                      className="flex items-center gap-3 rounded-lg bg-card px-4 hover:bg-accent transition"
                    >
                      {/* 정상 파일은 선택 불가 */}
                      <div className="pointer-events-none opacity-40">
                        <Checkbox checked={file.selected} />
                      </div>
                      {getFileIcon(file.ext)}
                      <div className="flex-1">
                        <div className="text-sm">{file.name}</div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center">
                정상 파일이 없습니다.
              </div>
            )}
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
        <Button onClick={handleCompose} disabled={selectedCount === 0} className="w-full" size="lg" variant="secondary">
          <Play className="mr-2 h-5 w-5" />
          자소합성 실행 {selectedCount > 0 && `(${selectedCount}개)`}
        </Button>
      </div>
    </div>
  )
}
