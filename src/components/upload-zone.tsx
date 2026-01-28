"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileImage, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress' // 注意：如果沒有安裝 progress 需要補裝，這裡先假設用簡單的 div 模擬

export function UploadZone() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 過濾非圖片或 PDF (這裡先簡單只收圖片)
    const newFiles = acceptedFiles.filter(file => file.type.startsWith('image/'))
    
    if (newFiles.length !== acceptedFiles.length) {
        toast.warning("部分非圖片檔案已被略過")
    }

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    }
  })

  const removeFile = (name: string) => {
    setFiles(files.filter(f => f.name !== name))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    setUploadProgress(0)

    // 模擬上傳進度
    const interval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 95) {
                clearInterval(interval)
                return 95
            }
            return prev + 5
        })
    }, 200)

    // 這裡未來接真實的 Server Action
    try {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 假裝傳了 2 秒
        setUploadProgress(100)
        toast.success(`成功上傳 ${files.length} 份筆記`, {
            description: "AI 正在背景進行辨識與整理..."
        })
        setFiles([])
    } catch (e) {
        toast.error("上傳失敗，請稍後再試")
    } finally {
        setIsUploading(false)
        clearInterval(interval)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6 text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-stone-800">上傳您的筆記</h2>
        <p className="text-stone-500 text-sm">支援手寫稿、掃描檔與截圖，AI 將自動轉譯為 Markdown</p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ease-out bg-stone-50/50 hover:bg-stone-100/80 min-h-[200px] flex flex-col items-center justify-center gap-4 p-8",
          isDragActive ? "border-stone-900 bg-stone-100 scale-[1.01]" : "border-stone-300 hover:border-stone-400",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="relative p-4 rounded-full bg-stone-200/50 group-hover:bg-stone-200 transition-colors">
            <UploadCloud className={cn("w-8 h-8 text-stone-500 group-hover:text-stone-700 transition-colors", isDragActive && "animate-bounce")} />
            {isDragActive && (
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 bg-blue-500 text-white p-1 rounded-full"
                >
                    <Sparkles className="w-3 h-3" />
                </motion.div>
            )}
        </div>

        <div className="text-center space-y-1">
          <p className="text-stone-700 font-medium text-lg">
            {isDragActive ? "放開以添加檔案" : "點擊或拖曳檔案至此"}
          </p>
          <p className="text-stone-400 text-xs">PNG, JPG, WEBP up to 10MB</p>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-stone-500">待上傳清單 ({files.length})</span>
                <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-600 hover:underline">清空</button>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                {files.map((file, idx) => (
                    <motion.div 
                        key={`${file.name}-${idx}`}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-lg shadow-sm group hover:border-stone-300 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-md bg-stone-100 flex items-center justify-center shrink-0 text-stone-400">
                             {/* 這裡未來可以放縮圖預覽 */}
                             <FileImage className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-800 truncate">{file.name}</p>
                            <p className="text-xs text-stone-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); removeFile(file.name) }}
                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="pt-4 flex items-center gap-3">
                 <Button 
                    onClick={handleUpload} 
                    disabled={isUploading}
                    className="flex-1 bg-stone-900 text-stone-50 hover:bg-stone-800 font-medium h-12 text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.99]"
                 >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            處理中... {uploadProgress}%
                        </>
                    ) : (
                        <>開始智慧歸檔</>
                    )}
                 </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
