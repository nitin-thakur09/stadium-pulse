'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { NODES, DEFAULT_DENSITY } from '../lib/data';

// ─── Types ─────────────────────────────────────────────────────────────────
type NodeType = 'gate' | 'concourse' | 'section' | 'elevator' | 'stairs' | 'restroom' | 'medical' | 'food' | 'quiet_room';

// ─── Constants ──────────────────────────────────────────────────────────────
const NODE_TYPE_ICONS: Record<NodeType, string> = {
  gate: '🚪',
  concourse: '🏟️',
  section: '🪑',
  elevator: '🛗',
  stairs: '🪜',
  restroom: '🚻',
  medical: '🏥',
  food: '🍔',
  quiet_room: '🤫',
};

const SUGGESTED_QUESTIONS = [
  'How do I get to Section 101 from Gate A?',
  'Where is the nearest accessible restroom?',
  'Find me a wheelchair-accessible route to Section 201.',
  '¿Dónde está el ascensor más cercano?',
  'Quels sont les conseils de durabilité pour le transport?',
  'Where is the sensory quiet room?',
  'How do I get food near the east side?',
  'What areas are congested right now?',
];

// ─── Helper: extract text from a UIMessage ───────────────────────────────────
function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('');
}

// ─── Helper: Density bar color ──────────────────────────────────────────────
function getDensityColor(density: number): string {
  if (density >= 75) return '#ef4444';
  if (density >= 50) return '#f59e0b';
  return '#00e5a0';
}

// ─── Component: Density Badge ───────────────────────────────────────────────
function DensityBadge({ density }: { density: number }) {
  const color = getDensityColor(density);
  return (
    <span
      style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        color,
        background: `${color}1a`,
        border: `1px solid ${color}44`,
        borderRadius: 99,
        padding: '1px 7px',
      }}
    >
      {density}%
    </span>
  );
}

// ─── Component: Stadium Map Panel ───────────────────────────────────────────
function StadiumPanel({
  density,
  onNodeClick,
}: {
  density: Record<string, number>;
  onNodeClick: (nodeId: string) => void;
}) {
  const typeGroups = useMemo(() => {
    const groups: Record<NodeType, string[]> = {
      gate: [], concourse: [], section: [], elevator: [], stairs: [],
      restroom: [], medical: [], food: [], quiet_room: [],
    };
    Object.entries(NODES).forEach(([id, node]) => {
      groups[node.type].push(id);
    });
    return groups;
  }, []);

  const displayOrder: NodeType[] = [
    'gate', 'concourse', 'section', 'elevator', 'stairs',
    'restroom', 'medical', 'food', 'quiet_room',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {displayOrder.map((type) =>
        typeGroups[type].length === 0 ? null : (
          <div key={type}>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                marginBottom: 5,
              }}
            >
              {NODE_TYPE_ICONS[type]} {type.replace('_', ' ')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {typeGroups[type].map((id) => {
                const node = NODES[id];
                const d = density[id] ?? 0;
                const color = getDensityColor(d);
                return (
                  <button
                    key={id}
                    id={`map-node-${id}`}
                    onClick={() => onNodeClick(id)}
                    title={`Navigate to ${node.name['en']}`}
                    style={{
                      background: 'var(--color-surface-3)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.background = 'var(--color-surface-2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.background = 'var(--color-surface-3)';
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 140,
                      }}
                    >
                      {node.name['en']}
                    </span>
                    <DensityBadge density={d} />
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Component: Message Bubble ───────────────────────────────────────────────
function MessageBubble({ role, text, isStreaming }: { role: string; text: string; isStreaming?: boolean }) {
  const isUser = role === 'user';

  return (
    <div
      className="fade-up"
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 14,
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            flexShrink: 0,
            marginRight: 10,
            marginTop: 2,
            boxShadow: '0 0 12px var(--color-accent-glow)',
          }}
        >
          ⚡
        </div>
      )}
      <div
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser
            ? 'linear-gradient(135deg, var(--color-accent), #7c3aed)'
            : 'var(--color-surface-2)',
          border: isUser ? 'none' : '1px solid var(--color-border)',
          fontSize: '0.9rem',
          lineHeight: 1.65,
          color: isUser ? '#fff' : 'var(--color-text-primary)',
          boxShadow: isUser ? '0 4px 20px var(--color-accent-glow)' : 'var(--shadow-panel)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text || (isStreaming ? '' : '…')}
        {isStreaming && (
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 14,
              background: 'var(--color-accent-2)',
              borderRadius: 2,
              marginLeft: 4,
              verticalAlign: 'middle',
              animation: 'pulse-ring 0.8s ease-out infinite',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StadiumPulsePage() {
  const [accessibilityRequired, setAccessibilityRequired] = useState(false);
  const [crowdDensity, setCrowdDensity] = useState<Record<string, number>>(DEFAULT_DENSITY);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [panelTab, setPanelTab] = useState<'map' | 'density'>('map');
  const [inputValue, setInputValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Create a stable transport that closes over the mutable state refs
  const accessRef = useRef(accessibilityRequired);
  const crowdRef = useRef(crowdDensity);
  useEffect(() => { accessRef.current = accessibilityRequired; }, [accessibilityRequired]);
  useEffect(() => { crowdRef.current = crowdDensity; }, [crowdDensity]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/assistant',
        body: () => ({
          accessibilityRequired: accessRef.current,
          crowdDensity: crowdRef.current,
        }),
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle node click → prefill input
  const handleNodeClick = useCallback((nodeId: string) => {
    const nodeName = NODES[nodeId]?.name?.['en'] ?? nodeId;
    setInputValue(`How do I get to ${nodeName}?`);
    inputRef.current?.focus();
  }, []);

  // Handle suggestion click
  const handleSuggestion = (q: string) => {
    setInputValue(q);
    inputRef.current?.focus();
  };

  // Submit handler
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue('');
    sendMessage({ text });
  };

  // Handle textarea Enter (submit) vs Shift+Enter (newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Simulate a crowd density refresh
  const refreshDensity = () => {
    setCrowdDensity((prev) => {
      const next: Record<string, number> = {};
      for (const key of Object.keys(prev)) {
        next[key] = Math.max(0, Math.min(100, prev[key] + Math.round((Math.random() - 0.5) * 10)));
      }
      return next;
    });
  };

  const hasMessages = messages.length > 0;
  const userCount = messages.filter((m) => m.role === 'user').length;

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: sidebarOpen ? 280 : 0,
          minWidth: sidebarOpen ? 280 : 0,
          overflow: 'hidden',
          transition: 'width 0.3s ease, min-width 0.3s ease',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minWidth: 280,
          }}
        >
          {/* Logo area */}
          <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  boxShadow: '0 0 16px var(--color-accent-glow)',
                }}
              >
                ⚡
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', color: '#fff' }}>
                  StadiumPulse
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  FIFA World Cup 2026
                </div>
              </div>
            </div>

            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10 }}>
              <div className="pulse-dot">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-success)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 600 }}>
                Live Crowd Data
              </span>
              <button
                id="refresh-density-btn"
                onClick={refreshDensity}
                title="Refresh crowd data"
                style={{
                  marginLeft: 'auto',
                  background: 'var(--color-surface-3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  padding: '3px 7px',
                  fontSize: '0.65rem',
                  color: 'var(--color-text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Accessibility toggle */}
          <div
            style={{
              background: 'var(--color-surface-2)',
              border: `1px solid ${accessibilityRequired ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                  ♿ Accessibility Mode
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  Wheelchair / elevator routing
                </div>
              </div>
              <button
                id="accessibility-toggle"
                role="switch"
                aria-checked={accessibilityRequired}
                onClick={() => setAccessibilityRequired((v) => !v)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: accessibilityRequired ? 'var(--color-accent)' : 'var(--color-surface-3)',
                  border: `1px solid ${accessibilityRequired ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  position: 'relative',
                  transition: 'all var(--transition-base)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: accessibilityRequired ? 20 : 2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left var(--transition-base)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  }}
                />
              </button>
            </div>
          </div>

          {/* Panel tabs */}
          <div>
            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 10,
                background: 'var(--color-surface-3)',
                borderRadius: 10,
                padding: 4,
              }}
            >
              {(['map', 'density'] as const).map((tab) => (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  onClick={() => setPanelTab(tab)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: 7,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    background: panelTab === tab ? 'var(--color-accent)' : 'transparent',
                    color: panelTab === tab ? '#fff' : 'var(--color-text-muted)',
                    transition: 'all var(--transition-fast)',
                    boxShadow: panelTab === tab ? '0 0 10px var(--color-accent-glow)' : 'none',
                  }}
                >
                  {tab === 'map' ? '🗺️ Map' : '📊 Density'}
                </button>
              ))}
            </div>

            {panelTab === 'map' && (
              <StadiumPanel density={crowdDensity} onNodeClick={handleNodeClick} />
            )}

            {panelTab === 'density' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(crowdDensity)
                  .sort(([, a], [, b]) => b - a)
                  .map(([nodeId, d]) => {
                    const node = NODES[nodeId];
                    if (!node) return null;
                    const color = getDensityColor(d);
                    return (
                      <div
                        key={nodeId}
                        style={{
                          background: 'var(--color-surface-3)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          padding: '8px 10px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 5,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--color-text-secondary)',
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {NODE_TYPE_ICONS[node.type]} {node.name['en']}
                          </span>
                          <DensityBadge density={d} />
                        </div>
                        <div
                          style={{
                            height: 4,
                            background: 'var(--color-surface)',
                            borderRadius: 99,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${d}%`,
                              background: `linear-gradient(90deg, ${color}aa, ${color})`,
                              borderRadius: 99,
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'rgba(7, 9, 15, 0.8)',
            backdropFilter: 'blur(12px)',
            flexShrink: 0,
          }}
        >
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: '1rem',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-2), var(--color-accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                StadiumPulse
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>
                — AI Wayfinding
              </span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
              Multilingual · Accessible · Real-time crowd data
            </p>
          </div>

          {accessibilityRequired && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(91, 110, 248, 0.15)',
                border: '1px solid var(--color-accent)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: '0.72rem',
                color: 'var(--color-accent)',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              ♿ Accessible Routes
            </div>
          )}
        </header>

        {/* Messages */}
        <main
          id="chat-messages"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!hasMessages && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 28,
                textAlign: 'center',
                padding: '0 20px',
              }}
            >
              {/* Hero */}
              <div>
                <div
                  style={{
                    fontSize: '4rem',
                    lineHeight: 1,
                    marginBottom: 14,
                    filter: 'drop-shadow(0 0 20px rgba(91,110,248,0.5))',
                  }}
                >
                  ⚽
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #fff 0%, var(--color-accent-2) 50%, var(--color-accent) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: 10,
                  }}
                >
                  Welcome to StadiumPulse
                </h2>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--color-text-secondary)',
                    maxWidth: 480,
                    lineHeight: 1.7,
                  }}
                >
                  Your intelligent AI guide for the FIFA World Cup 2026. Navigate gates,
                  sections, restrooms, food stalls and more — in English, Español, Français,
                  Português or العربية.
                </p>
              </div>

              {/* Feature pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 520 }}>
                {[
                  { icon: '🗺️', label: 'Dijkstra Routing' },
                  { icon: '♿', label: 'Accessible Paths' },
                  { icon: '📊', label: 'Live Crowd Data' },
                  { icon: '🌍', label: '5 Languages' },
                  { icon: '🌿', label: 'Eco Tips' },
                  { icon: '🔒', label: 'Rate Limited API' },
                ].map(({ icon, label }) => (
                  <span
                    key={label}
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 99,
                      padding: '5px 14px',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {icon} {label}
                  </span>
                ))}
              </div>

              {/* Suggested questions */}
              <div style={{ width: '100%', maxWidth: 560 }}>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  Try asking:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      id={`suggestion-${q.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => handleSuggestion(q)}
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.45,
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                        e.currentTarget.style.background = 'var(--color-surface-3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                        e.currentTarget.style.background = 'var(--color-surface-2)';
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const text = getMessageText(msg);
            const isStreamingThis =
              isLoading && i === messages.length - 1 && msg.role === 'assistant';
            return (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                text={text}
                isStreaming={isStreamingThis}
              />
            );
          })}

          {/* Loading indicator when waiting for first assistant token */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div
              className="fade-up"
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  boxShadow: '0 0 12px var(--color-accent-glow)',
                }}
              >
                ⚡
              </div>
              <div
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 18px',
                  display: 'flex',
                  gap: 5,
                  alignItems: 'center',
                }}
              >
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--color-accent)',
                      animation: `pulse-ring 1.2s ease-in-out ${d * 0.2}s infinite`,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '14px 20px 20px',
            borderTop: '1px solid var(--color-border)',
            background: 'rgba(7, 9, 15, 0.9)',
            backdropFilter: 'blur(12px)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-end',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border-bright)',
              borderRadius: 16,
              padding: '10px 14px',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocusCapture={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--color-accent)';
              el.style.boxShadow = '0 0 0 3px var(--color-accent-glow)';
            }}
            onBlurCapture={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--color-border-bright)';
              el.style.boxShadow = 'none';
            }}
          >
            <textarea
              id="chat-input"
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything — en Español, en Français, em Português, بالعربية…"
              rows={1}
              disabled={isLoading}
              aria-label="Chat message input"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                resize: 'none',
                maxHeight: 140,
                overflow: 'auto',
                fontFamily: 'inherit',
              }}
            />
            <button
              id="send-button"
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background:
                  isLoading || !inputValue.trim()
                    ? 'var(--color-surface-3)'
                    : 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
                color: isLoading || !inputValue.trim() ? 'var(--color-text-muted)' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0,
                transition: 'all var(--transition-base)',
                boxShadow:
                  isLoading || !inputValue.trim() ? 'none' : '0 4px 14px var(--color-accent-glow)',
                transform: 'translateY(-2px)',
              }}
            >
              {isLoading ? '…' : '↑'}
            </button>
          </div>
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              fontSize: '0.65rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>↵ Send  ·  Shift+↵ New line</span>
            {hasMessages && (
              <span>
                {userCount} message{userCount !== 1 ? 's' : ''} sent
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
