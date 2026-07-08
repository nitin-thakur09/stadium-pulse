import { NODES, EDGES, StadiumEdge, StadiumNode, RouteRequest } from './data';

export interface RouteResult {
  path: string[];
  baseDuration: number;
  estimatedDuration: number;
  waypoints: string[];
  reasoning: string[];
}

/**
 * Detects the input language of the user's message.
 * Supports: English (en), Spanish (es), French (fr), Portuguese (pt), Arabic (ar).
 * Defaults to 'en' for unsupported languages.
 */
export function detectLanguage(text: string): string {
  if (!text) return 'en';
  const clean = text.toLowerCase().trim();

  // Arabic unicode range check (RTL)
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (arabicRegex.test(clean)) {
    return 'ar';
  }

  // Spanish keywords
  const esKeywords = [
    'cómo', 'como llegar', 'puerta', 'baño', 'ascensor', 'comida', 'gracias', 
    'hola', 'dónde', 'donde', 'por favor', 'ayuda', 'rueda', 'silla'
  ];
  if (esKeywords.some(kw => clean.includes(kw))) {
    return 'es';
  }

  // French keywords
  const frKeywords = [
    'comment', 'porte', 'toilette', 'ascenseur', 'nourriture', 'merci', 
    'bonjour', 'où', 's\'il vous plaît', 'aide', 'fauteuil', 'roulant'
  ];
  if (frKeywords.some(kw => clean.includes(kw))) {
    return 'fr';
  }

  // Portuguese keywords
  const ptKeywords = [
    'como', 'porta', 'banheiro', 'elevador', 'comida', 'obrigado', 'olá', 
    'onde', 'por favor', 'ajuda', 'cadeira', 'rodas'
  ];
  if (ptKeywords.some(kw => clean.includes(kw))) {
    return 'pt';
  }

  return 'en';
}

/**
 * Deterministic pathfinding engine using Dijkstra's algorithm.
 * Accounts for accessibility constraints (wheelchair ramp/elevator routing)
 * and applies penalizing weights or blocks paths through congested zones based on live crowd densities.
 */
export function calculateRoute(req: RouteRequest): RouteResult {
  const { from, to, accessibilityRequired, crowdDensity, language } = req;

  // Defensive validation
  if (!NODES[from] || !NODES[to]) {
    const errMsg = language === 'es' ? 'Entrada o destino no válido.' :
                   language === 'fr' ? 'Entrée ou destination invalide.' :
                   language === 'pt' ? 'Origem ou destino inválido.' :
                   language === 'ar' ? 'المدخل أو الوجهة غير صالحة.' :
                   'Invalid start or destination node.';
    return {
      path: [],
      baseDuration: 0,
      estimatedDuration: 0,
      waypoints: [errMsg],
      reasoning: [errMsg]
    };
  }

  // 1. Graph adjacency list construction
  const adjList: Record<string, Array<{ to: string; edge: StadiumEdge }>> = {};
  
  for (const nodeKey of Object.keys(NODES)) {
    adjList[nodeKey] = [];
  }

  for (const edge of EDGES) {
    // If accessibility is required, filter out non-accessible edges
    if (accessibilityRequired && !edge.accessible) {
      continue;
    }

    // Since stadium routes are undirected (bi-directional), build both directions
    if (adjList[edge.from]) {
      adjList[edge.from].push({ to: edge.to, edge });
    }
    if (adjList[edge.to]) {
      adjList[edge.to].push({ to: edge.from, edge });
    }
  }

  // 2. Dijkstra Initialization
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const nodeKey of Object.keys(NODES)) {
    distances[nodeKey] = Infinity;
    previous[nodeKey] = null;
    unvisited.add(nodeKey);
  }

  distances[from] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current: string | null = null;
    let minDistance = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    // If destination is reached or unreachable
    if (current === null || minDistance === Infinity) {
      break;
    }

    if (current === to) {
      break;
    }

    unvisited.delete(current);

    const neighbors = adjList[current] || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;

      const edge = neighbor.edge;
      const targetNodeId = neighbor.to;
      const targetDensity = crowdDensity[targetNodeId] || 0;

      // Live crowd density weight multipliers
      let densityMultiplier = 1;
      if (targetDensity >= 95) {
        densityMultiplier = 50; // Block-level congestion
      } else if (targetDensity >= 75) {
        densityMultiplier = 5;  // Heavy congestion
      } else if (targetDensity >= 50) {
        densityMultiplier = 2;  // Moderate congestion
      }

      const weight = edge.baseWeight * densityMultiplier;
      const alt = distances[current] + weight;

      if (alt < distances[targetNodeId]) {
        distances[targetNodeId] = alt;
        previous[targetNodeId] = current;
      }
    }
  }

  // If destination is unreachable
  if (distances[to] === Infinity) {
    let reason = 'No route found.';
    if (language === 'es') reason = 'No se encontró ninguna ruta. Verifique las limitaciones de accesibilidad.';
    else if (language === 'fr') reason = 'Aucun itinéraire trouvé. Veuillez vérifier les limites d\'accessibilité.';
    else if (language === 'pt') reason = 'Nenhuma rota encontrada. Verifique as restrições de acessibilidade.';
    else if (language === 'ar') reason = 'لم يتم العثور على مسار. يرجى التحقق من توفر المصاعد والمنحدرات.';
    else if (accessibilityRequired) reason = 'No accessible route found. Check elevator/ramp availability.';

    return {
      path: [],
      baseDuration: 0,
      estimatedDuration: 0,
      waypoints: [reason],
      reasoning: [reason]
    };
  }

  // 3. Reconstruct Path
  const path: string[] = [];
  let curr: string | null = to;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  // 4. Calculate durations and collect waypoint/reasoning descriptions
  let baseDuration = 0;
  let estimatedDuration = 0;
  const waypoints: string[] = [];
  const reasoning: string[] = [];

  let gateCongestedWarned = false;
  let nodeCongestedWarned = false;

  for (let i = 0; i < path.length; i++) {
    const nodeId = path[i];
    const node = NODES[nodeId];
    const nodeName = node.name[language] || node.name['en'] || nodeId;

    if (i === 0) {
      waypoints.push(nodeName);
    } else {
      const prevNodeId = path[i - 1];
      const connectingEdge = EDGES.find(
        e => (e.from === prevNodeId && e.to === nodeId) || (e.from === nodeId && e.to === prevNodeId)
      );

      if (connectingEdge) {
        baseDuration += connectingEdge.baseWeight;
        
        const density = crowdDensity[nodeId] || 0;
        let densityMultiplier = 1;
        if (density >= 95) {
          densityMultiplier = 50;
        } else if (density >= 75) {
          densityMultiplier = 5;
        } else if (density >= 50) {
          densityMultiplier = 2;
        }
        estimatedDuration += connectingEdge.baseWeight * densityMultiplier;

        const edgeDesc = connectingEdge.description[language] || connectingEdge.description['en'] || "";
        waypoints.push(`${edgeDesc} -> ${nodeName}`);
      } else {
        waypoints.push(nodeName);
      }
    }
  }

  // Accessibility routing notifications
  if (accessibilityRequired) {
    if (language === 'es') reasoning.push("Ruta optimizada para acceso en silla de ruedas (evitando escaleras, usando ascensores/rampas).");
    else if (language === 'fr') reasoning.push("Itinéraire optimisé pour fauteuil roulant (évite les escaliers, utilise les ascenseurs/rampes).");
    else if (language === 'pt') reasoning.push("Rota otimizada para cadeira de rodas (evitando escadas, usando elevadores/rampas).");
    else if (language === 'ar') reasoning.push("تم تحسين المسار لمستخدمي الكراسي المتحركة (تجنب السلالم، واستخدام المصاعد/المنحدرات).");
    else reasoning.push("Route optimized for wheelchair access (avoiding stairs, using elevators/ramps).");
  }

  // Crowd density warnings
  for (const nodeKey of path) {
    const node = NODES[nodeKey];
    const nodeName = node.name[language] || node.name['en'];
    const density = crowdDensity[nodeKey] || 0;

    if (density >= 75) {
      if (node.type === 'gate' && !gateCongestedWarned) {
        if (language === 'es') reasoning.push(`Advertencia: ${nodeName} tiene alta congestión (${density}%).`);
        else if (language === 'fr') reasoning.push(`Attention : ${nodeName} est très encombrée (${density}%).`);
        else if (language === 'pt') reasoning.push(`Aviso: ${nodeName} está altamente congestionado (${density}%).`);
        else if (language === 'ar') reasoning.push(`تنبيه: ${nodeName} يعاني من ازدحam شديد (${density}%).`);
        else reasoning.push(`Warning: ${nodeName} is heavily congested (${density}%).`);
        gateCongestedWarned = true;
      } else if (!nodeCongestedWarned && node.type !== 'gate') {
        if (language === 'es') reasoning.push(`Nota: Se transitó por zonas de alta densidad para completar la ruta.`);
        else if (language === 'fr') reasoning.push(`Note : Traversée de zones à forte densité pour compléter l'itinéraire.`);
        else if (language === 'pt') reasoning.push(`Nota: Rota passa por áreas de alta densidade.`);
        else if (language === 'ar') reasoning.push(`ملاحظة: يمر المسار عبر مناطق ذات كثافة جماهيرية عالية.`);
        else reasoning.push(`Note: Traversed high-density zones to complete the route.`);
        nodeCongestedWarned = true;
      }
    }
  }

  // Detect avoided congestion
  for (const nodeId of Object.keys(NODES)) {
    const node = NODES[nodeId];
    if (crowdDensity[nodeId] >= 75 && !path.includes(nodeId)) {
      const nodeName = node.name[language] || node.name['en'];
      if (language === 'es') reasoning.push(`Ruta planificada evitando el área congestionada de ${nodeName} (${crowdDensity[nodeId]}% de densidad).`);
      else if (language === 'fr') reasoning.push(`Itinéraire planifié en évitant la zone encombrée de ${nodeName} (${crowdDensity[nodeId]}% d'encombrement).`);
      else if (language === 'pt') reasoning.push(`Rota planejada evitando a área congestionada de ${nodeName} (${crowdDensity[nodeId]}% de densidade).`);
      else if (language === 'ar') reasoning.push(`تم التوجيه لتجنب المنطقة المزدحمة في ${nodeName} (كثافة ${crowdDensity[nodeId]}%).`);
      else reasoning.push(`Routed to avoid the congested area of ${nodeName} (${crowdDensity[nodeId]}% density).`);
    }
  }

  return {
    path,
    baseDuration,
    estimatedDuration,
    waypoints,
    reasoning
  };
}
