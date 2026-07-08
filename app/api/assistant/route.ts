import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { checkRateLimit, validateAndSanitizeNodeId } from '../../../lib/security';
import { calculateRoute, detectLanguage, RouteResult } from '../../../lib/routing';
import { SUSTAINABILITY_DATA, NODES, SustainabilityData } from '../../../lib/data';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  // 1. Rate Limiting based on IP
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { messages, accessibilityRequired, crowdDensity } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Detect language from the last user message (UIMessage format: parts[].text)
    type RawPart = { type: string; text?: string };
    type RawMessage = { role: string; parts?: RawPart[] };
    const lastUserMsg = (messages as RawMessage[]).filter(m => m.role === 'user').pop();
    const lastUserText = lastUserMsg?.parts?.find(p => p.type === 'text')?.text ?? '';
    const detectedLang = detectLanguage(lastUserText);

    // AI assistant instructions emphasizing safety, correctness, and accessibility
    const systemPrompt = `You are "StadiumPulse", the official AI wayfinding and accessibility assistant for the FIFA World Cup 2026.
You communicate with the fan in the detected language of their request. The detected language is: "${detectedLang}" (supported: en, es, fr, pt, ar). 
If the language is "ar" (Arabic), write in natural Arabic, structuring all layout contexts correctly for right-to-left reading.

Your responsibilities:
1. Help fans navigate stadium landmarks: gates, concourses, sections, restrooms, food concessions, medical points, and sensory quiet rooms.
2. Ground all routing in the deterministic route returned by the "getRoute" tool. Present the step-by-step directions, base duration, and estimated duration with crowd congestion.
3. Prioritize accessibility. If accessibility is required, ensure you call "getRoute" with accessibilityRequired = true, and explain accessibility features (elevators, ramps).
4. Actively warn fans about crowd density. If any spot has a density >= 75%, highlight that it is congested. Detail any congested zones that the pathfinder avoided.
5. Provide sustainability tips. When fans ask about transportation, transit, or waste disposal, call the "getSustainabilityTip" tool and show the eco-friendly tips.

Safety rules:
- You must ONLY use the "getRoute" tool to plan paths. Never invent routes, coordinates, or durations.
- You must map user-mentioned landmarks (e.g. "Gate A", "Section 211") to their correct node IDs:
  Valid Node IDs: ${Object.keys(NODES).join(', ')}.
- Ground every direction in the tool output. If the tool indicates no route was found, explain this clearly.
- Translate all waypoint directions and reasoning notes into the fan's active language.
- Keep your tone concise, helpful, and athletic. Avoid long paragraphs.`;

    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: systemPrompt,
      tools: {
        getRoute: tool({
          description: '...',
          inputSchema: z.object({          // renamed from `parameters`
            from: z.string(),
            to: z.string(),
            accessibilityRequired: z.boolean()
          }),
          execute: async ({ from, to, accessibilityRequired: accReq }) => {

            // Validate and sanitize the inputs server-side
            const sanitizedFrom = validateAndSanitizeNodeId(from);
            const sanitizedTo = validateAndSanitizeNodeId(to);

            if (!sanitizedFrom || !sanitizedTo) {
              const errMsg = 'Invalid start or destination landmark ID. Please use valid nodes.';
              return {
                path: [],
                baseDuration: 0,
                estimatedDuration: 0,
                waypoints: [errMsg],
                reasoning: [errMsg]
              };
            }

            // Execute deterministic Dijkstra pathfinding
            const route = calculateRoute({
              from: sanitizedFrom,
              to: sanitizedTo,
              accessibilityRequired: accReq,
              crowdDensity: crowdDensity || {},
              language: detectedLang
            });

            return route;
          }
        }),
        getSustainabilityTip: tool({
          description: '...',
          inputSchema: z.object({          // renamed from `parameters`
            category: z.enum(['transport', 'waste'])
          }),
          execute: async ({ category }) => {
            const tips = SUSTAINABILITY_DATA[category as keyof SustainabilityData] || [];
            return {
              category,
              tips: tips.map((tip) => ({
                title: tip.title[detectedLang] || tip.title['en'],
                details: tip.details[detectedLang] || tip.details['en']
              }))
            };
          }
        })
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    // Secure error handling - do not log secrets or output details to client
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
