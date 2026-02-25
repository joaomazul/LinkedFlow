"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Wand2, Lightbulb, Link2, AlignLeft, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

export default function NewPostWizard() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [generating, setGenerating] = useState(false)
    const [templates, setTemplates] = useState<any[]>([])

    const [formData, setFormData] = useState({
        inputType: 'idea',
        inputContent: '',
        templateId: '',
        objective: 'engagement',
        icp: ''
    })

    useEffect(() => {
        const fetchTemplates = async () => {
            const res = await fetch('/api/posts/templates')
            const data = await res.json()
            if (data.ok) {
                setTemplates(data.data)
                if (data.data.length > 0) {
                    setFormData(prev => ({ ...prev, templateId: data.data[0].id }))
                }
            }
        }
        fetchTemplates()
    }, [])

    const handleGenerate = async () => {
        if (!formData.inputContent) {
            toast.error('Por favor, insira o conteúdo base.')
            return
        }

        setGenerating(true)
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.ok) {
                toast.success('Post gerado com sucesso!')
                router.push(`/posts/${data.data.id}`)
            } else {
                toast.error(data.error?.message || 'Erro ao gerar post')
            }
        } catch (err) {
            toast.error('Erro de conexão')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Assistente de Criação</h1>
                <p className="text-muted-foreground text-lg">Deixe nossa IA transformar suas ideias em posts magnéticos.</p>

                <div className="flex justify-center items-center gap-4 mt-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= i ? 'bg-primary border-primary text-white' : 'bg-background border-muted text-muted-foreground'
                                }`}>
                                {i}
                            </div>
                            {i < 3 && <div className={`w-16 h-1 ${step > i ? 'bg-primary' : 'bg-muted'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: 'idea', label: 'Ideia Central', icon: Lightbulb, desc: 'Comece com uma frase ou conceito' },
                                { id: 'article_url', label: 'URL de Artigo', icon: Link2, desc: 'Otimize um conteúdo externo' },
                                { id: 'article_text', label: 'Texto Completo', icon: AlignLeft, desc: 'Cole um rascunho ou artigo' },
                            ].map((t) => (
                                <Card
                                    key={t.id}
                                    className={`p-6 cursor-pointer border-2 transition-all hover:border-primary/50 ${formData.inputType === t.id ? 'border-primary ring-2 ring-primary/10' : ''}`}
                                    onClick={() => setFormData({ ...formData, inputType: t.id as any })}
                                >
                                    <t.icon className={`w-8 h-8 mb-4 ${formData.inputType === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <h3 className="font-bold mb-1">{t.label}</h3>
                                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">O que vamos postar?</Label>
                            {formData.inputType === 'idea' ? (
                                <Input
                                    placeholder="Ex: Por que a IA não vai substituir programadores juniores..."
                                    className="h-14 text-lg"
                                    value={formData.inputContent}
                                    onChange={(e) => setFormData({ ...formData, inputContent: e.target.value })}
                                />
                            ) : (
                                <Textarea
                                    placeholder={formData.inputType === 'article_url' ? "https://exemplo.com/artigo-interessante" : "Cole aqui o conteúdo..."}
                                    className="min-h-[150px] text-lg"
                                    value={formData.inputContent}
                                    onChange={(e) => setFormData({ ...formData, inputContent: e.target.value })}
                                />
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Qual o formato desejado?</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {templates.map((tpl) => (
                                    <Card
                                        key={tpl.id}
                                        className={`p-4 cursor-pointer border-2 transition-all ${formData.templateId === tpl.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/30'}`}
                                        onClick={() => setFormData({ ...formData, templateId: tpl.id })}
                                    >
                                        <h4 className="font-bold text-sm">{tpl.name}</h4>
                                        <p className="text-[10px] text-muted-foreground mt-1">{tpl.description}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Objetivo Principal</Label>
                                <RadioGroup
                                    defaultValue={formData.objective}
                                    onValueChange={(v) => setFormData({ ...formData, objective: v })}
                                    className="flex flex-col gap-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="engagement" id="engagement" />
                                        <Label htmlFor="engagement">Puro Engajamento</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="authority" id="authority" />
                                        <Label htmlFor="authority">Autoridade / Especialista</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="conversion" id="conversion" />
                                        <Label htmlFor="conversion">Vendas / Conversão</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-3">
                                <Label>Público-alvo (ICP)</Label>
                                <Input
                                    placeholder="Ex: CEOs de SaaS, Recrutadores..."
                                    value={formData.icp}
                                    onChange={(e) => setFormData({ ...formData, icp: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground">Ajuda a IA a calibrar a linguagem e termos técnicos.</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col items-center justify-center space-y-8 py-12 animate-in fade-in zoom-in-95">
                        <div className="relative">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                                <Sparkles className="w-12 h-12 text-primary" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-background animate-bounce">
                                <Wand2 className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold">Tudo pronto!</h2>
                            <p className="text-muted-foreground max-w-md">Vamos usar o seu **Brand Voice** analisado e sua **Persona** para criar um post épico.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-8 border-t">
                <Button
                    variant="outline"
                    onClick={() => step > 1 && setStep(step - 1)}
                    disabled={step === 1 || generating}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>

                {step < 3 ? (
                    <Button
                        disabled={!formData.inputContent}
                        onClick={() => setStep(step + 1)}
                        className="gap-2"
                    >
                        Próximo <ArrowRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="gap-2 px-8 py-6 rounded-full text-lg shadow-xl shadow-primary/20"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Gerando...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" /> Gerar Post Agora
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}
