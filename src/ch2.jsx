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
    const [showPicker, setShowPicker] = useState(false); // Controls Drawer visibility
    const [activeTab, setActiveTab] = useState("emoji"); // 'emoji' or 'gif'
    const [gifs, setGifs] = useState([]);
    const [activityTitle, setActivityTitle] = useState("Huddle Chat");
    const [gifSearch, setGifSearch] = useState("");

    const username = user?.displayName || "Anonymous";
    const userEmail = user?.email || "";

    const chatBoxRef = useRef(null);
    const inputRef = useRef(null); // Ref for text input to manage focus

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
    }, [messages, showPicker, activeTab, gifs]);

    /* 🔹 Initial GIF Load */
    useEffect(() => {
        if (activeTab === 'gif' && gifs.length === 0) {
            searchGifs("trending");
        }
    }, [activeTab]);

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
        // Keep picker open or close it? WhatsApp keeps it open if typing, 
        // but usually closes on send. Let's keep focus on input.
        inputRef.current?.focus();
        setShowPicker(false);
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
        setShowPicker(false);
    };

    const searchGifs = async (q) => {
        const apiKey = import.meta.env.VITE_GIPHY_KEY;
        if (!apiKey) return;

        const queryTerm = q.trim() || "trending";

        try {
            const res = await fetch(
                `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${queryTerm}&limit=20`
            );
            const data = await res.json();
            setGifs(data.data || []);
        } catch (error) {
            console.error("Error fetching GIFs", error);
        }
    };

    // 🔹 Logic to open Drawer and Close Keyboard
    const togglePicker = (tab) => {
        if (showPicker && activeTab === tab) {
            // Close if clicking same tab
            setShowPicker(false);
            inputRef.current?.focus(); // Bring keyboard back
        } else {
            // Open Picker
            setShowPicker(true);
            setActiveTab(tab);
            inputRef.current?.blur(); // 🔑 Close Mobile Keyboard
        }
    };

    // 🔹 Logic to Open Keyboard and Close Drawer
    const handleInputFocus = () => {
        setShowPicker(false);
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden">

            {/* HEADER */}
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
                            <span className="text-xs text-muted-foreground">Live chat</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* CHAT MESSAGES AREA */}
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
                                    <span className="text-xs text-muted-foreground mb-1 ml-1">{m.sender}</span>
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
                                            className="rounded-lg mt-2 w-full h-auto object-cover bg-black/20"
                                            loading="lazy"
                                            onLoad={() => chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* INPUT BAR AREA */}
            <div className="shrink-0 p-3 bg-card border-t border-border z-20">
                <div className="flex items-end gap-2 bg-muted p-2 rounded-xl border border-border focus-within:border-primary transition-colors">

                    {/* Emoji Toggle */}
                    <button
                        onClick={() => togglePicker("emoji")}
                        className={`p-2 transition-colors ${showPicker && activeTab === 'emoji' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    >
                        🙂
                    </button>

                    {/* GIF Toggle */}
                    <button
                        onClick={() => togglePicker("gif")}
                        className={`p-2 text-xs font-bold border border-transparent rounded-lg h-10 w-10 flex items-center justify-center transition-all ${showPicker && activeTab === 'gif'
                                ? 'bg-primary/20 text-primary border-primary/20'
                                : 'text-muted-foreground hover:text-primary'
                            }`}
                    >
                        GIF
                    </button>

                    {/* Text Input */}
                    <textarea
                        ref={inputRef}
                        value={text}
                        onFocus={handleInputFocus} // Close drawer when typing
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent resize-none outline-none py-2 max-h-32 min-h-[40px] text-sm sm:text-base"
                        rows={1}
                    />

                    {/* Send Button */}
                    <button
                        onClick={sendMessage}
                        disabled={!text.trim()}
                        className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 font-medium transition-opacity"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 
               DRAWER AREA (Replaces Keyboard) 
               - Uses h-[40vh] to mimic keyboard height
               - conditionally rendered via height transition
            */}
            <div
                className={`shrink-0 bg-card border-t border-border overflow-hidden transition-all duration-300 ease-in-out ${showPicker ? "h-[320px]" : "h-0"
                    }`}
            >
                {/* EMOJI PICKER CONTENT */}
                <div className={`h-full w-full ${activeTab === 'emoji' ? 'block' : 'hidden'}`}>
                    <EmojiPicker
                        theme="dark"
                        onEmojiClick={(e) => setText(prev => prev + e.emoji)}
                        width="100%"
                        height="100%"
                        previewConfig={{ showPreview: false }}
                    />
                </div>

                {/* GIF PICKER CONTENT */}
                <div className={`h-full w-full flex flex-col p-3 ${activeTab === 'gif' ? 'block' : 'hidden'}`}>
                    {/* Search Bar for GIF */}
                    <div className="relative mb-3 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
                        <input
                            type="text"
                            value={gifSearch}
                            onChange={(e) => {
                                setGifSearch(e.target.value);
                                searchGifs(e.target.value);
                            }}
                            placeholder="Search Giphy..."
                            className="w-full bg-muted text-foreground border border-border rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            autoComplete="off"
                        />
                    </div>

                    {/* GIF Grid */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {gifs.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
                                {gifs.map(g => (
                                    <div
                                        key={g.id}
                                        onClick={() => sendGif(g.images.fixed_height.url)}
                                        className="relative aspect-video group cursor-pointer overflow-hidden rounded-lg bg-muted"
                                    >
                                        <img
                                            src={g.images.fixed_height_small.url}
                                            alt={g.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                No GIFs found
                            </div>
                        )}
                    </div>
                    {/* Giphy Attribution */}
                    <div className="shrink-0 text-[10px] text-center text-muted-foreground mt-1">
                        Powered by GIPHY
                    </div>
                </div>
            </div>
        </div>
    );
}