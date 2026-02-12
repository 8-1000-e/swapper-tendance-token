# Stealf Swapper

Module de swap SPL token → token via Jupiter Ultra API.
Front : Next.js 14 (était prévu React Native / Expo mais c'est maintenant du web).

## Flow

1 token, 1 TX, 1 signature Turnkey.

```
User choisit : token input + token output + montant + recipient
       │
       ▼
   order(request, toMint) → Jupiter GET /ultra/v1/order
       │                     (quote + TX unsigned en 1 appel)
       │                     receiver = recipient wallet
       │
       ▼
   User voit le montant estimé, confirme
       │
       ▼
   Front signe la TX via Turnkey (1 passkey)
       │
       ▼
   execute(requestId, signedTx) → Jupiter POST /ultra/v1/execute
       │                           (broadcast TX signée, Jupiter gère le landing)
       │
       ▼
   Recipient reçoit le token output directement
```

Le sender envoie son token, Jupiter swap et envoie directement au recipient via le param `receiver`.

## Structure

```
swapper/
├── srcs/
│   ├── index.ts                          # Exports publics (order, execute, types, constants)
│   ├── constants.ts                      # WSOL_MINT, JUPITER_ULTRA_URL, JUPITER_API_KEY
│   ├── types/
│   │   └── swap.ts                       # OrderRequest/Response, ExecuteRequest/Response, RoutePlan
│   ├── services/
│   │   ├── jupiter/
│   │   │   ├── orderService.ts           # GET /ultra/v1/order (quote + TX)
│   │   │   └── executeService.ts         # POST /ultra/v1/execute (broadcast)
│   │   └── swap/
│   │       └── swapOrchestrator.ts       # Orchestre order + execute
│   └── test-quote.ts                     # Script de test (appel order SOL→USDC)
├── .env                                  # JUPITER_API_KEY
├── package.json                          # name: stealf-swapper
├── tsconfig.json
└── CLAUDE.md
```

## API publique

```typescript
import { order, execute } from 'stealf-swapper';

// 1. Order (quote + TX en 1 appel)
const res = await order({
  inputMint: 'So11111111111111111111111111111111111111112',
  amount: '10000000',
  taker: senderWalletAddress,
  receiver: recipientWalletAddress,
}, outputMintAddress);
// res.outAmount = montant output, res.transaction = TX base64 unsigned

// 2. Signer via Turnkey (côté front)
const signedTx = await turnkey.signTransaction(res.transaction);

// 3. Execute (Jupiter broadcast)
const result = await execute(res.requestId, signedTx);
// result.signature = TX signature on-chain
```

## Notes

- La clé API Jupiter dans `.env` doit être valide (la clé actuelle retourne 401)
- `.gitignore` protège `.env` du commit
- Pas de gestion d'erreur avancée (timeout, retry, validation) — à ajouter si besoin

## Contraintes

- **1 token, 1 TX** : un swap par transaction, pas de multi-token
- **Output flexible** : le token output est passé via `toMint` (second param de `order()`)
- **Destination directe** : le token output arrive chez le recipient via param `receiver`
- **Turnkey signer** : TX sérialisée base64 signée par passkey, pas de keypair exposé
- **Jupiter Ultra API** : nécessite une clé API (header `x-api-key`), endpoints `/ultra/v1/order` et `/ultra/v1/execute`
- **Pas de RPC nécessaire** : Jupiter Ultra gère le broadcast et le landing des TX

## Dev

```bash
# Deps
cd swapper && npm install

# Test quote (nécessite une clé API Jupiter valide dans .env)
npx ts-node srcs/test-quote.ts
```
