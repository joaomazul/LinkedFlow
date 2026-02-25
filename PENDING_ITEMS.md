# PENDING ITEMS — LinkedFlow Revisão 2026-02-25

Itens que requerem decisão humana ou validação em produção antes de serem marcados como concluídos.

---

## ✅ RESOLVIDO

### 1. Migration do unique index de analytics
**Arquivo**: `src/db/migrations/0004_analytics_unique_snapshot.sql`
**Status**: ✅ Aplicado no banco em 2026-02-25
O unique index `analytics_snapshots_type_idx` em `(user_id, snapshot_type, snapshot_date)` está ativo. O cron `sync-analytics` pode fazer upsert diário sem erros.

---

## 🟡 IMPORTANTE — Completar antes de lançamento público

### 2. Cron do cadence-worker não registrado no vercel.json
**Arquivo**: `vercel.json`
**Ação**: Decidir frequência e adicionar entrada:
```json
{
  "path": "/api/cron/run-cadence",
  "schedule": "0 7 * * *"
}
```
**Nota**: A rota `/api/cron/run-cadence` também precisaria ser criada (wraper para `runCadenceWorker()`).

### 3. Brand voice refresher desabilitado
**Arquivo**: `src/lib/workers/brand-voice-refresher.ts` (linha 27)
**Ação**: Descobrir como obter o `selfProfileId` do próprio usuário via Unipile (endpoint `/me` ou similar), então descomentar `await analyzeBrandVoice(...)`.
**Por quê**: Sem isso, a análise de brand voice só funciona via chamada manual do usuário (`POST /api/posts/analyze-voice`), nunca via cron automático.

---

## 🟢 MELHORIAS — Após primeiros dados reais

### 4. Sanitização de inputs para prompts de IA
**Arquivos**: `src/lib/campaigns/generate-content.ts`, `src/lib/cadence/engine.ts`
**Ação**: Truncar `commentText` e `description` de sinais a ~500 chars antes de incluir em prompts de IA. Previne prompt injection via conteúdo malicioso de usuários reais do LinkedIn.

### 5. Otimização N+1 no campaign-poller
**Arquivo**: `src/lib/workers/campaign-poller.ts` (linha ~82)
**Ação**: Mover o lookup de persona (`db.select().from(personas)`) para fora do loop de comentários, fazendo-o uma única vez por campanha.

### 6. Atualização dos snapshots de migration do Drizzle
**Arquivos**: `src/db/migrations/meta/*.json`
**Ação**: Rodar `npx drizzle-kit generate` para regenerar os snapshots JSON que rastreiam o estado do schema. Isso sincroniza o estado após a migration manual 0004.

---

*Gerado pela revisão técnica de 2026-02-25 — Claude Sonnet 4.6*
