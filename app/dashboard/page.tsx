"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Plus } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export default function Dashboard() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // 🆕 create first chat
  useEffect(() => {
    if (chats.length === 0) {
      createNewChat();
    }
  }, []);

  // 🔽 scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New chat",
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    // 🧠 update UI instantly
    const updatedChats = chats.map((chat) =>
      chat.id === activeChatId
        ? {
            ...chat,
            title:
              chat.messages.length === 0
                ? input.slice(0, 30)
                : chat.title,
            messages: [...chat.messages, userMessage],
          }
        : chat
    );

    setChats(updatedChats);
    setInput("");
    setLoading(true);

    // ⚡ fake AI (later replace with API)
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "✨ AI response generated successfully.",
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, aiMessage],
              }
            : chat
        )
      );

      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex h-screen bg-black text-white">

      {/* SIDEBAR */}
      <aside className="w-72 bg-white/5 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded-lg font-bold"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`p-3 rounded-lg cursor-pointer mb-2 ${
                chat.id === activeChatId
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }`}
            >
              <p className="text-sm truncate">{chat.title}</p>
            </div>
          ))}
        </div>

        {/* PLAN */}
        <div className="p-4 border-t border-white/10 text-sm text-gray-400">
          Plan: Free
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {activeChat?.messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-3xl ${
                msg.role === "user" ? "ml-auto text-right" : ""
              }`}
            >
              <div
                className={`inline-block px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-cyan-500 text-black"
                    : "bg-white/10"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-400">⏳ AI is thinking...</div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-xl outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              onClick={sendMessage}
              className="bg-cyan-500 px-4 rounded-xl flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}