// Chat.tsx
import { useEffect, useRef, useState } from "react";

const WS_HOST: string = import.meta.env.VITE_WS_HOST || "localhost";
const WS_PORT: string = import.meta.env.VITE_WS_PORT || "8080";
const WS_PROTO = import.meta.env.VITE_WS_SECURE === "true" ? "wss" : "ws";
const WS_URL = `${WS_PROTO}://${WS_HOST}:${WS_PORT}`;
const WS_URI = import.meta.env.VITE_WS_URI || WS_URL;

type Incoming =
  | { type: "system"; text: string }
  | { type: "message"; name: string; text: string }
  | { type: "error"; text: string };

const LiquidEtherBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#1a1a2e", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#16213e", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#0f3460", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)" />
        <g filter="url(#goo)">
          <circle className="animate-liquid-1" cx="20%" cy="30%" r="15%" fill="#1e3a5f" opacity="0.5" />
          <circle className="animate-liquid-2" cx="80%" cy="70%" r="20%" fill="#2a5a8a" opacity="0.4" />
          <circle className="animate-liquid-3" cx="50%" cy="50%" r="18%" fill="#1a4d6f" opacity="0.3" />
          <circle className="animate-liquid-4" cx="70%" cy="20%" r="12%" fill="#264f73" opacity="0.5" />
          <circle className="animate-liquid-5" cx="30%" cy="80%" r="16%" fill="#1f4a6b" opacity="0.4" />
        </g>
      </svg>
      <style>{`
        @keyframes liquid1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes liquid2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(0.95); }
          66% { transform: translate(25px, -25px) scale(1.05); }
        }
        @keyframes liquid3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 30px) scale(1.15); }
        }
        @keyframes liquid4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, -20px) scale(1.08); }
          66% { transform: translate(35px, 25px) scale(0.92); }
        }
        @keyframes liquid5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, -30px) scale(1.1); }
        }
        .animate-liquid-1 { animation: liquid1 20s ease-in-out infinite; }
        .animate-liquid-2 { animation: liquid2 25s ease-in-out infinite; }
        .animate-liquid-3 { animation: liquid3 18s ease-in-out infinite; }
        .animate-liquid-4 { animation: liquid4 22s ease-in-out infinite; }
        .animate-liquid-5 { animation: liquid5 19s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-sm shadow-2xl">
        {children}
        <div className="mt-4 text-right">
          <button className="text-sm text-gray-400 hover:text-gray-200" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState<Incoming[]>([]);
  const [input, setInput] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(true);
  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!joined) return;
    ws.current = new WebSocket(WS_URI);

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "register", name }));
      setMessages((m) => [
        ...m,
        { type: "system", text: `Connected as ${name}` },
      ]);
    };

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const parsed: Incoming = JSON.parse(event.data);
        setMessages((m) => [...m, parsed]);
      } catch {
        setMessages((m) => [...m, { type: "system", text: event.data }]);
      }
    };

    ws.current.onclose = () => {
      setMessages((m) => [
        ...m,
        { type: "system", text: "Disconnected from server" },
      ]);
      setJoined(false);
    };

    ws.current.onerror = () => {
      setMessages((m) => [...m, { type: "system", text: "WebSocket error" }]);
    };

    return () => {
      ws.current?.close();
      ws.current = null;
    };
  }, [joined, name]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "message", text: input.trim() }));
    setInput("");
  };

  const handleJoin = () => {
    if (!name.trim()) return;
    setShowModal(false);
    setJoined(true);
  };

  const getUserColor = (name: string) => {
    const colors = [
      "#FF6B6B",
      "#6BCB77",
      "#4D96FF",
      "#FFD93D",
      "#C77DFF",
      "#F9A826",
      "#FF8C42",
      "#6C5CE7",
      "#00B894",
      "#FD79A8"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <>
      <LiquidEtherBackground />
      
      <Modal open={showModal} onClose={() => {}}>
        <h3 className="text-lg font-semibold mb-2 text-gray-100">Enter display name</h3>
        <input
          className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded mb-3 focus:outline-none focus:border-gray-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        />
        <div className="flex gap-2">
          <button
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!name.trim()}
            onClick={handleJoin}
          >
            Join Chat
          </button>
        </div>
      </Modal>

      <div className="flex flex-col min-h-screen text-gray-200">
        <h2 className="fixed top-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-md text-gray-100 text-2xl font-bold text-center py-4 shadow-lg border-b border-gray-700/50">
          Secure Chat
        </h2>

        <div className="flex-grow overflow-y-auto px-4 pb-28 pt-20">
          {messages.map((msg, idx) => {
            if (msg.type === "system" || msg.type === "error") {
              return (
                <div key={idx} className="text-sm text-gray-400 italic my-3 text-center">
                  {msg.text}
                </div>
              );
            }
            const userColor = getUserColor(msg.name);
            return (
              <div
                key={idx}
                className={`mb-3 px-4 py-3 rounded-2xl text-sm max-w-[80%] backdrop-blur-sm ${
                  msg.name === name ? "ml-auto text-right" : "mr-auto text-left"
                }`}
                style={{ 
                  backgroundColor: userColor + "25",
                  borderLeft: msg.name !== name ? `3px solid ${userColor}` : 'none',
                  borderRight: msg.name === name ? `3px solid ${userColor}` : 'none'
                }}
              >
                <div 
                  className="text-xs font-bold mb-1" 
                  style={{ color: userColor }}
                >
                  {msg.name}
                </div>
                <div className="text-gray-100">{msg.text}</div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md border-t border-gray-700/50 p-4">
          <div className="flex gap-3">
            <input
              className="flex-grow px-5 py-3 rounded-full text-sm bg-gray-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 border border-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-full px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;