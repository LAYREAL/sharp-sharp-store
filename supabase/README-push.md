# Push notifications — one-time setup

## 1. VAPID keys
    npx web-push generate-vapid-keys
- **Public key**  → Vercel env `VITE_VAPID_PUBLIC_KEY` on BOTH projects (store + admin), then redeploy.
- **Private key** → Supabase secret only (never in the frontend).

## 2. Database
Open the Supabase SQL editor and run `supabase/push-schema.sql`.
Before running: edit the `public.admins` / `user_id` names in the "admin can subscribe" policy to match your allow-list table.

## 3. Edge Function
    npm i -g supabase          # or: npx supabase ...
    supabase login
    supabase link --project-ref ozieqzktonrwvpnghvpn
    supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com WEBHOOK_SECRET=some-long-random-string
    supabase functions deploy send-push --no-verify-jwt

## 4. Database Webhooks (Dashboard → Database → Webhooks)
Create two webhooks, both type "Supabase Edge Functions" → `send-push`, with HTTP header `x-webhook-secret: <WEBHOOK_SECRET>`:
1. table `orders`, event **Insert**
2. table `orders`, event **Update**

## 5. Test
- Admin app: log in → tap the bell icon → Allow. (iPhone: install to Home Screen first.)
- Store: place an order → Allow notifications → mark the order **Paid** in the admin app.
