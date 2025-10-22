// "use client"

import { useState } from "react"
import { Button } from "./components/ui/button"
import { Checkbox } from "./components/ui/checkbox"
import { FolderOpen, Play, FileText, FileArchive, Image, FileType, Folder } from "lucide-react"
import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"

interface FileItem {
  name: string
  path: string
  ext: string
  isDir: boolean
  jaso: boolean
  selected: boolean
}

export default function JasoComposer() {
  const [folderPath, setFolderPath] = useState<string>("")
  const [files, setFiles] = useState<FileItem[]>([])   // 자소 분리 파일
  const [files2, setFiles2] = useState<FileItem[]>([]) // 정상 파일


  const handleOpenFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "폴더 선택 (폴더만 보여요)",
      })
      if (!selected) return

      setFolderPath(selected as string)
      const files = await invoke<FileItem[]>("list_jaso_files", {
        dirPath: selected,
      })
    const jasoFiles = files.filter((f) => f.jaso)
    const normalFiles = files.filter((f) => !f.jaso)

    setFiles(jasoFiles)
    setFiles2(normalFiles)

    console.log("📂 자소 파일:", jasoFiles)
    console.log("📄 정상 파일:", normalFiles)
    } catch (err) {
      console.error("폴더 열기 실패:", err)
    }
  }

  const handleToggleFile = (index: number) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, selected: !file.selected } : file))
    )
  }

 
  const handleToggleFile2 = (index: number) => {
    setFiles2((prev) =>
      prev.map((file, i) => (i === index ? { ...file, selected: !file.selected } : file))
    )
  }

  const handleCompose = async () => {
    const selectedFiles = files.filter((f) => f.selected)
    if (selectedFiles.length === 0) {
      alert("자소 분리 파일을 선택해주세요.")
      return
    }

    try {
      const filePaths = selectedFiles.map((f) => f.path)
      const result = (await invoke("compose_jaso_files", { filePaths })) as {
        results: { old: string; new?: string; status: string }[]
      }

      const updatedFiles = files.map((file) => {
        const renameInfo = result?.results?.find(
          (r: any) => r.old === file.path && r.status === "ok"
        )
        if (renameInfo) {
          const newPath = renameInfo.new
          const newName = newPath.split(/[\\/]/).pop() || file.name
          return { ...file, path: newPath, name: newName, jaso: false, selected: false }
        }
        return file
      })
      const composedFiles = updatedFiles.filter((f) => f.jaso === false)
      const remainingFiles = updatedFiles.filter((f) => f.jaso === true)

      // 상태 반영: 왼쪽 목록은 남은 자소 파일, 오른쪽은 기존 + 새로 합성된 파일
      setFiles(remainingFiles)
      setFiles2((prev) => [...prev, ...composedFiles])
      // alert(`${composedFiles.length}개의 자소 합성이 완료되었습니다!`)
    } catch (err) {
      console.error("자소합성 실패:", err)
      alert("자소합성 중 오류가 발생했습니다.")
    }
  }
function renderVisuallySeparated(name: string) {
  // 자모 분해
  const decomposed = name.normalize("NFD")

  // 각 자소를 span으로 감싸고 letter-spacing 적용
  return decomposed.split("").map((ch, i) => (
    <span key={i} className="inline-block font-mono select-none">
      {ch}
    </span>
  ))
}
  const handleSeparate = async () => {
    const selectedFiles = files2.filter((f) => f.selected)
    if (selectedFiles.length === 0) {
      alert("정상 파일을 선택해주세요.")
      return
    }

    try {
      const filePaths = selectedFiles.map((f) => f.path)
      const result = await invoke<{ results: { old: string; new: string; status: string }[] }>(
        "force_jaso_split",
        { filePaths }
      )

      console.log("자소 분리 결과:", result)

      const splitSuccess = result?.results?.filter((r) => r.status === "ok") || []

      // NFD(자소 분리)된 이름을 UI에서도 반영
     const newJasoFiles: FileItem[] = splitSuccess.map((r) => {
     const newName = r.new.split(/[\\/]/).pop() || "unknown"
     const oldFile = files2.find((f) => f.path === r.old)  // 기존 정보 찾아오기
     const forcedSeparated = newName.normalize("NFD").split("").join("\u200C")
        // 실제 파일 이름은 이미 NFD로 되어 있으므로 그대로 반영
        return {
          name: forcedSeparated,
          path: r.new,
          ext: (r.new.split(".").pop() || "").toLowerCase(),
          isDir: oldFile ? oldFile.isDir : false, // ✅ 폴더 여부 그대로 유지
          jaso: true,
          selected: false,
        }
      })

      // 기존 정상 파일 중 처리된 파일 제거
      const remainingNormalFiles = files2.filter(
        (f) => !splitSuccess.some((r) => r.old === f.path)
      )

      // UI 업데이트
      setFiles((prev) => [...prev, ...newJasoFiles]) // 새 자소 파일로 이동
      setFiles2(remainingNormalFiles) // 처리된 건 제거

      // alert(`${splitSuccess.length}개의 파일 자소분리 완료!`)
    } catch (err) {
      console.error("자소분리 실패:", err)
      alert("자소분리 중 오류가 발생했습니다.")
    }
  }
  const getFileIcon = (ext: string, isDir?: boolean) => {
    const iconProps = { size: 18, className: "text-white" }
    const wrapper = (color: string, icon: JSX.Element) => (
      <div className={`rounded-md p-1 flex items-center justify-center ${color}`}>{icon}</div>
    )

    if (isDir) return wrapper("bg-amber-500", <Folder {...iconProps} />)
    switch (ext) {
      case "pdf":
        return wrapper("bg-red-500", <FileText {...iconProps} />)
      case "zip":
      case "rar":
        return wrapper("bg-yellow-500", <FileArchive {...iconProps} />)
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return wrapper("bg-blue-500", <Image {...iconProps} />)
      case "hwp":
      case "doc":
      case "docx":
        return wrapper("bg-green-500", <FileType {...iconProps} />)
      default:
        return wrapper("bg-gray-400", <FileText {...iconProps} />)
    }
  }

  const selectedCount1 = files.filter((f) => f.selected).length
  const selectedCount2 = files2.filter((f) => f.selected).length

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* 상단 바 */}
      <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md px-6 py-3 rounded-t-[11px]">
        <Button
          onClick={handleOpenFolder}
          variant="outline"
          size="sm"
          className="border-none bg-white/80 hover:bg-white/90 text-gray-800 font-medium shadow-sm"
        >
          <FolderOpen className="mr-2 h-4 w-4 text-purple-500" />
          폴더 열기
        </Button>

        <div className="flex-1 text-sm font-medium text-gray-700 truncate">
          {folderPath || "폴더를 선택하세요"}
        </div>
      </div>

      {/* 중앙 영역: 좌우 분할 */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-border overflow-hidden">
        {/* 좌측: 자소 분리 파일 */}
        <div className="flex flex-col overflow-auto pb-10">
          <div className="pl-4 py-2 pb-2 pr-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  files.filter((f) => f.jaso && f.selected).length ===
                    files.filter((f) => f.jaso).length && files.filter((f) => f.jaso).length > 0
                }
                onCheckedChange={() => {
                  const allSelected = files.filter((f) => f.jaso).every((f) => f.selected)
                  setFiles((prev) =>
                    prev.map((file) =>
                      file.jaso ? { ...file, selected: !allSelected } : file
                    )
                  )
                }}
              />
              <h2 className="text-sm font-semibold text-rose-500">자소 분리 파일</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {(() => {
                const jasoFiles = files.filter((f) => f.jaso)
                const selected = jasoFiles.filter((f) => f.selected).length
                return `${selected} / ${jasoFiles.length}개`
              })()}
            </span>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-2">
            {files.filter((f) => f.jaso).length > 0 ? (
              files
                .filter((f) => f.jaso)
                .map((file, index) => (
                  <div
                    key={file.path}
                    className="flex items-center gap-3 rounded-lg hover:bg-accent transition"
                  >
                    <Checkbox
                      checked={file.selected}
                      onCheckedChange={() => handleToggleFile(index)}
                    />
                    {getFileIcon(file.ext, file.isDir)}
                    <div className="flex-1 text-sm font-medium">{file.name}</div>
                  </div>
                ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">
                자소 분리된 파일이 없습니다.
              </div>
            )}
          </div>

          <div className="sticky bottom-0 px-6 py-4">
          <Button
            onClick={handleCompose}
            disabled={selectedCount1 === 0}
            className={`
              w-full relative isolate overflow-hidden 
              bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500
              hover:from-rose-400 hover:via-pink-400 hover:to-purple-400
              text-white font-semibold tracking-wide 
              transition-all duration-200 
              rounded-xl shadow-md
              hover:shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98]
            `}
            size="lg"
          >
            <div className="flex items-center justify-center">
              자소 합성 실행
              {selectedCount1 > 0 && (
                <span className="ml-2 text-sm opacity-90 mr-2">
                  ({selectedCount1}개)
                </span>
              )}
              <Play className="h-5 w-5" />
            </div>

            {/* ✨ subtle glow 효과 */}
            <span className="absolute inset-0 -z-10 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-20 transition-opacity"></span>
          </Button>
          
          </div>
        </div>

        {/* 우측: 정상 파일 */}
        <div className="flex flex-col overflow-auto pb-10">
          <div className="pl-4 py-2 pb-2 pr-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  files2.length > 0 &&
                  files2.every((f) => f.selected)
                }
                onCheckedChange={() => {
                  const allSelected = files2.every((f) => f.selected)
                  setFiles2((prev) =>
                    prev.map((file) => ({ ...file, selected: !allSelected }))
                  )
                }}
              />
              <h2 className="text-sm font-semibold text-blue-500">정상 파일</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {files2.filter((f) => f.selected).length} / {files2.length}개
            </span>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-2">
            {files2.length > 0 ? (
              files2.map((file, index) => (
                <div
                  key={file.path}
                  className="flex items-center gap-3 rounded-lg hover:bg-accent transition"
                >
                  {/* ✅ 클릭 가능하도록 수정 */}
                  <Checkbox
                    checked={file.selected}
                    onCheckedChange={() => handleToggleFile2(index)}
                  />
                  {getFileIcon(file.ext, file.isDir)}
                  <div className="flex-1 text-sm">{file.name}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">
                정상 파일이 없습니다.
              </div>
            )}
          </div>
            <div className="sticky bottom-0 px-6 py-4">
<Button
  onClick={handleSeparate}
  disabled={selectedCount2 === 0}
  className={`
    w-full relative isolate overflow-hidden 
    bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500
    hover:from-indigo-400 hover:via-blue-400 hover:to-cyan-400
    text-white font-semibold tracking-wide 
    transition-all duration-200 
    rounded-xl shadow-md
    hover:shadow-lg
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `}
  size="lg"
>
  <div className="flex items-center justify-center">
    <Play className="mr-2 h-5 w-5 rotate-180" />
    자소 분리 실행
    {selectedCount2 > 0 && (
      <span className="ml-2 text-sm opacity-90">
        ({selectedCount2}개)
      </span>
    )}
  </div>
  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-20 transition-opacity"></span>
</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
