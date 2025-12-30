// src/app/p/[id]/page.tsx
import { headers } from "next/headers";

async function getPaste(id: string) {
  const h = await headers();
  const host = h.get("host");

  if (!host) return null;

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/pastes/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return { error: true, ...errorData };
  }
  
  return res.json();
}

function formatExpiryTime(expiresAt: string) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Expired";
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  if (diffMins > 0) return `Expires in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  return "Expires soon";
}

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPaste(id);

  // Handle error states
  if (data?.error) {
      return (
        <main
          style={{
            maxWidth: 600,
            margin: "40px auto",
            padding: 16,
            backgroundColor: "#f5f6fa",
            borderRadius: 8,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: 8 }}>
            {data.reason === "expired" && "Paste Expired"}
            {data.reason === "view_limit" && "View Limit Reached"}
            {data.reason === "not_found" && "Paste Not Found"}
          </h2>
    
          <p style={{ color: "#555", marginBottom: 16 }}>
            {data.reason === "expired" &&
              "This paste has expired and is no longer available."}
            {data.reason === "view_limit" &&
              "This paste has reached its maximum allowed views."}
            {data.reason === "not_found" &&
              "The paste you are looking for does not exist."}
          </p>
    
          <a href="/" style={{ color: "#1976d2" }}>
            ← Create a new paste
          </a>
        </main>
      );
    }
    
  

  // Normal paste view
  return (
    <main
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 16,
        backgroundColor: "#f5f6fa",
        borderRadius: 8,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          fontSize: 13,
          color: "#555",
        }}
      >
        {data.remaining_views !== null && (
          <span>{data.remaining_views} view(s) remaining</span>
        )}
        {data.expires_at && (
          <span>{formatExpiryTime(data.expires_at)}</span>
        )}
      </div>
  
      <pre
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          fontSize: 14,
          background: "#fff",
          padding: 12,
          borderRadius: 6,
          border: "1px solid #ddd",
        }}
      >
        {data.content}
      </pre>
  
      {data.remaining_views === 1 && (
        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            color: "#b91c1c",
          }}
        >
          ⚠️ This paste will expire after one more view.
        </p>
      )}
  
      <div style={{ marginTop: 16 }}>
        <a href="/" style={{ color: "#1976d2", fontSize: 14 }}>
          ← Create another paste
        </a>
      </div>
    </main>
  );
  
}