import { AdminPanel } from '@/components/admin-panel'
import { VersionInfo } from '@/components/version-info'

export default function SettingsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <AdminPanel />
      
      {/* 版本資訊 */}
      <div className="mt-8">
        <VersionInfo variant="detailed" />
      </div>
    </main>
  )
}
