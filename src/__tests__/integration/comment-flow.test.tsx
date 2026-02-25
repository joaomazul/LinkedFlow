import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CommentZone } from '@/components/feed/CommentZone'
import '@testing-library/jest-dom'

const queryClient = new QueryClient()

// Mocks necessários para não quebrar no JSDOM (Zustand, Lucide, etc)
jest.mock('@/store/settings.store', () => ({
    useSettingsStore: () => ({
        activeLinkedinAccountId: 'test-account',
        defaultCommentStyleId: 'test-style'
    })
}))

jest.mock('@/store/profiles.store', () => ({
    useProfilesStore: () => ({
        profiles: [{ id: 'test-profile', name: 'Profile Test' }]
    })
}))

describe('Fluxo de Comentário (Mocks)', () => {
    it('renderiza o CommentZone inicial no estado idle', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <CommentZone
                    post={{
                        id: 'test-post-id',
                        linkedinPostId: 'test',
                        text: 'Conteúdo de teste para a timeline',
                        authorName: 'Autor do Post',
                    }}
                />
            </QueryClientProvider>
        )

        // Deve ter o botão "Gerar Comentário IA" ou similares
        expect(screen.getByText(/Gerar com IA/i)).toBeInTheDocument()
    })
})
