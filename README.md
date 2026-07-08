# StadiumPulse — Multilingual Wayfinding & Accessibility Assistant

A GenAI-powered assistant that helps fans navigate FIFA World Cup 2026 stadiums in real time — with crowd-aware routing, first-class accessibility support, multilingual conversation, and sustainability nudges.

**Live demo:** [your-vercel-url-here.vercel.app]
**Repo:** [your-github-repo-url-here]

---

## 1. Chosen Vertical

This project addresses the **Fan Experience & Accessibility** vertical of the Smart Stadiums & Tournament Operations challenge, specifically:

- **Navigation** — turn-by-turn wayfinding through the stadium
- **Accessibility** — wheelchair routes, accessible restrooms, elevators, and quiet/sensory rooms as a first-class conversational path, not an afterthought
- **Multilingual assistance** — auto-detected language support, including right-to-left (RTL) rendering for Arabic
- **Crowd management / real-time decision support** — routing that adapts to live (simulated) gate and concourse density
- **Sustainability** — grounded nudges toward shared transport and recycling points

We deliberately scoped to **one persona (the fan)** and **one deep, well-tested flow**, rather than spreading across multiple dashboards (ops, volunteer, etc.), in order to prioritize code quality, security, testing, and accessibility over feature breadth — as called out in the evaluation criteria.

---

## 2. Approach and Logic

### Why a hybrid architecture (deterministic logic + LLM)

Routing and accessibility decisions are **safety- and reliability-sensitive** — a wrong direction or a missed accessible route is a real-world problem, not just a bad chat reply. So we deliberately split responsibilities:

| Layer | Responsibility | Why |
|---|---|---|
| `lib/routing.ts` (deterministic, pure functions) | Computes the actual route: takes current location, destination, accessibility requirement, and live density data → returns a structured path + reasoning | Testable, predictable, auditable. Never hallucinates a route. |
| LLM (via Vercel AI SDK, tool-calling) | Detects language and intent, calls the routing module as a **tool**, and phrases the structured result naturally in the user's language | Handles the messy, open-ended part (language, tone, follow-up questions) without being trusted with the part that must be correct (the actual path) |

This means the model is never "freehanding" directions — it can only present what the deterministic module computed. This directly targets the "logical decision making based on user context" evaluation point.

### Why accessibility is first-class, not a fallback

Accessibility routing (`accessibleOnly` constraint) is a parameter on the **same** routing function used for standard requests, not a separate, less-tested code path. Any test written for standard routing has an accessibility-constrained counterpart. The UI also treats language and accessibility state as core app state, not optional settings — see §5 below.

### Why crowd data is mocked but structurally realistic

Live IoT/crowd-sensor integration is out of scope for a demo repo, but the routing module is written to consume a `density` value per node exactly as it would from a real feed. Swapping the mock data source (`lib/data.ts`) for a real API would require no change to the routing or LLM layers — only the data source.

---

## 3. How the Solution Works

1. **User sends a message** in any supported language, in the chat UI (`/app`).
2. **Language & intent detection** — the LLM identifies the language and whether the request is wayfinding, accessibility, transport/sustainability, or general.
3. **Tool call** — the LLM calls into `lib/routing.ts` with the parsed destination, accessibility requirement, and the current (simulated, timer-updated) density snapshot from `lib/data.ts`.
4. **Deterministic computation** — the routing module returns a structured result: an ordered list of waypoints plus a plain-language reason for any detour (e.g. "avoided Gate C — 85% capacity").
5. **Natural-language phrasing** — the LLM turns that structured result into a fluent response in the user's detected language, streamed back to the client via the Vercel AI SDK.
6. **UI updates** — the chat response area updates via an ARIA live region (so screen readers announce it), and if the active language is Arabic, the document direction switches to `dir="rtl"` and `lang="ar"`.

All model calls happen **server-side only**, in a Next.js Route Handler (`/app/api/assistant`) — the API key is never exposed to the client.

---

## 4. Assumptions

- Stadium layout, gates, sections, and live density figures are **mocked** (`lib/data.ts`) for demonstration purposes. In a production deployment, this would be replaced by the venue's real-time crowd/IoT sensor feed, with the routing and LLM layers unchanged.
- **Supported languages**: English, Spanish, Portuguese, French, and Arabic — chosen to reflect the 2026 host countries (USA, Canada, Mexico) plus major traveling fan bases. Any unsupported language input falls back gracefully to English with a short notice to the user, rather than failing silently.
- Rate limiting on the API route uses a simple **in-memory token bucket**, sufficient for demo/local scale. A production deployment across multiple serverless instances would need a distributed limiter (e.g. Redis- or Upstash-backed).
- Authentication/user accounts are out of scope — the assistant is treated as a public, stateless kiosk-style experience, consistent with real stadium wayfinding kiosks and fan-facing terminals.
- "Live" crowd density is simulated on a timer rather than sourced from a real feed, but is structured identically to how a real feed would be consumed.

---

## 5. Accessibility

- Semantic HTML with proper landmarks (`main`, `nav`, etc.)
- All interactive elements are keyboard-navigable with visible focus states
- Chat responses are announced via an ARIA live region for screen reader users
- Color contrast meets WCAG AA minimums throughout
- The `html` element's `lang` attribute updates dynamically to match the active conversation language; `dir="rtl"` is applied correctly when Arabic is active
- Meaningful icons/images include descriptive alt text

---

## 6. Security

- The AI provider API key is read **only** from a server-side environment variable and is never sent to or accessible from the client
- All LLM calls are made from a Next.js Route Handler / Server Action — there is no client-side call to the model API
- User input is validated before reaching any tool call (e.g. a destination must resolve to a known node ID in the stadium graph rather than being interpolated as a free string)
- A simple in-memory rate limiter is applied to the assistant API route to reduce abuse risk
- No secrets, tokens, or personally identifiable information are logged

See [`SECURITY.md`](./SECURITY.md) for more detail (if included as a separate file).

---

## 7. Project Structure

```
/app
  /api/assistant       → server-only route handler for AI SDK calls
  page.tsx             → main chat UI
/lib
  routing.ts           → deterministic routing/decision module (pure functions, unit-tested)
  data.ts              → mock stadium graph + simulated live density data
  security.ts          → input validation + rate limiter
/tests                 → unit tests (Vitest/Jest)
.env.example            → placeholder environment variables (.env is gitignored)
README.md
```

---

## 8. Running Locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Create a `.env.local` file based on `.env.example` and add your own API key before running:

```
ANTHROPIC_API_KEY=your_key_here
```

## 9. Running Tests

```bash
npm test
```

Covers:
- Standard routing (shortest valid path)
- Congestion-aware rerouting (avoiding high-density nodes)
- Accessibility-constrained routing (ramp/elevator-only paths)
- Invalid input handling (unknown location IDs, malformed requests)
- Language-detection fallback behavior (unsupported language → English default)

## 10. Building for Production

```bash
npm run build
```

---

## 11. Tech Stack

- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **AI:** Vercel AI SDK (streaming responses, tool calling)
- **Testing:** Vitest
- **Deployment:** Vercel

---

## 12. Future Improvements

- Replace mock density data with a real venue IoT/crowd-sensor feed
- Add persistent, anonymized analytics to identify recurring congestion patterns across match days
- Expand language support based on observed fan demographics per host city
- Add a companion operations view for stadium staff, sharing the same routing/decision core
