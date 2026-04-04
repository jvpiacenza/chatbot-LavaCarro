import { useState, useRef, useEffect } from "react";

const SESSION_ID = Math.random().toString(36).substring(2, 12);

export default function Home() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Olá! 👋 Bem-vindo ao Carro Limpo! Como posso te ajudar?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: SESSION_ID }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { from: "bot", text: "Erro ao conectar. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={{ fontSize: 22 }}>💧</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Carro Limpo</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Lava-Jato · Online agora</div>
        </div>
      </div>

      <div style={styles.chat}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <div style={{
              ...styles.bubble,
              background: msg.from === "user" ? "#0077cc" : "#ffffff",
              color: msg.from === "user" ? "#fff" : "#1a1a1a",
              borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{ ...styles.bubble, background: "#fff", color: "#999" }}>digitando...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.footer}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Digite sua mensagem..."
          disabled={loading}
        />
        <button style={styles.btn} onClick={sendMessage} disabled={loading || !input.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 480, margin: "30px auto", height: "90vh", display: "flex", flexDirection: "column", border: "1px solid #dde3ec", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", background: "#f0f4f8" },
  header: { display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "#0077cc", color: "#fff" },
  chat: { flex: 1, overflowY: "auto", padding: "16px" },
  bubble: { maxWidth: 300, padding: "10px 14px", fontSize: 14, lineHeight: 1.5, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  footer: { display: "flex", gap: 8, padding: "12px 16px", background: "#fff", borderTop: "1px" }
}