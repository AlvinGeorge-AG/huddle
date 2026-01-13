import { useEffect, useState, useRef } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

const ROOM_ID = "mec-general";

export default function Chat({ user }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifs, setGifs] = useState([]);

  // Fallback if user prop isn't fully loaded, though ProtectedRoute handles this
  const username = user?.displayName || "Anonymous";
  const userEmail = user?.email || "";

  const chatBoxRef = useRef(null);

  // Fetch Messages
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("roomId", "==", ROOM_ID),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, showEmoji, showGif]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        roomId: ROOM_ID,
        sender: username,
        email: userEmail,
        text: text.trim(),
        createdAt: serverTimestamp(), // Use server timestamp
        type: 'text'
      });
      setText("");
      setShowEmoji(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendGif = async (url) => {
    await addDoc(collection(db, "messages"), {
      roomId: ROOM_ID,
      sender: username,
      email: userEmail,
      gifUrl: url,
      createdAt: serverTimestamp(),
      type: 'gif'
    });
    setShowGif(false);
  };

  const searchGifs = async (q) => {
    if (!q.trim()) return;
    try {
      // NOTE: You need a real Giphy API key in .env as VITE_GIPHY_KEY
      // If testing without key, remove this block or use a hardcoded demo array
      const apiKey = import.meta.env.VITE_GIPHY_KEY;
      if (!apiKey) return;

      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${q}&limit=12`);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      {/* 1. Header */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="font-bold text-white">MEC Huddle</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-slate-400">Live Chat</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Chat Area */}
      <div
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800"
      >
        {messages.map((m) => {
          const isMe = m.email === userEmail;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slideUp`}>
              <div className={`max-w-[85%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender Name (if not me) */}
                {!isMe && <span className="text-xs text-slate-400 mb-1 ml-1">{m.sender}</span>}

                <div className={`
                                    px-4 py-2 rounded-2xl shadow-md text-sm md:text-base break-words
                                    ${isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-700 text-slate-100 rounded-bl-sm border border-slate-600'}
                                `}>
                  {m.text}
                  {m.gifUrl && <img src={m.gifUrl} alt="GIF" className="rounded-lg mt-1 max-w-full" />}
                </div>
              </div>
            </div>
          );
        })}
        <div className="h-2" /> {/* Spacer */}
      </div>

      {/* 3. Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-700 z-30">
        <div className="max-w-4xl mx-auto relative">

          {/* Popups (Emoji/GIF) */}
          {(showEmoji || showGif) && (
            <div className="absolute bottom-full left-0 mb-4 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm">
              {showEmoji && <EmojiPicker theme="dark" onEmojiClick={(e) => setText(prev => prev + e.emoji)} width="100%" height="300px" />}

              {showGif && (
                <div className="p-3 h-[300px] flex flex-col">
                  <input
                    autoFocus
                    placeholder="Search Giphy..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm mb-2 focus:outline-none focus:border-blue-500"
                    onChange={(e) => searchGifs(e.target.value)}
                  />
                  <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2">
                    {gifs.map(g => (
                      <img
                        key={g.id}
                        src={g.images.fixed_height.url}
                        className="w-full rounded cursor-pointer hover:opacity-80"
                        onClick={() => sendGif(g.images.fixed_height.url)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end gap-2 bg-slate-800 p-2 rounded-xl border border-slate-600 focus-within:border-blue-500 transition-colors">
            <button
              onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); }}
              className="p-2 text-slate-400 hover:text-yellow-400 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>

            <button
              onClick={() => { setShowGif(!showGif); setShowEmoji(false); }}
              className="p-2 text-slate-400 hover:text-pink-400 transition font-bold text-xs border border-slate-600 rounded-lg h-10 w-10 flex items-center justify-center"
            >
              GIF
            </button>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white border-none focus:ring-0 resize-none py-2 max-h-32"
              rows="1"
            />

            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}