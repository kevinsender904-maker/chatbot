import React, { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import {
  MessageBubble,
  TypingIndicator,
  EmergencyBanner,
  EmergencyGuidanceCard,
  DiagnosisDisclaimerFooter,
} from "../components/ChatComponents";
import { Message, ChatSession } from "../types";
import { sendMessageToGemini } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  createChatSession,
  fetchUserChatSessions,
  saveChatMessage,
  fetchSessionMessages,
  deleteChatSession,
} from "../services/chatStorage";
import { analyzeEmergency, EmergencyDetails } from "../services/emergencyDetector";
import { Send, Plus, RefreshCw, MessageSquare, Trash2, History, AlertTriangle } from "lucide-react";

export default function ChatPage() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "model",
      content:
        "Hello! I am your AI Health Assistant. How can I help you today? Please describe your symptoms or ask any health-related questions.\n\n*Note: Suggestions provided are for informational purposes and do not constitute a formal diagnosis.*",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeUserId = user?.id || "guest-user";

  // Check input in real time for serious symptoms to warn user immediately
  const liveEmergencyCheck = analyzeEmergency(input);

  // Load user sessions on mount or when user changes
  useEffect(() => {
    async function loadSessions() {
      const userSessions = await fetchUserChatSessions(activeUserId);
      setSessions(userSessions);
      if (userSessions.length > 0 && !currentSessionId) {
        setCurrentSessionId(userSessions[0].id);
        const msgs = await fetchSessionMessages(userSessions[0].id, activeUserId);
        if (msgs.length > 0) {
          setMessages(msgs);
        }
      }
    }
    loadSessions();
  }, [activeUserId]);

  // Load messages when currentSessionId changes
  useEffect(() => {
    async function loadCurrentSessionMessages() {
      if (!currentSessionId) return;
      const msgs = await fetchSessionMessages(currentSessionId, activeUserId);
      if (msgs.length > 0) {
        setMessages(msgs);
        // Check if any recent user message had an emergency
        const lastUser = [...msgs].reverse().find((m) => m.role === "user");
        if (lastUser) {
          const em = analyzeEmergency(lastUser.content);
          if (em) setActiveEmergency(em);
        }
      } else {
        setMessages([
          {
            id: "initial",
            role: "model",
            content:
              "Hello! How can I assist you today? Please describe your symptoms or ask any health-related questions.\n\n*Note: Suggestions provided are for informational purposes and do not constitute a formal diagnosis.*",
            timestamp: new Date(),
          },
        ]);
      }
    }
    loadCurrentSessionMessages();
  }, [currentSessionId, activeUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleCreateNewSession = async () => {
    const newSession = await createChatSession(activeUserId, `Inquiry ${new Date().toLocaleDateString()}`);
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveEmergency(null);
    setMessages([
      {
        id: "initial",
        role: "model",
        content:
          "Hello again! How can I assist you with your health today?\n\n*Note: Suggestions provided are for informational purposes and do not constitute a formal diagnosis.*",
        timestamp: new Date(),
      },
    ]);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    await deleteChatSession(sid, activeUserId);
    const updated = sessions.filter((s) => s.id !== sid);
    setSessions(updated);
    if (currentSessionId === sid) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
      } else {
        setCurrentSessionId(null);
        setActiveEmergency(null);
        setMessages([
          {
            id: "initial",
            role: "model",
            content:
              "Hello! How can I assist you today? Please describe your symptoms or ask any health-related questions.\n\n*Note: Suggestions provided are for informational purposes and do not constitute a formal diagnosis.*",
            timestamp: new Date(),
          },
        ]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();

    // 1. Automatic serious-symptom detection + emergency guidance
    const detectedEmergency = analyzeEmergency(userText);
    if (detectedEmergency) {
      setActiveEmergency(detectedEmergency);
    }

    // Ensure session exists
    let sid = currentSessionId;
    if (!sid) {
      const newSession = await createChatSession(
        activeUserId,
        userText.slice(0, 30) || "Health Inquiry"
      );
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      sid = newSession.id;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Save user message in user-owned Supabase chat_messages
    await saveChatMessage(sid, activeUserId, "user", userText);

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let currentResponse = "";
    const botMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        role: "model",
        content: "",
        timestamp: new Date(),
      },
    ]);

    const profileContext = profile
      ? {
          language: profile.language,
          age_range: profile.age_range,
          name: profile.name,
        }
      : undefined;

    await sendMessageToGemini(
      apiMessages,
      (chunk) => {
        currentResponse += chunk;
        setIsTyping(false);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, content: currentResponse } : msg
          )
        );
      },
      (error) => {
        setIsTyping(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  content: `Apologies, but an error occurred while processing your request: ${error}`,
                }
              : msg
          )
        );
      },
      profileContext
    );

    setIsTyping(false);

    // Persist final bot message to Supabase chat_messages owned by user
    if (currentResponse) {
      await saveChatMessage(sid, activeUserId, "model", currentResponse);
    }
  };

  return (
    <Layout>
      <EmergencyBanner />

      <div className="flex-1 flex overflow-hidden relative bg-slate-50">
        {/* Sessions Drawer / Left Panel */}
        <div
          className={`bg-white border-r border-slate-200 w-64 flex flex-col shrink-0 transition-all duration-300 absolute md:static z-20 h-full ${
            sidebarOpen ? "left-0 shadow-xl" : "-left-64 md:left-0 hidden md:flex"
          }`}
        >
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-600" />
              Chat Sessions
            </span>
            <button
              onClick={handleCreateNewSession}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              title="Create New Session"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setCurrentSessionId(s.id);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  currentSessionId === s.id
                    ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{s.title || "Health Inquiry"}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  title="Delete Session"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="p-4 text-center text-[11px] text-slate-400">
                No past sessions. Click '+' to start a new inquiry.
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 text-center">
            Stored in Supabase <code className="font-mono">chat_sessions</code>
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col pt-0 overflow-hidden relative bg-slate-50">
          {/* Top Header Bar */}
          <div className="px-4 py-2 flex items-center justify-between shrink-0 border-b border-gray-100 bg-white/70 backdrop-blur-sm shadow-sm z-10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              Sessions
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Current Session:</span>
              <span className="font-bold text-slate-800">
                {sessions.find((s) => s.id === currentSessionId)?.title || "Active Consultation"}
              </span>
              {profile?.language && profile.language !== "english" && (
                <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full uppercase">
                  {profile.language}
                </span>
              )}
            </div>

            <button
              onClick={handleCreateNewSession}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Inquiry
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth">
            <div className="max-w-4xl mx-auto flex flex-col pb-4">
              {/* Emergency Guidance Card if serious symptoms are detected */}
              {activeEmergency && (
                <EmergencyGuidanceCard
                  emergencyDetails={activeEmergency}
                  onDismiss={() => setActiveEmergency(null)}
                />
              )}

              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} className="h-4"></div>
            </div>
          </div>

          {/* Real-time typing warning for emergency symptoms */}
          {liveEmergencyCheck && (
            <div className="px-4 py-2 bg-red-100 border-t border-red-300 text-red-900 text-xs font-bold flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>
                  Immediate Alert: "{liveEmergencyCheck.detectedKeywords[0]}" may indicate a serious medical emergency. Call 911 or visit an ER immediately.
                </span>
              </div>
              <a
                href="tel:911"
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-[10px] uppercase font-bold shrink-0 ml-2"
              >
                Call 911
              </a>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-slate-200 p-4 md:p-6 shrink-0 relative z-10">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="relative group">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none pr-10"
                      placeholder="Describe your symptoms in natural language (e.g. 'I have had a sharp migraine with sensitivity to light for two days')..."
                      rows={input.split("\n").length > 1 ? Math.min(input.split("\n").length, 4) : 1}
                    />
                    <button
                      type="button"
                      onClick={() => setInput("Can you explain common side effects of ibuprofen?")}
                      className="absolute bottom-3 right-3 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Quick prompt"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-lg"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 shrink-0">
                    Symptom Prompts:
                  </span>
                  <button
                    type="button"
                    onClick={() => setInput("I have a persistent dry cough and sore throat for 3 days")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-200 transition-colors shrink-0"
                  >
                    Cough & Sore Throat
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput("What causes a dull throbbing headache behind the eyes after screen use?")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-200 transition-colors shrink-0"
                  >
                    Headache & Eye Strain
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput("I've been feeling unusually fatigued and thirsty recently")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-200 transition-colors shrink-0"
                  >
                    Fatigue & Thirst
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput("I feel sudden sharp chest pain radiating down my left arm")}
                    className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full border border-red-200 transition-colors shrink-0"
                  >
                    Emergency Check Test
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Condition & Diagnosis Disclaimer Footer */}
          <DiagnosisDisclaimerFooter />
        </div>
      </div>
    </Layout>
  );
}
