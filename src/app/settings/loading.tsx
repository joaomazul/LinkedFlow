import { Loader2 } from 'lucide-react'

export default function SettingsLoading() {
    return (
        <div className="max-w-3xl mx-auto w-full px-6 py-8 flex justify-center mt-20">
            <Loader2 className="animate-spin text-linkedflow-accent" size={32} />
        </div>
    )
}
