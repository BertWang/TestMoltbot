import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SplitEditor } from "@/components/split-editor";
import { Badge } from "@/components/ui/badge"; // 稍後需確認是否安裝 Badge
import { NoteDeleteButton } from "@/components/note-delete-button"; // 引入刪除按鈕組件
import { ArrowLeft, Clock, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NotePage({ params }: { params: { id: string } }) {
  // Await params object (Next.js 15 requirement)
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/80 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 -ml-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
              筆記檢視
              <span className="text-xs font-sans font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                {note.status}
              </span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
              {note.confidence && (
                <span className={`font-medium ${note.confidence > 0.8 ? 'text-green-600' : 'text-orange-500'}`}>
                   AI 信心度: {(note.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <NoteDeleteButton noteId={note.id} />
        </div>
      </header>

      {/* Main Split View */}
      <div className="flex-1 overflow-hidden relative">
        <SplitEditor note={note} />
      </div>
    </div>
  );
}
