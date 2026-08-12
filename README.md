# Cobreo

Site public bilingue (FR/EN) + outil de diagnostic + CRM admin sécurisé.

## Stack

- Next.js 16 + Untitled UI + Motion
- next-intl (FR/EN)
- Supabase (Auth + Postgres + RLS)
- Netlify hosting
- Resend (emails transactionnels)

## Setup local

```bash
npm install
cp .env.example .env.local
# Remplir les clés Supabase (projet Cobreo) + Resend
npm run dev
```

Ouvrir http://localhost:3000/fr

## Admin CRM

URL (non publique) : `/fr/{NEXT_PUBLIC_ADMIN_PATH_SECRET}`  
Défaut : `/fr/ops-cobreo`

1. Appliquer la migration `supabase/migrations/20260326120000_crm_schema.sql` sur le projet **Cobreo**
2. Désactiver les inscriptions publiques dans Supabase Auth
3. Créer un utilisateur admin + ligne dans `admin_profiles`
4. Activer MFA TOTP pour ce compte

## Déploiement Netlify

- Connecter le repo GitHub
- Variables d'env = `.env.example`
- Domaine `cobreo.ca` + Cloudflare Email Routing

## Notes

- Le MCP Supabase doit pointer sur le projet **Cobreo** (pas un autre projet).
- Auth Untitled UI PRO : `npx untitledui login` pour les composants PRO.
