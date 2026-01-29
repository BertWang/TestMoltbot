import { NotesListClient } from "@/components/notes-list-client";
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileText, Image as ImageIcon, PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AllNotesPage() {
  const allNotes = await prisma.note.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/30 overflow-hidden">
      {/* Header Area */}
      <header className="px-8 py-6 pb-2 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-1">所有筆記</h2>
        <p className="text-stone-500 font-sans">在此檢視、搜尋與管理您的所有數位筆記。</p>
      </header>
      <NotesListClient allNotes={allNotes} />
    </div>
  );
}