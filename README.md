# Stadium Pulse

**StadiumPulse** is an AI-powered wayfinding and accessibility assistant built for the FIFA World Cup 2026. It helps fans navigate stadium landmarks — gates, concourses, sections, restrooms, food concessions, medical points, and sensory quiet rooms — through a conversational chat interface.

🔗 **Live app:** [stadium-pulse-fawn.vercel.app](https://stadium-pulse-fawn.vercel.app/)

## Features

- **Conversational wayfinding** — Ask for directions between any two stadium landmarks in natural language.
- **Deterministic routing** — All directions are grounded in a server-side Dijkstra pathfinding engine (no hallucinated routes or coordinates).
- **Accessibility-first** — Routes can be calculated with accessibility requirements (elevators, ramps) enabled, and the assistant clearly explains accessible path choices.
- **Crowd density awareness** — Warns fans when a route passes through or near congested zones (≥75% density) and explains which congested areas were avoided.
- **Sustainability tips** — Provides eco-friendly guidance on transportation and waste disposal when asked.
- **Multi-language support** — Automatically detects the fan's language (English, Spanish, French, Portuguese, Arabic) and responds accordingly, including proper right-to-left layout handling for Arabic.
- **Rate limiting & input sanitization** — Requests are rate-limited by IP, and all landmark/node inputs are validated and sanitized server-side before routing.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router, Turbopack)
- **UI:** React 19
- **AI:** [AI SDK](https://ai-sdk.dev/) v7 (`ai`, `@ai-sdk/react`) with [Google Gemini](https://ai.google.dev/) (`@ai-sdk/google`)
- **Schema validation:** [Zod](https://zod.dev/)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Hosting:** [Vercel](https://vercel.com/)

## Project Structure

```
stadium-pulse/
├── app/
│   └── api/
│       └── assistant/
│           └── route.ts      # Chat API route: streams AI responses, defines tools
├── lib/
│   ├── security.ts           # Rate limiting & input sanitization
│   ├── routing.ts            # Dijkstra pathfinding & language detection
│   └── data.ts                # Stadium nodes & sustainability data
└── ...
```

## Getting Started

### Prerequisites

- Node.js 22+
- A [Google Generative AI API key](https://aistudio.google.com/apikey)

### Installation

```bash
git clone <your-repo-url>
cd stadium-pulse
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm run start
```

## How It Works

1. A fan sends a message (e.g., *"How do I get to Gate A from Section 211?"* or *"¿Cómo llego a la puerta A?"*).
2. The assistant detects the message language and maps mentioned landmarks to internal node IDs.
3. It calls the `getRoute` tool, which runs a deterministic Dijkstra pathfinding calculation on the server — factoring in accessibility requirements and live crowd density.
4. The assistant presents step-by-step directions, base duration, and crowd-adjusted estimated duration, translated into the fan's language.
5. If the fan asks about transit or waste disposal, the assistant calls `getSustainabilityTip` to surface relevant eco-friendly guidance.

## Deployment

This app is deployed on [Vercel](https://vercel.com/). To deploy your own instance:

1. Push the repository to GitHub.
2. Import the project in the [Vercel dashboard](https://vercel.com/new).
3. Add the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable in the project settings.
4. Deploy — Vercel auto-detects the Next.js configuration.

## License

Add your license here.