import { useEffect, useState, useRef } from "react";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc
} from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";
import { db } from "./firebase";
import { useNavigate, useParams } from "react-router-dom";

export default function Chat({ user }) {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [showGif, setShowGif] = useState(false);
    const [gifs, setGifs] = useState([]);
    const [activityTitle, setActivityTitle] = useState("Huddle Chat");

    const username = user?.displayName || "Anonymous";
    const userEmail = user?.email || "";

    const chatBoxRef = useRef(null);

    /* 🔹 Fetch activity title */
    useEffect(() => {
        if (!roomId) return;
        const fetchActivity = async () => {
            const snap = await getDoc(doc(db, "activities", roomId));
            if (snap.exists()) {
                setActivityTitle(snap.data().title || "Huddle Chat");
            }
        };
        fetchActivity();
    }, [roomId]);

    /* 🔹 Fetch messages */
    useEffect(() => {
        if (!roomId) return;
        const messagesRef = collection(db, "activities", roomId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [roomId]);

    /* 🔹 Auto-scroll */
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages, showEmoji, showGif]);

    const sendMessage = async () => {
        if (!text.trim() || !roomId) return;
        await addDoc(collection(db, "activities", roomId, "messages"), {
            sender: username,
            email: userEmail,
            text: text.trim(),
            createdAt: serverTimestamp(),
            type: "text"
        });
        setText("");
        setShowEmoji(false);
    };

    const sendGif = async (url) => {
        if (!roomId) return;
        await addDoc(collection(db, "activities", roomId, "messages"), {
            sender: username,
            email: userEmail,
            gifUrl: url,
            createdAt: serverTimestamp(),
            type: "gif"
        });
        setShowGif(false);
    };

    const searchGifs = async (q) => {
        if (!q.trim()) return;
        const apiKey = import.meta.env.VITE_GIPHY_KEY;
        if (!apiKey) return;
        const res = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${q}&limit=12`
        );
        const data = await res.json();
        setGifs(data.data || []);
    };

    return (
        // CHANGED: h-screen -> h-[100dvh] (Dynamic viewport height fixes mobile scroll issue)
        <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden">

            {/* HEADER (Added shrink-0 so it doesn't collapse) */}
            <header className="h-16 shrink-0 bg-card/80 backdrop-blur-md border-b border-border flex items-center px-4 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="p-2 rounded-full hover:bg-muted transition"
                    >
                        ←
                    </button>

                    <div>
                        <h2 className="font-bold leading-tight truncate max-w-[200px]">
                            {activityTitle}
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-xs text-muted-foreground">
                                Live chat
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* CHAT AREA (Added min-h-0 to allow proper flex scrolling) */}
            <div
                ref={chatBoxRef}
                className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-card"
            >
                {messages.map((m) => {
                    const isMe = m.email === userEmail;
                    return (
                        <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] md:max-w-[60%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                {!isMe && (
                                    <span className="text-xs text-muted-foreground mb-1 ml-1">
                                        {m.sender}
                                    </span>
                                )}

                                <div className={`px-4 py-2 rounded-2xl text-sm shadow break-words ${isMe
                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                        : "bg-card border border-border rounded-bl-sm"
                                    }`}>
                                    {m.text}
                                    {m.gifUrl && (
                                        <img
                                            src={m.gifUrl}
                                            alt="GIF"
                                            className="rounded-lg mt-2 max-w-full"
                                            onLoad={() => {
                                                // Auto scroll when image loads
                                                if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* INPUT AREA (Added shrink-0 so it sticks to bottom) */}
            <div className="shrink-0 p-4 bg-card border-t border-border z-20">
                <div className="max-w-4xl mx-auto relative">

                    {(showEmoji || showGif) && (
                        <div className="absolute bottom-full mb-3 bg-card border border-border
                            rounded-2xl shadow-xl overflow-hidden w-full max-w-sm left-0 right-0 mx-auto sm:mx-0">
                            {showEmoji && (
                                <EmojiPicker
                                    theme="dark"
                                    onEmojiClick={(e) => setText(prev => prev + e.emoji)}
                                    width="100%"
                                    height={300}
                                />
                            )}

                            {showGif && (
                                <div className="p-3 h-[300px] flex flex-col">
                                    <input
                                        placeholder="Search GIFs..."
                                        className="w-full bg-muted border border-border rounded-lg p-2 text-sm mb-2 outline-none"
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

                    <div className="flex items-end gap-2 bg-muted p-2 rounded-xl border border-border focus-within:border-primary">
                        <button
                            onClick={() => { setShowEmoji(v => !v); setShowGif(false); }}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            🙂
                        </button>

                        <button
                            onClick={() => { setShowGif(!showGif); setShowEmoji(false); }}
                            className="p-2 text-muted-foreground hover:text-pink-400 transition font-bold text-xs border border-transparent hover:border-border rounded-lg h-10 w-10 flex items-center justify-center"
                        >
                            GIF
                        </button>

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent resize-none outline-none py-2 max-h-32 min-h-[40px]"
                            rows={1}
                        />

                        <button
                            onClick={sendMessage}
                            disabled={!text.trim()}
                            className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 font-medium transition-opacity"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}