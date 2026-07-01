# @vorionsys/n8n-nodes-cognigate

> n8n community node for **Cognigate** — AI agent trust scoring, capability enforcement, and cryptographic audit proof via the [BASIS standard](https://cognigate.dev).

![Cognigate](nodes/Cognigate/cognigate.svg)

## Installation

### In n8n Desktop / Self-Hosted

1. Go to **Settings → Community Nodes**
2. Enter `@vorionsys/n8n-nodes-cognigate`
3. Click **Install**

### Via npm

```bash
cd ~/.n8n
npm install @vorionsys/n8n-nodes-cognigate
```

## Credentials

| Field         | Description                                                                          |
| ------------- | ------------------------------------------------------------------------------------ |
| **Base URL**  | Your Cognigate instance URL (default: `https://cognigate.dev`)                       |
| **API Key**   | Pipeline API key — used for intent, enforce, proof, trust endpoints                  |
| **Admin Key** | _(optional)_ Admin API key — required only for admin & compliance trigger operations |

Generate an API key at your Cognigate dashboard or via `POST /v1/auth/keys`.

## Resources & Operations

### Intent — Goal Processing

| Operation  | Description                                                      |
| ---------- | ---------------------------------------------------------------- |
| **Create** | Normalize an agent goal into a structured plan with risk scoring |
| **Get**    | Retrieve a previously processed intent by ID                     |

### Enforce — Policy Validation

| Operation         | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| **Validate**      | Validate a plan against BASIS policies (lite / standard / strict rigor) |
| **List Policies** | List all available enforcement policies                                 |
| **Get Policy**    | Get details for a specific policy                                       |

### Proof — Cryptographic Audit Ledger

| Operation  | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| **Create** | Create an immutable proof record from an enforcement verdict    |
| **Get**    | Retrieve a proof record by ID                                   |
| **Query**  | Query proof records with filters (entity, decision, date range) |
| **Stats**  | Get proof ledger statistics and chain integrity                 |
| **Verify** | Verify proof integrity and hash-chain linkage                   |

### Agent — Agent CRUD

| Operation    | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| **Register** | Register a new AI agent with capabilities and observation tier |
| **List**     | List all registered agents (filter by tier)                    |
| **Get**      | Get agent details                                              |
| **Update**   | Update agent name or capabilities                              |
| **Revoke**   | Revoke an agent                                                |

### Trust — Trust Lifecycle

| Operation         | Description                                            |
| ----------------- | ------------------------------------------------------ |
| **Admit**         | Admit an agent into the trust system                   |
| **Get Status**    | Get current trust score, tier, and capabilities        |
| **Record Signal** | Record success / failure / violation / neutral signals |
| **Revoke**        | Revoke agent trust with reason                         |
| **History**       | Get trust signal history                               |
| **List Tiers**    | Get all 8 tier definitions (T0–T7)                     |

### Health — Instance Monitoring

| Operation      | Description                             |
| -------------- | --------------------------------------- |
| **Full Check** | Full health check with subsystem status |
| **Liveness**   | Lightweight k8s liveness probe          |
| **Readiness**  | Readiness check                         |

### Reference — Read-Only Lookups

| Operation        | Description                                    |
| ---------------- | ---------------------------------------------- |
| **List Tiers**   | All 8 trust tiers (T0–T7) with score ranges    |
| **Lookup Tier**  | Lookup tier by numeric trust score (0–1000)    |
| **Capabilities** | All 24 capability codes with tier requirements |
| **Errors**       | All error codes with retry guidance            |
| **Rate Limits**  | Rate limits per trust tier                     |
| **Versions**     | API version registry                           |

### Compliance — Continuous Monitoring (CA-7)

| Operation            | Description                                          |
| -------------------- | ---------------------------------------------------- |
| **Health**           | All control health across all frameworks             |
| **Framework Health** | Framework-specific control health                    |
| **Snapshot**         | Point-in-time compliance snapshot                    |
| **Dashboard**        | Aggregated compliance dashboard                      |
| **Evidence**         | Evidence for a specific control ID                   |
| **Trigger Monitor**  | Trigger full compliance check _(admin key required)_ |

**Supported frameworks:** NIST 800-53, EU AI Act, ISO 42001, SOC 2

## Example: Full Governance Pipeline

Chain three Cognigate nodes to implement **INTENT → ENFORCE → PROOF**:

1. **Intent: Create** — Parse the agent's goal into a structured plan with risk analysis
2. **Enforce: Validate** — Pass the plan through BASIS policy evaluation
3. **Proof: Create** — Record the enforcement verdict as an immutable audit proof

This gives you a complete governance pipeline with cryptographic evidence for every agent action.

## Development

```bash
cd packages/n8n-nodes-cognigate
npm install
npm run build
```

### Testing locally with n8n

```bash
# Link the package
cd packages/n8n-nodes-cognigate
npm link

# In your n8n installation
cd ~/.n8n
npm link @vorionsys/n8n-nodes-cognigate
```

## License

Sustainable Use License v1.0 (fair-code) — see [LICENSE.md](./LICENSE.md) for details.

## Links

- [Cognigate API](https://cognigate.dev)
- [BASIS Standard](https://vorion.org/basis)
- [Vorion LLC](https://vorion.org)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
