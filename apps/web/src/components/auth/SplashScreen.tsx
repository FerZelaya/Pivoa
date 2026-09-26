import { Logo } from '@/components/ui/logo'

export function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-space-lg bg-background animate-fade-in">
      <Logo className="h-12" />
      <div className="w-40 h-1 rounded-full bg-surface-container-high overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-primary-container animate-[splash_1.1s_ease-in-out_infinite]" />
      </div>
      <style>{`@keyframes splash { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    </div>
  )
}
