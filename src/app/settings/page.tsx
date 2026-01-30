import { SettingsWizard } from '@/components/settings-wizard'
import { VersionInfo } from '@/components/version-info'

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <SettingsWizard />
        
        {/* 版本資訊 */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <VersionInfo variant="detailed" />
        </div>
      </div>
    </main>
  )
}
