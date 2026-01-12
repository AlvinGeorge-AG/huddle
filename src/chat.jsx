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
import { db } from "./firebase";

const ROOM_ID = "test-room";

// 🔹 Username helper
const getUsername = () => {
  let name = localStorage.getItem("huddle_username");
  if (!name) {
    name = prompt("Enter your username:");
    if (!name || !name.trim()) name = "Guest";
    localStorage.setItem("huddle_username", name.trim());
  }
  return name;
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifs, setGifs] = useState([]);

  const usernameRef = useRef(getUsername());
  const bottomRef = useRef(null);
  const chatBoxRef = useRef(null);

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

  // 🔹 Force-scroll (mobile safe)
  useEffect(() => {
    if (!chatBoxRef.current) return;
    setTimeout(() => {
      chatBoxRef.current.scrollTop =
        chatBoxRef.current.scrollHeight;
    }, 0);
  }, [messages]);

  // 🔹 Send text message
  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "messages"), {
      roomId: ROOM_ID,
      sender: usernameRef.current,
      text,
      createdAt: Date.now()
    });

    setText("");
    setShowEmoji(false);
  };

  // 🔹 Fetch GIFs
  const searchGifs = async (q = "funny") => {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${import.meta.env.ejfnelwcy3OriOwW6LNSYw7fCi19xvdz}&q=${q}&limit=6`
    );
    const data = await res.json();
    setGifs(data.data);
  };

  // 🔹 Send GIF
  const sendGif = async (url) => {
    await addDoc(collection(db, "messages"), {
      roomId: ROOM_ID,
      sender: usernameRef.current,
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
          @{usernameRef.current}
        </div>
      </div>

      {/* CHAT BODY */}
      <div
        ref={chatBoxRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#888" }}>
            No messages yet 👋
          </p>
        )}

        {messages.map((m, i) => {
          const isMe = m.sender === usernameRef.current;
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
                    style={{
                      marginTop: 6,
                      maxWidth: "100%",
                      borderRadius: 8
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div
        style={{
          padding: 8,
          borderTop: "1px solid #222",
          display: "flex",
          gap: 6,
          alignItems: "center"
        }}
      >
        <button onClick={() => setShowEmoji(v => !v)}>😀</button>
        <button
          onClick={() => {
            setShowGif(v => !v);
            searchGifs();
          }}
        >
          GIF
        </button>

<input
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Message…"
  style={{
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "none"
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }}
/>

<button onClick={sendMessage}>➤</button>

      </div>

      {/* EMOJI PICKER */}
      {showEmoji && (
        <div style={{ position: "absolute", bottom: 60 }}>
          <EmojiPicker
            onEmojiClick={(e) =>
              setText(prev => prev + e.emoji)
            }
          />
        </div>
      )}

      {/* GIF PICKER */}
      {showGif && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            background: "#111",
            padding: 8,
            display: "flex",
            gap: 6,
            flexWrap: "wrap"
          }}
        >
          {gifs.map(g => (
            <img
              key={g.id}
              src={g.images.fixed_height.url}
              alt="gif"
              style={{ height: 80, cursor: "pointer" }}
              onClick={() =>
                sendGif(g.images.fixed_height.url)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
