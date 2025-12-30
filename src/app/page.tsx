
"use client";

import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied,setCopied]=useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultUrl(null);

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    const payload: any = {
      content,
    };

    if (ttl) payload.ttl_seconds = Number(ttl);
    if (maxViews) payload.max_views = Number(maxViews);

    setLoading(true);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong");
        return;
      }

      setResultUrl(data.url);
      setContent("");
      setTtl("");
      setMaxViews("");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "48px auto",
        padding: 20,
        backgroundColor: "#f8f9fb",
        borderRadius: 10,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
        Pastebin Lite
      </h1>
  
      <form onSubmit={handleSubmit}>
        {/* Textarea */}
        <div style={{ marginBottom: 16 }}>
          <textarea
            placeholder="Enter your paste here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            style={{
              width: "100%",
              padding: 12,
              fontSize: 14,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>
  
        {/* Options */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 12,
          }}
        >
          <input
            type="number"
            placeholder="TTL (seconds)"
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
            min={1}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
            }}
          />
          <input
            type="number"
            placeholder="Max views"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            min={1}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
            }}
          />
        </div>
  
        {/* Submit */}
        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 28px",
              fontSize: 15,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Paste"}
          </button>
        </div>
      </form>
  
      {/* Error */}
      {error && (
        <p
          style={{
            color: "#dc2626",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
  
      {/* Success */}
      {resultUrl && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            background: "#eef2ff",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
            wordBreak: "break-all",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <a
              href={resultUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#1d4ed8", flex: 1 }}
            >
              {resultUrl}
            </a>
            <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>
              Click the link above to view your paste.
            </div>
          </div>
          <button
            onClick={async () => {
              if (resultUrl) {
                await navigator.clipboard.writeText(resultUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            style={{
              background: "#e0e7ff",
              border: "1px solid #c7d2fe",
              borderRadius: 4,
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: 12,
            }}
            disabled={copied}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </main>
  );
  
}

