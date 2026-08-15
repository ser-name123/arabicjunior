"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, Mail, MessageCircle, Headphones } from "lucide-react";
import { Button } from "./ui/button-2";
import { Input } from "./ui/input-2";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  
  // Pre-chat form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Chat conversation states
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle start chat form submission
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);

    // Save lead details in the backend
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatbot/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to record chat session");

      setIsChatStarted(true);

      // Initialize bot messages
      setMessages([
        {
          id: "1",
          sender: "bot",
          text: `Hi ${name.trim()}! Welcome to Arabic Juniors Academy. 👋`,
          timestamp: new Date(),
        },
        {
          id: "2",
          sender: "bot",
          text: "How can we help you today? Please choose one of the options below or type your question.",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Unable to start chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Quick replies actions
  const handleQuickReply = (option: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: option,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let botResponse = "";

      if (option.includes("Free Trial")) {
        botResponse = "Excellent! You can register for a Free Trial Class by visiting our trial page: [Click here to book a trial](/register).";
      } else if (option.includes("Pricing")) {
        botResponse = "We offer flexible monthly packages starting from 4 hours (Starter) up to 16 hours (Elite) of instruction. Check out the [Pricing Page](/pricing) for details!";
      } else if (option.includes("Tutors")) {
        botResponse = "Our tutors are native Arabic speakers with years of experience teaching children in the UAE. Read about them on our [Our Teachers](/our-teachers) page!";
      } else if (option.includes("Operator")) {
        botResponse = "Connecting you with our support operator on WhatsApp... Please wait.";
        window.open(
          "https://wa.me/971505344645?text=Hello!%20I%27m%20interested%20in%20enrolling%20in%20Arabic%20tuition%20classes.%20Please%20get%20in%20touch%20with%20me",
          "_blank"
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: botResponse,
          timestamp: new Date(),
        },
      ]);
    }, 800);
  };

  // Custom text input submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Thank you for your message! A member of our support team will respond to you shortly. You can also click 'Talk with Operator' to chat immediately via WhatsApp.",
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  return (
    <React.Fragment>
      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-24 z-50 w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#FF60A8] to-[#FB6238] text-white flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Toggle chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 sm:right-24 z-50 w-[350px] sm:w-[380px] h-[520px] bg-white border border-neutral-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-800 animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF60A8] to-[#FB6238] p-4 text-white flex justify-between items-center shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Juniors Support Bot</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] text-white/90 font-medium">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 flex flex-col">
            {!isChatStarted ? (
              // Pre-chat Form
              <form onSubmit={handleStartChat} className="my-auto space-y-4 p-2">
                <div className="text-center space-y-1 mb-2">
                  <h5 className="font-bold text-lg text-neutral-800">Start Chatting</h5>
                  <p className="text-xs text-neutral-500">
                    Introduce yourself and speak with our advisors.
                  </p>
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-2 bg-gradient-to-r from-[#FF60A8] to-[#FB6238] text-white font-semibold shadow-md"
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
                      className={`p-3 rounded-2xl text-sm ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-[#FF60A8] to-[#FB6238] text-white rounded-br-none"
                          : "bg-white border text-neutral-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.text.includes("[") ? (
                        // Basic Markdown parser for links
                        (() => {
                          const parts = msg.text.split(/\[(.*?)\]\((.*?)\)/);
                          if (parts.length > 2) {
                            return (
                              <span>
                                {parts[0]}
                                <a
                                  href={parts[2]}
                                  className="underline font-bold text-orange-500"
                                >
                                  {parts[1]}
                                </a>
                                {parts[3]}
                              </span>
                            );
                          }
                          return msg.text;
                        })()
                      ) : (
                        msg.text
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-400 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
                
                {/* Quick replies */}
                <div className="space-y-1.5 pt-2 shrink-0">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Quick Inquiries
                  </p>
                  {[
                    "📅 Book a Free Trial Class",
                    "💰 Course Pricing & Packages",
                    "📚 Tutors & Curriculum",
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleQuickReply(option)}
                      className="block w-full text-left text-xs bg-white hover:bg-neutral-100 text-neutral-700 font-medium py-2 px-3 rounded-lg border shadow-sm transition-all duration-200"
                    >
                      {option}
                    </button>
                  ))}
                  
                  {/* Operator WhatsApp Escalation Option */}
                  <button
                    onClick={() => handleQuickReply("📞 Talk with Operator (WhatsApp)")}
                    className="flex w-full items-center justify-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-lg border border-emerald-250 shadow-sm transition-all duration-200"
                  >
                    <Headphones size={13} />
                    Talk with Operator
                  </button>
                </div>

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
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 h-9 text-xs border-neutral-200 focus-within:border-orange-400 text-black bg-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF60A8] to-[#FB6238] text-white flex items-center justify-center shrink-0 disabled:opacity-50"
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
