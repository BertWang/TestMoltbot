import { UploadZone } from '@/components/upload-zone'

export default function Home() {
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

            {/* 2. Recent Section (Placeholder) */}
            <section>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-bold text-stone-800 font-serif flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                        最近處理
                    </h3>
                    <button className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4">查看全部</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Placeholder Cards */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group relative bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-400 hover:shadow-lg transition-all cursor-pointer">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-1 rounded-full">Markdown</span>
                            </div>
                            <div className="h-32 bg-stone-100 rounded-lg mb-4 flex items-center justify-center text-stone-300">
                                <span className="text-xs">預覽縮圖</span>
                            </div>
                            <h4 className="font-serif font-bold text-stone-800 mb-1 line-clamp-1">量子物理學習筆記 #{i}</h4>
                            <p className="text-xs text-stone-500 line-clamp-2">關於薛丁格方程式的推導過程與筆記，包含手寫公式的修正...</p>
                            <div className="mt-3 flex gap-2">
                                <span className="text-[10px] text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">#物理</span>
                                <span className="text-[10px] text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">#手寫</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    </div>
  );
}
