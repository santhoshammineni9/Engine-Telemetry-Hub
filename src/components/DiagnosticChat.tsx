import React, { useState, useRef, useEffect } from 'react';
import { CalculationResult } from '../types/engine';
import { MessageSquare, Send, Bot, User, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface DiagnosticChatProps {
  result: CalculationResult;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content:
      "Hello! I am Dino Chatbot, your automotive reliability diagnostician and stochastic modeling companion. I can answer questions about the mathematical models, the 15,206 telemetry observations, Welch's t-test proofs, Newton-Raphson IRLS logistic derivation, or 4-state absorbing Markov chain MTTF dynamics. What would you like to explore?",
    timestamp: 'Just now',
    modelUsed: 'gemini-3.8-flash',
  },
];

const SUGGESTED_PROMPTS = [
  'Why does Engine RPM have a -2.71 coefficient in the logistic regression model?',
  'How does the fundamental matrix N = (I - Q)⁻¹ compute expected cycles to failure?',
  "Explain why Welch's t-test with unequal variances was required instead of pooled t-test.",
  'Why does Fuel Pressure have an odds ratio of 4.01 while RPM has 0.0664?',
];

type GeminiModelOption = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon' | 'gemini-4-carbon';
type DinoRoleOption = 'diagnostician' | 'statistician' | 'shop_mechanic';

export const DiagnosticChat: React.FC<DiagnosticChatProps> = ({ result }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<GeminiModelOption>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState<DinoRoleOption>('diagnostician');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Build conversation payload with context and model configuration
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          roleType: selectedRole,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentEngineContext: {
            pHealthy: result.pHealthy,
            state: result.markovStateName,
            mttf: result.mttf,
            sensors: result.sensors,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response from dino.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          "Dino Chatbot: In our empirical evaluation, Engine RPM exhibited a t-statistic of -79.86 and coefficient β = -2.71, demonstrating that excessive rotational speeds exponentially increase boundary bearing friction and thermal breakdown. Meanwhile, Fuel Pressure (OR = 4.01) stabilizes combustion stoichiometry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'deterministic-fallback',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="hud-panel rounded-xl shadow-lg flex flex-col h-[700px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-[#080d1a] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/src/assets/images/dino_chatbot_avatar_1794497151901.jpg"
              alt="Dino Chatbot"
              className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.25)]"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#080d1a] rounded-full animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-display font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>Dino Chatbot</span>
                <span className="hud-chamfer text-[10px] font-mono px-2.5 py-0.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-semibold normal-case">
                  AI Diagnostician
                </span>
              </h2>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Interactive Diagnostic &amp; Stochastic State Modeling Copilot · Powered by Gemini
            </div>
          </div>
        </div>

        {/* Model Selection, Role Selection & Clear Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Persona Role Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 text-[10px]">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as DinoRoleOption)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="diagnostician" className="bg-slate-900 text-slate-100">
                Diagnostician
              </option>
              <option value="statistician" className="bg-slate-900 text-slate-100">
                Statistician
              </option>
              <option value="shop_mechanic" className="bg-slate-900 text-slate-100">
                Dyno Mechanic
              </option>
            </select>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 text-[10px]">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as GeminiModelOption)}
              className="bg-transparent text-sky-300 text-xs focus:outline-none cursor-pointer font-semibold"
            >
              <option value="gemini-3.8-flash" className="bg-slate-900 text-slate-100">
                gemini-3.8-flash (General)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-slate-100">
                gemini-3.1-flash-lite (Fast)
              </option>
              <option value="gemini-4-argon" className="bg-slate-900 text-slate-100">
                gemini-4-argon (Complex)
              </option>
              <option value="gemini-4-carbon" className="bg-slate-900 text-slate-100">
                gemini-4-carbon (Deep Reasoning)
              </option>
            </select>
          </div>

          {/* Current Engine State Badge */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono bg-slate-900/90 px-2.5 py-1 rounded border border-cyan-500/20">
            <span className="text-slate-400">P(Healthy):</span>
            <span className="text-cyan-400 font-bold tabular-nums">{(result.pHealthy * 100).toFixed(1)}%</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-200 font-semibold">{result.markovStateName}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick(520);
              handleClearChat();
            }}
            className="p-1.5 text-slate-400 hover:text-cyan-200 rounded hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Reset Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-[#060a13] border-b border-cyan-500/15 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              soundFx.playClick(760);
              handleSendMessage(prompt);
            }}
            className="hud-chamfer px-2.5 py-1 text-[11px] font-mono text-slate-300 bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 hover:text-cyan-200 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold overflow-hidden ${
                  isUser
                    ? 'bg-sky-600 text-white'
                    : 'bg-[#111827] border border-emerald-500/40 text-emerald-400'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <img
                    src="/src/assets/images/dino_chatbot_avatar_1794497151901.jpg"
                    alt="Dino Chatbot"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div
                className={`max-w-[80%] rounded-xl p-3.5 leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600/90 text-white shadow-[0_0_14px_rgba(34,211,238,0.2)]'
                    : 'hud-subpanel text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs">{m.content}</div>
                <div
                  className={`mt-2 flex items-center justify-between gap-2 text-[10px] font-mono ${
                    isUser ? 'text-sky-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {!isUser && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-semibold">Dino Chatbot</span>
                      {m.modelUsed && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400 font-medium">
                          {m.modelUsed}
                        </span>
                      )}
                    </span>
                  )}
                  <span>{m.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5 text-slate-400 text-xs font-mono py-2">
            <img
              src="/src/assets/images/dino_chatbot_avatar_1794497151901.jpg"
              alt="Dino Chatbot"
              className="w-5 h-5 rounded-md object-cover border border-emerald-500/40 animate-pulse"
            />
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Dino Chatbot is formulating analytical response...</span>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-[#080d1a] border-t border-cyan-500/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            soundFx.playClick(780);
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask about Welch t-tests, Newton-Raphson IRLS, Markov matrices, or telemetry..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="hud-chamfer px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-display font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_0_14px_rgba(34,211,238,0.25)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
