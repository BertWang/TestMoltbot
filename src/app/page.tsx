import { UploadZone } from '@/components/upload-zone'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Image as ImageIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const recentNotes = await prisma.note.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/30">
        {/* Header Area */}
        <header className="px-8 py-6 pb-2">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-1">早安，S。</h2>
            <p className="text-stone-500 font-sans">準備整理今天的思緒了嗎？</p>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 p-6 flex flex-col gap-8 max-w-5xl mx-auto w-full">
            
            {/* 1. Upload Section */}
            <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-2 hover:shadow-md transition-shadow duration-500">
                <UploadZone />
            </section>

            {/* 2. Recent Section */}
            <section>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-bold text-stone-800 font-serif flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                        最近處理
                    </h3>
                    {/* <Link href="/notes" className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4">查看全部</Link> */}
                </div>
                
                {recentNotes.length === 0 ? (
                    <div className="text-center py-12 bg-stone-100/50 rounded-xl border border-dashed border-stone-200">
                        <p className="text-stone-400 text-sm">尚未有任何筆記，試著上傳第一張圖片吧！</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentNotes.map((note) => (
                            <Link key={note.id} href={`/notes/${note.id}`}>
                                <div className="group relative bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-400 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <span className={`text-[10px] px-2 py-1 rounded-full text-white ${note.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-400'}`}>
                                            {note.status === 'COMPLETED' ? 'Ready' : 'Processing'}
                                        </span>
                                    </div>
                                    <div className="h-32 bg-stone-100 rounded-lg mb-4 overflow-hidden relative border border-stone-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={note.imageUrl} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                        />
                                    </div>
                                    <h4 className="font-serif font-bold text-stone-800 mb-1 line-clamp-1">
                                        {note.summary ? note.summary.split('。')[0] : '無標題筆記'}
                                    </h4>
                                    <p className="text-xs text-stone-500 line-clamp-2 mb-3 flex-1">
                                        {note.summary || note.refinedContent || "等待 AI 解析中..."}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-auto">
                                        {note.tags ? note.tags.split(',').slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] text-stone-500 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">
                                                #{tag.trim()}
                                            </span>
                                        )) : (
                                            <span className="text-[10px] text-stone-300">#未分類</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    </div>
  );
}
