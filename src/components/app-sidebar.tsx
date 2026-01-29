import { Home, Search, Settings, PlusCircle, BookOpen, Layers } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    id: "home",
    title: "儀表板", // 更改為儀表板以區分
    url: "/",
    icon: Home,
  },
  {
    id: "all-notes",
    title: "所有筆記",
    url: "/notes",
    icon: Layers,
  },
  {
    id: "collections",
    title: "知識庫",
    url: "/collections",
    icon: BookOpen,
  },
  {
    id: "search",
    title: "搜尋",
    url: "/search",
    icon: Search,
  },
]

const settingsItems = [
    {
        id: "settings",
        title: "設定",
        url: "/settings",
        icon: Settings,
    }
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-stone-200 bg-stone-50/50 backdrop-blur-sm">
      <SidebarHeader className="p-4 border-b border-stone-100">
        <h1 className="text-xl font-serif font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-stone-700" />
            <span>Moltbot</span>
            <span className="text-[10px] uppercase tracking-wider bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-full font-sans font-medium">Beta</span>
        </h1>
        <p className="text-xs text-stone-500 font-sans pl-8">智慧筆記歸檔系統</p>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-stone-400 text-xs uppercase tracking-widest font-medium mb-2 px-2">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-stone-200/60 active:bg-stone-200 text-stone-600 hover:text-stone-900 transition-all duration-200 ease-in-out">
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                      <span className="font-medium tracking-wide text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

         <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-stone-400 text-xs uppercase tracking-widest font-medium mb-2 px-2">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-stone-200/60 text-stone-600 hover:text-stone-900 transition-all duration-200">
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 opacity-70" />
                      <span className="font-medium tracking-wide text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-stone-200 bg-stone-100/30">
        <button className="w-full group flex items-center justify-center gap-2 bg-stone-900 text-stone-50 py-2.5 rounded-md hover:bg-stone-800 active:scale-[0.98] transition-all shadow-sm hover:shadow-md">
            <PlusCircle className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium">新增筆記</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
