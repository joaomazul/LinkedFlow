import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-lf-bg font-instrument">
            <div className="text-center space-y-6">
                <h1 className="lf-display text-8xl text-lf-accent/50">404</h1>
                <div>
                    <h2 className="lf-title lf-text text-2xl">Página não encontrada</h2>
                    <p className="lf-body text-lf-text3 mt-2">A página que você está procurando não existe ou foi movida.</p>
                </div>
                <Link href="/">
                    <Button variant="outline" className="mt-4 border-lf-border text-lf-text hover:bg-lf-s1 rounded-r-sm">
                        Voltar ao Início
                    </Button>
                </Link>
            </div>
        </div>
    )
}
