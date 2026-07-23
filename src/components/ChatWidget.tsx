"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "أهلاً بكِ في فيليسيا بيوتي 💕 كيف يمكنني مساعدتك اليوم؟",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (pathname?.startsWith("/admin")) return null;

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "عذرًا، حدث خطأ. حاولي مرة أخرى أو تواصلي معنا عبر واتساب.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "عذرًا، حدث خطأ في الاتصال. حاولي مرة أخرى.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="خدمة العملاء"
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-l from-blush-500 to-blush-600 text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      <div
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transform: isOpen ? "translateY(0)" : "translateY(16px)",
        }}
        className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-blush-100 bg-blush-50 shadow-2xl transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-blush-100 bg-white px-4 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-l from-blush-500 to-blush-600 text-white">
            💬
          </div>
          <div>
            <p className="text-sm font-bold text-plum-900">خدمة عملاء فيليسيا</p>
            <p className="text-[11px] text-plum-900/50">متاحة الآن</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-white text-plum-900"
                    : "bg-gradient-to-l from-blush-500 to-blush-600 text-white"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-end">
              <div className="rounded-2xl bg-gradient-to-l from-blush-500 to-blush-600 px-3.5 py-2 text-sm text-white">
                جاري الكتابة...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-blush-100 bg-white p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتبي رسالتك..."
            className="flex-1 rounded-full border border-blush-200 bg-blush-50 px-4 py-2 text-sm text-plum-900 outline-none focus:border-blush-400"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            aria-label="إرسال"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-l from-blush-500 to-blush-600 text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}