"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  X,
  Send,
  User,
  Mail,
  Phone,
  MessageCircle,
  Headphones,
  Mic,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "./ui/button-2";
import { Input } from "./ui/input-2";
import { toast } from "sonner";
import { useSpeech } from "@/hooks/useSpeech";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
}

/** The public half of the chatbot settings, as served by /chatbot/config. */
interface ChatbotConfig {
  enabled: boolean;
  botName: string;
  botTagline: string;
  avatarUrl: string;
  accentFrom: string;
  accentTo: string;
  preChatTitle: string;
  preChatSubtitle: string;
  askForPhone: boolean;
  inputPlaceholder: string;
  quickReplies: { label: string }[];
  operatorEnabled: boolean;
  operatorLabel: string;
  whatsappNumber: string;
  whatsappMessage: string;
  voiceInputEnabled: boolean;
  voiceReplyEnabled: boolean;
  voiceLanguage: string;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Renders the [label](/path) links the bot writes.
 *
 * The previous version split on the link pattern and read fixed positions out
 * of the result, so a reply with two links rendered the first one and dropped
 * the rest of the sentence. This walks every match instead.
 */
const renderMessageText = (text: string): React.ReactNode => {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const href = match[2];
    // Only site paths and plain http links; anything else (javascript:, data:)
    // is left as text rather than turned into something clickable.
    const safe = /^(\/|https?:\/\/)/i.test(href);

    nodes.push(
      safe ? (
        <a
          key={`link-${key++}`}
          href={href}
          target={href.startsWith("/") ? undefined : "_blank"}
          rel="noreferrer"
          className="underline font-bold text-orange-500"
        >
          {match[1]}
        </a>
      ) : (
        match[1]
      )
    );

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length ? nodes : text;
};

const ChatbotWidget = () => {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Pre-chat form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Chat conversation states
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const accent = {
    backgroundImage: `linear-gradient(to right, ${config?.accentFrom || "#FF60A8"}, ${
      config?.accentTo || "#FB6238"
    })`,
  };

  // Load the admin's settings. Without them there is nothing to draw, so a
  // failure here hides the widget rather than showing a half-configured one.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API}/chatbot/config`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setConfig(json.data);
      } catch {
        // The site works fine without a chat bubble; stay quiet.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  const appendMessage = useCallback((sender: "bot" | "user", text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender,
        text,
        timestamp: new Date(),
      },
    ]);
  }, []);

  /** Sends a message to the server and shows whatever comes back. */
  const askBot = useCallback(
    async (text: string, quickReplyLabel?: string) => {
      setBotTyping(true);
      try {
        const res = await fetch(`${API}/chatbot/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, text, quickReplyLabel }),
        });

        const json = await res.json().catch(() => null);
        // A rate limit or an outage still has to say something in the window;
        // an unanswered message reads as a broken site.
        const reply =
          json?.data?.reply ||
          json?.message ||
          "Sorry, something went wrong. Please try again in a moment.";

        appendMessage("bot", reply);
        return reply as string;
      } catch {
        const reply = "Sorry, I could not reach our server. Please try again in a moment.";
        appendMessage("bot", reply);
        return reply;
      } finally {
        setBotTyping(false);
      }
    },
    [appendMessage, sessionId]
  );

  const handleVoiceInput = useCallback(
    (transcript: string) => {
      appendMessage("user", transcript);
      void askBot(transcript);
    },
    [appendMessage, askBot]
  );

  const {
    listening,
    speaking,
    micSupported,
    speechSupported,
    micError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech({
    language: config?.voiceLanguage || "en-US",
    onResult: handleVoiceInput,
  });

  useEffect(() => {
    if (micError) toast.error(micError);
  }, [micError]);

  // Read new bot replies aloud, but only after the visitor has switched it on.
  // A widget that starts talking on its own is the fastest way to make someone
  // close the tab.
  const lastSpokenId = useRef<string | null>(null);
  useEffect(() => {
    if (!voiceReplies) return;

    const last = messages[messages.length - 1];
    if (!last || last.sender !== "bot" || last.id === lastSpokenId.current) return;

    lastSpokenId.current = last.id;
    speak(last.text);
  }, [messages, voiceReplies, speak]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/chatbot/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to record chat session");

      const json = await res.json();
      setSessionId(json.data?.sessionId ?? null);
      setIsChatStarted(true);

      // The greeting is composed on the server from the admin's settings, so
      // changing the welcome text does not need a new build of the site.
      const opening = (json.data?.messages ?? []) as { text: string }[];
      setMessages(
        opening.map((message, index) => ({
          id: `opening-${index}`,
          sender: "bot" as const,
          text: message.text,
          timestamp: new Date(),
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Unable to start chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (label: string) => {
    appendMessage("user", label);
    void askBot(label, label);
  };

  const handleOperator = () => {
    if (!config) return;

    appendMessage("user", config.operatorLabel);
    appendMessage(
      "bot",
      "Connecting you with our support operator on WhatsApp... Please wait."
    );

    if (sessionId) {
      // Best effort — the visitor is already on their way to WhatsApp.
      void fetch(`${API}/chatbot/handoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => undefined);
    }

    window.open(
      `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
        config.whatsappMessage
      )}`,
      "_blank"
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || botTyping) return;

    appendMessage("user", text);
    setInputText("");
    void askBot(text);
  };

  const toggleVoiceReplies = () => {
    if (voiceReplies) {
      stopSpeaking();
      setVoiceReplies(false);
      return;
    }
    // Skip whatever is already on screen — switching this on should not replay
    // the whole conversation.
    lastSpokenId.current = messages[messages.length - 1]?.id ?? null;
    setVoiceReplies(true);
  };

  if (!config || !config.enabled) return null;

  const showMic = config.voiceInputEnabled && micSupported;
  const showSpeaker = config.voiceReplyEnabled && speechSupported;

  return (
    <React.Fragment>
      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={accent}
        className="fixed bottom-6 right-24 z-50 w-[60px] h-[60px] rounded-full text-white flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Toggle chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 sm:right-24 z-50 w-[350px] sm:w-[380px] h-[520px] bg-white border border-neutral-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-800 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div
            style={accent}
            className="p-4 text-white flex justify-between items-center shrink-0 shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                {config.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MessageCircle size={20} />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate">{config.botName}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] text-white/90 font-medium truncate">
                    {config.botTagline}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {showSpeaker && isChatStarted && (
                <button
                  onClick={toggleVoiceReplies}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  aria-label={voiceReplies ? "Turn off spoken replies" : "Read replies aloud"}
                  title={voiceReplies ? "Turn off spoken replies" : "Read replies aloud"}
                >
                  {voiceReplies ? (
                    <Volume2 size={16} className={speaking ? "animate-pulse" : undefined} />
                  ) : (
                    <VolumeX size={16} />
                  )}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 flex flex-col">
            {!isChatStarted ? (
              // Pre-chat Form
              <form onSubmit={handleStartChat} className="my-auto space-y-4 p-2">
                <div className="text-center space-y-1 mb-2">
                  <h5 className="font-bold text-lg text-neutral-800">
                    {config.preChatTitle}
                  </h5>
                  <p className="text-xs text-neutral-500">{config.preChatSubtitle}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                    <User size={13} /> Full Name
                  </label>
                  <Input
                    required
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 text-sm border-neutral-200 focus-within:border-orange-400 bg-white text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                    <Mail size={13} /> Email Address
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-sm border-neutral-200 focus-within:border-orange-400 bg-white text-black"
                  />
                </div>

                {config.askForPhone && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                      <Phone size={13} /> Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+971 50 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 text-sm border-neutral-200 focus-within:border-orange-400 bg-white text-black"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  style={accent}
                  className="w-full h-10 mt-2 text-white font-semibold shadow-md"
                >
                  {loading ? "Initializing..." : "Start Chat"}
                </Button>
              </form>
            ) : (
              // Active Conversation
              <div className="space-y-4 flex flex-col flex-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div
                      style={msg.sender === "user" ? accent : undefined}
                      className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "text-white rounded-br-none"
                          : "bg-white border text-neutral-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {renderMessageText(msg.text)}
                    </div>
                    <span className="text-[9px] text-neutral-400 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}

                {botTyping && (
                  <div className="self-start bg-white border shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                )}

                {/* Quick replies */}
                {config.quickReplies.length > 0 && (
                  <div className="space-y-1.5 pt-2 shrink-0">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Quick Inquiries
                    </p>
                    {config.quickReplies.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => handleQuickReply(option.label)}
                        disabled={botTyping}
                        className="block w-full text-left text-xs bg-white hover:bg-neutral-100 disabled:opacity-60 text-neutral-700 font-medium py-2 px-3 rounded-lg border shadow-sm transition-all duration-200"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {config.operatorEnabled && (
                  <button
                    onClick={handleOperator}
                    className="flex w-full items-center justify-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-lg border border-emerald-200 shadow-sm transition-all duration-200 shrink-0"
                  >
                    <Headphones size={13} />
                    {config.operatorLabel}
                  </button>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Active Chat Input Footer */}
          {isChatStarted && (
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t bg-white flex items-center gap-2 shrink-0"
            >
              <Input
                type="text"
                placeholder={listening ? "Listening…" : config.inputPlaceholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 h-9 text-xs border-neutral-200 focus-within:border-orange-400 text-black bg-white"
              />

              {showMic && (
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  disabled={botTyping}
                  aria-label={listening ? "Stop listening" : "Speak your message"}
                  title={listening ? "Stop listening" : "Speak your message"}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-colors disabled:opacity-50 ${
                    listening
                      ? "bg-red-500 text-white border-red-500 animate-pulse"
                      : "bg-white text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {listening ? <Square size={13} /> : <Mic size={15} />}
                </button>
              )}

              <button
                type="submit"
                disabled={!inputText.trim() || botTyping}
                style={accent}
                className="w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default ChatbotWidget;
