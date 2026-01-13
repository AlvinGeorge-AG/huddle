import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";
import { db, auth } from "./firebase";

const ROOM_ID = "test-room";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [gifQuery, setGifQuery] = useState("");

  const chatBoxRef = useRef(null);

  // 🔹 Derive username from Firebase Auth
  const user = auth.currentUser;

  const username =
  user?.displayName ||
  user?.email?.split("@")[0] ||
  "Anonymous";


  const PICKER_HEIGHT = showEmoji || showGif ? 300 : 0;

  // 🔹 Firestore listener
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("roomId", "==", ROOM_ID),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => d.data()));
    });

    return () => unsub();
  }, []);

  // 🔹 Auto-scroll
  useEffect(() => {
    if (!chatBoxRef.current) return;
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages, showEmoji, showGif]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "messages"), {
      roomId: ROOM_ID,
      sender: username,
      text,
      createdAt: Date.now()
    });

    setText("");
    setShowEmoji(false);
  };

  const searchGifs = async (q) => {
    if (!q || !q.trim()) return;

    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${import.meta.env.VITE_GIPHY_KEY}&q=${encodeURIComponent(q)}`
    );
    const data = await res.json();
    setGifs(data.data || []);
  };

  const sendGif = async (url) => {
    await addDoc(collection(db, "messages"), {
      roomId: ROOM_ID,
      sender: username,
      gifUrl: url,
      createdAt: Date.now()
    });
    setShowGif(false);
  };

  return (
    <div
      style={{
        maxWidth: 480,
        height: "100dvh",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        background: "#0f0f0f",
        color: "#fff"
      }}
    >
      {/* HEADER */}
      <div style={{ padding: 12, borderBottom: "1px solid #222" }}>
        <strong>Huddle Chat</strong>
        <div style={{ fontSize: 12, color: "#aaa" }}>
          @{username}
        </div>
      </div>

      {/* CHAT BODY */}
      <div
        ref={chatBoxRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          paddingBottom: 80 + PICKER_HEIGHT,
          transition: "padding-bottom 0.2s ease"
        }}
      >
        {messages.map((m, i) => {
          const isMe = m.sender === username;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: 8
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: 8,
                  borderRadius: 10,
                  background: isMe ? "#2563eb" : "#1f2933"
                }}
              >
                {!isMe && (
                  <div style={{ fontSize: 11, opacity: 0.7 }}>
                    {m.sender}
                  </div>
                )}

                {m.text && <div>{m.text}</div>}
                {m.gifUrl && (
                  <img
                    src={m.gifUrl}
                    alt="gif"
                    style={{ marginTop: 6, maxWidth: "100%", borderRadius: 8 }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT + PICKERS */}
      <div style={{ position: "relative" }}>
        {(showEmoji || showGif) && (
          <div
            style={{
              height: 300,
              background: "#111",
              overflowY: "auto",
              borderTop: "1px solid #222"
            }}
          >
            {showEmoji && (
              <EmojiPicker
                onEmojiClick={(e) =>
                  setText(prev => prev + e.emoji)
                }
              />
            )}

            {showGif && (
              <div style={{ padding: 8 }}>
                <input
                  value={gifQuery}
                  onChange={(e) => {
                    setGifQuery(e.target.value);
                    searchGifs(e.target.value);
                  }}
                  placeholder="Search GIFs..."
                  style={{
                    width: "100%",
                    padding: 8,
                    marginBottom: 8,
                    borderRadius: 6,
                    border: "none"
                  }}
                />

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {gifs.map(g => (
                    <img
                      key={g.id}
                      src={g.images.fixed_height.url}
                      alt="gif"
                      style={{ height: 80, cursor: "pointer", borderRadius: 6 }}
                      onClick={() =>
                        sendGif(g.images.fixed_height.url)
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INPUT BAR */}
        <div
          style={{
            padding: 8,
            borderTop: "1px solid #222",
            display: "flex",
            gap: 6,
            alignItems: "center",
            background: "#0f0f0f"
          }}
        >
          <button onClick={() => {
            setShowEmoji(v => !v);
            setShowGif(false);
          }}>😀</button>

          <button onClick={() => {
            setShowGif(v => !v);
            setShowEmoji(false);
            if (!showGif) {
              setGifQuery("funny");
              searchGifs("funny");
            }
          }}>GIF</button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            style={{ flex: 1, padding: 8, borderRadius: 6, border: "none" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
}
