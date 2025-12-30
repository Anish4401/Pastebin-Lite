# Pastebin Lite

A minimal Pastebin-like application that allows users to create text pastes and share a link to view them. Pastes can optionally expire based on **time (TTL)** or **view count**. The project focuses on **backend correctness, persistence, and serverless-safe design**, with a simple UI to demonstrate the flows.

---

## Project Overview

Pastebin Lite supports two main user flows:

1. **Create a paste** via a simple UI
2. **View a paste** using a shared link until it expires

A paste becomes unavailable (returns 404) when **either** of its constraints is triggered:

* Time-based expiry (TTL)
* Maximum allowed views

UI design is intentionally minimal, as styling is not a grading criterion.

---

##  Tech Stack

* **Next.js (App Router)** – Full-stack framework (UI + API)
* **Node.js** – Server runtime
* **Redis (Upstash)** – Persistence layer
* **TypeScript** – Type safety
* **Vercel** – Deployment target

> **Node.js v18 or higher is required.**

---

## 🗄️ Persistence Layer

Redis (via **Upstash**) is used to persist pastes across requests and deployments.

Each paste is stored as a Redis key using the following structure:

```
paste:{id} → {
  id: string,
  content: string,
  created_at: number,        // epoch ms
  expires_at: number | null, // epoch ms
  max_views: number | null,
  views_used: number
}
```

### Why Redis TTL is NOT used

Native Redis TTL is not used because automated tests require **deterministic control over time**. Expiry logic is enforced in application code instead.

---

## ⏱️ Deterministic Time Support (Testing)

To support automated testing, the application supports deterministic time:

* If `TEST_MODE=1` is set
* And the request includes header `x-test-now-ms`

Then the provided timestamp is used as the current time **only for expiry checks**.

---

## 📁 Repository Structure

```
.
├── src/
│   ├── favicon.ico
│   └── app/
│       ├── api/
│       │   ├── healthz/
│       │   │   └── route.ts
│       │   └── pastes/
│       │       ├── route.ts
│       │       └── [id]/
│       │           └── route.ts
│       ├── p/
│       │   └── [id]/
│       │       └── page.tsx
│       ├── page.tsx
│       ├── layout.tsx
│       └── globals.css
├── lib/
│   ├── redis.ts
│   └── time.ts
├── .gitignore
├── README.md
├── package.json
└── package-lock.json

```

---

##  Running the Project Locally

Follow these steps to run the project locally from scratch.

### 1️⃣ Install dependencies

```bash
npm install
```

---

### 2️⃣ Configure environment variables

Create a file named `.env.local` in the project root:

```env
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

> ⚠️ Do NOT commit `.env.local` to version control.

---

### 3️⃣ Start the development server

```bash
npm run dev
```

The application will start at:

```
http://localhost:3000
```

(If the port is already in use, Next.js will automatically choose another port.)

---

## 🔌 API Endpoints

### Health Check

```
GET /api/healthz
```

Response:

```json
{ "ok": true }
```

---

### Create Paste

```
POST /api/pastes
```

Request body:

```json
{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}
```

Response:

```json
{
  "id": "abc123",
  "url": "/p/abc123"
}
```

---

### Fetch Paste (API)

```
GET /api/pastes/:id
```

Response:

```json
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

If the paste is expired, missing, or exceeds view limits, the API returns **404**.

---

### View Paste (HTML)

```
GET /p/:id
```

* Renders paste content safely
* Returns a 404 page if the paste is unavailable

---

##  Error Handling

* Invalid input → 4xx response with JSON error
* Expired paste → 404
* View limit exceeded → 404
* Missing paste → 404

All unavailable cases are handled consistently.

---

##  Security & Code Quality Notes

* No secrets or credentials are committed
* No hardcoded absolute URLs (e.g., localhost) are used
* Server-side logic is stateless and serverless-safe
* Persistence is handled entirely by Redis

---

##  Deployment

The application is designed for **Vercel** deployment:

* No database migrations required
* No manual shell access required
* Works in serverless environments

---

## Status

✔ All required routes implemented
✔ Persistence across requests
✔ TTL and view-count constraints enforced
✔ Deterministic testing supported
✔ Meets repository and code-quality requirements

---

Thank you for reviewing this submission 
