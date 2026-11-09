# ⚡ SkillPay AI

> **Autonomous Freelance Escrow Protocol & AI Deal Room Orchestrated with PayPal Smart Escrow and Google Gemini.**

[![PayPal](https://img.shields.io/badge/PayPal-Orders%20v2%20REST%20API-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://developer.paypal.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-18.3%20+%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Escrow Status](https://img.shields.io/badge/Escrow-100%25%20Non--Custodial-10B981?style=for-the-badge&logo=shield&logoColor=white)]()

---

## 📖 Executive Summary

The $1.5 trillion global freelance economy suffers from a fundamental trust deficit:
- **Freelancers** fear non-payment, scope creep, and payment disputes after hours of completed labor.
- **Clients** fear non-delivery, subpar quality, and unresponsive contractors once funds leave their bank.
- **Traditional Marketplaces** levy exorbitant 15%–20% intermediary fees, impose multi-day payout delays, and operate clunky manual arbitration procedures.

**SkillPay AI** solves this with an **Autonomous Freelance Escrow Protocol**:
1. **Natural Language Requirement Decomposition**: Google Gemini AI parses unformatted client prompts into structured technical scopes, milestones, and required tech stacks.
2. **AI Provider Matchmaker**: Algorithmic vector scoring pairs clients with verified specialists based on verified skills, portfolio history, and milestone rate alignment.
3. **Autonomous AI Deal Room**: An interactive compromise negotiation engine reconciles client budgets and provider asking rates into a binding, balanced milestone contract.
4. **Non-Custodial PayPal Smart Escrow**: Client funds are authorized and secured cryptographically via PayPal Orders v2. Deposits remain locked in smart escrow and disburse directly to the provider's verified PayPal account upon client delivery sign-off.
5. **Real-Time Direct Chat & Proposals**: Encrypted direct communication with proposal auto-recovery, linked escrow deal room banners, and 0ms instantaneous state synchronization.

---

## 🌟 Core System Highlights

### 🤖 1. Gemini AI Matchmaker & Scope Engine
- Clients describe project needs in plain English (e.g. *"I need a modern SaaS school portal with table booking and payment integration"*).
- Gemini analyzes scope complexity, derives required technical proficiencies, sets optimal milestone timeframes, and calculates pricing intelligence.
- Match scores dynamically rank verified freelancers with skill compatibility percentages.

### ⚖️ 2. Autonomous AI Deal Room
- Both parties enter a shared, synchronized AI Deal Room.
- Clients submit counter-offers while providers state minimum delivery requirements.
- The AI mediator continuously evaluates concessions, suggests mutually beneficial middle-ground figures, and generates structured milestone schedules.
- Once both parties accept, the deal locks into an official escrow contract.

### 🛡️ 3. Bank-Grade PayPal Smart Escrow Vault
- Eliminates traditional middleman custody: Client deposits are held with PayPal's native escrow capture protocol.
- Features a **Virtual Escrow Debit Card** UI tracking:
  - Escrow Account Number & Vault Protocol
  - Milestone Progress Timeline (Agreement Signed $\rightarrow$ Payment Secured $\rightarrow$ Work in Progress $\rightarrow$ Delivery Submitted $\rightarrow$ Funds Released)
  - Cardholder details, cryptographic release verification, and multi-order pagination.
- **2-Day Inspection & Auto-Release Protocol**: Clients are given an automated 2-day (48-hour) inspection window upon milestone delivery. If the client approves, funds release immediately. If no action or revision is requested within 2 days, PayPal Smart Escrow automatically auto-releases the funds to the freelancer's verified PayPal account to protect talent from non-responsive clients.

### 💼 4. Dedicated Dual Portals
- **Client Portal**:
  - Open Market Brief creation with live image upload & compression progress bar ($0\% \rightarrow 100\%$).
  - LinkedIn-style verified Freelancer Directory with category filtering, cover banners, and direct hire requests.
  - Active orders tracking, milestone inspection, and review rating engine.
- **Freelancer Portal**:
  - Comprehensive freelancer onboarding and public profile showcase.
  - Open Marketplace Briefs browser with custom price, delivery timeline, and cover letter proposal submission.
  - Earnings & Escrow Ledger with real-time tracking of locked escrow vs. released payouts.
  - Direct delivery submission with deliverable URLs and inspection alerts.

### 💬 5. Direct Messaging & Proposal Synchronization
- Live synced conversations between clients and freelancers with 0ms local cache.
- Automatic recovery of marketplace proposals into conversation threads.
- Pinned proposal cards featuring proposal price, delivery days, escrow badges, and direct **"Accept & Fund Escrow"** action links.

---

## 📐 System Architecture

SkillPay AI is architected as a clean, decoupled multi-tier system with modern event-driven state updates.

```mermaid
flowchart TD
    subgraph ClientLayer["🖥️ Frontend Client (React 18 + Vite + TailwindCSS v4)"]
        UI_Customer["Customer Portal\n(Briefs, Network, Checkout)"]
        UI_Freelancer["Freelancer Hub\n(Dashboard, Briefs, Ledger)"]
        UI_DealRoom["AI Deal Room\n(Realtime Compromise)"]
        UI_Messages["Direct Chat & Escrow Rooms\n(Live Synced)"]
        UI_OrderTracking["Orders & Escrow Vault\n(Virtual Escrow Card)"]
    end

    subgraph APILayer["⚙️ API Gateway (Node.js + Express)"]
        Router_Auth["/api/v1/auth\n(JWT & Role Control)"]
        Router_Jobs["/api/v1/jobs\n(Scopes & Briefs)"]
        Router_Negotiations["/api/v1/negotiations\n(Deal Room Sessions)"]
        Router_Orders["/api/v1/orders\n(Escrow & Checkouts)"]
        Router_Conversations["/api/v1/conversations\n(Messages & Proposals)"]
        Router_Providers["/api/v1/providers\n(Directory & Profiles)"]
        Router_Webhooks["/api/v1/webhooks\n(PayPal IPN / Events)"]
    end

    subgraph ServiceLayer["🧠 Intelligence & Payment Protocols"]
        GeminiAI["Google Gemini 1.5 Flash\n(Scope Decomposition & Mediation)"]
        PayPalEscrow["PayPal REST API v2\n(Orders, Captures & Payouts)"]
    end

    subgraph StorageLayer["🗄️ Database & Identity"]
        FirestoreDB[("Firebase Firestore\n(Orders, Briefs, Chats, Users)")]
        FirebaseAuth["Firebase Auth / Token Verification"]
        LocalStorageCache["Client 0ms Sync Cache\n(skillpay_conversations, orders)"]
    end

    UI_Customer --> APILayer
    UI_Freelancer --> APILayer
    UI_DealRoom --> APILayer
    UI_Messages --> APILayer
    UI_OrderTracking --> APILayer

    APILayer --> GeminiAI
    APILayer --> PayPalEscrow
    APILayer --> FirestoreDB
    APILayer --> FirebaseAuth

    UI_Messages <--> LocalStorageCache
    UI_OrderTracking <--> LocalStorageCache
```

---

## 🔄 Escrow Contract Lifecycle

The state machine below illustrates the progression of an escrow contract from initial requirement posting through to PayPal settlement:

```mermaid
stateDiagram-v2
    [*] --> DraftBrief: Client Posts Project Need / Brief
    DraftBrief --> OpenMarket: Published to Freelancer Marketplace
    OpenMarket --> ProposalSubmitted: Freelancer Sends Custom Proposal
    ProposalSubmitted --> InDiscussion: Direct Chat / Clarification
    InDiscussion --> DealRoom: Client & Freelancer Enter AI Deal Room
    
    state DealRoom {
        [*] --> Negotiating
        Negotiating --> AICounterOffer: Gemini Generates Compromise
        AICounterOffer --> TermsAccepted: Both Parties Sign Agreement
    }
    
    TermsAccepted --> EscrowCheckout: Order Initialized
    EscrowCheckout --> FundsLocked: PayPal Smart Escrow Deposit Authorized
    FundsLocked --> WorkInProgress: Provider Begins Milestone Development
    WorkInProgress --> DeliverySubmitted: Provider Submits Deliverables
    
    state InspectionPeriod {
        DeliverySubmitted --> UnderReview: Client Inspects Deliverables
        UnderReview --> RevisionRequested: Client Requests Adjustments
        RevisionRequested --> WorkInProgress: Provider Refines Scope
        UnderReview --> Approved: Client Approves Delivery
        UnderReview --> AutoReleased: 2-Day (48h) Window Elapses
    }
    
    Approved --> EscrowSettlement: PayPal Smart Escrow Disburses Funds
    AutoReleased --> EscrowSettlement: Automatic 48h PayPal Payout
    EscrowSettlement --> OrderCompleted: Instant Payout to Provider Account
    OrderCompleted --> [*]
```

---

## 📊 End-to-End Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as 👤 Client
    participant Frontend as 🖥️ Client Web App
    participant Backend as ⚙️ Express Backend
    participant Gemini as 🧠 Gemini AI
    participant PayPal as 💳 PayPal Smart Escrow
    actor Freelancer as 💼 Freelancer

    Client->>Frontend: Posts project need with custom photo
    Frontend->>Frontend: Client-side downscale & animated upload progress (0-100%)
    Frontend->>Backend: POST /jobs (title, description, budget)
    Backend->>Gemini: Analyze requirements & extract skills
    Gemini-->>Backend: Structured scope + recommended milestones
    Backend-->>Frontend: Marketplace brief created

    Freelancer->>Frontend: Reviews brief & submits custom proposal
    Frontend->>Backend: POST /conversations (creates thread + proposal)
    Backend-->>Frontend: Live synced chat thread created
    Frontend-->>Client: Real-time notification: "New Proposal Received"

    Client->>Frontend: Opens proposal in Direct Chat & clicks "Enter Deal Room"
    Frontend->>Backend: POST /negotiations/compromise
    Backend->>Gemini: Mediate client budget & freelancer ask
    Gemini-->>Backend: Balanced compromise ($85 USD, 4 days)
    Backend-->>Frontend: Synchronized Deal Room offer accepted

    Client->>Frontend: Proceeds to Checkout
    Frontend->>PayPal: Authorize & lock deposit (INTENT=CAPTURE)
    PayPal-->>Frontend: Payment authorization confirmed
    Frontend->>Backend: POST /orders/checkout (records order in escrow)
    Backend-->>Frontend: Order status: "In Progress (Funds Held in Smart Escrow)"

    Freelancer->>Frontend: Submits milestone deliverables
    Frontend->>Backend: PUT /orders/:id/deliver (status: "Delivered")
    Backend-->>Client: Notification: "Deliverables Ready for Inspection"

    Client->>Frontend: Inspects deliverables & clicks "Approve & Release Funds"
    Frontend->>PayPal: Execute Escrow Capture & Milestone Release
    PayPal-->>Freelancer: Funds disbursed directly to verified PayPal account
    Frontend->>Frontend: Confetti & celebration animation + 5-star review CTA
```

---

## 📂 Project Directory Structure

```text
paypal-hackathon/
├── client/                               # Frontend Single Page Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/                      # AI Deal Room components & match cards
│   │   │   ├── common/                  # Reusable GlassCards, Badges, Virtual Escrow Card
│   │   │   ├── home/                    # Landing page hero & live deal room showcase
│   │   │   └── navigation/              # AppNavbar, ProfileDropdown, Role-based tabs
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Firebase Auth & strict Firestore role resolution
│   │   │   ├── JourneyContext.jsx       # Multi-step project wizard context
│   │   │   └── ToastContext.jsx         # Global notifications system
│   │   ├── pages/
│   │   │   ├── Checkout.jsx             # PayPal Smart Escrow checkout & deposit authorization
│   │   │   ├── ClientProfile.jsx        # Dedicated client account management & escrow ledger
│   │   │   ├── CustomerDashboard.jsx    # Client dashboard, Post Project Need modal, real orders
│   │   │   ├── DealRoom.jsx             # Interactive real-time AI negotiation room
│   │   │   ├── FreelancerDashboard.jsx  # Freelancer hub, Open Marketplace Briefs, stats
│   │   │   ├── FreelancerDirectory.jsx  # LinkedIn-style verified freelancer network
│   │   │   ├── FreelancerOnboarding.jsx # Multi-step freelancer profile & PayPal configuration
│   │   │   ├── FreelancerPayments.jsx   # Freelancer escrow ledger & payout router
│   │   │   ├── FreelancerProfile.jsx    # Freelancer skills, portfolio & rates editor
│   │   │   ├── Home.jsx                 # Public landing page with trust architecture
│   │   │   ├── MessagesPage.jsx         # Direct Chat, proposal cards & escrow deal rooms
│   │   │   └── OrderTracking.jsx        # Virtual Escrow Card, milestone progress, fund release
│   │   ├── services/
│   │   │   ├── api.js                   # High-level API client with instant local storage sync
│   │   │   └── apiClient.js             # Axios instance with auth headers & error handling
│   │   ├── styles/
│   │   │   └── tokens.css               # Design tokens, glassmorphism & color primitives
│   │   ├── App.jsx                      # Client router & role-protected route guards
│   │   └── main.jsx                     # Application bootstrap & provider wrapping
│   ├── package.json
│   └── vite.config.js
│
├── server/                               # Backend REST API (Node.js 20+ Express)
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                   # Validated environment variables (Zod)
│   │   │   └── firebase.js              # Firebase Admin SDK initialization
│   │   ├── controllers/                 # Request handlers for jobs, orders, auth, AI
│   │   ├── middleware/
│   │   │   ├── auth.js                  # Bearer token verification & user population
│   │   │   ├── error.js                 # Global error handling & AppError formatting
│   │   │   └── role.js                  # Role-based access control (customer vs provider)
│   │   ├── repositories/                # Firestore persistence layer (orders, users, chats)
│   │   ├── routes/                      # Express route definitions (/api/v1/*)
│   │   ├── services/
│   │   │   ├── ai/                      # Gemini AI integration, prompt analyzers, matchers
│   │   │   └── paypalService.js         # PayPal Orders v2 REST client & capture protocols
│   │   ├── app.js                       # Express app configuration & middleware pipeline
│   │   └── server.js                    # HTTP server entry point
│   ├── package.json
│   └── .env.example
│
└── README.md                             # Comprehensive project documentation
```

---

## 🔌 API Reference

All backend endpoints are prefixed with `/api/v1`. Protected routes require a valid `Authorization: Bearer <token>` header.

### 🔑 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Create a new user profile with role (`customer` or `provider`) | No |
| `POST` | `/login` | Authenticate existing user and return session token | No |
| `GET` | `/me` | Retrieve the authenticated user's profile and active role | **Yes** |

### 📋 Jobs & Market Briefs (`/api/v1/jobs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | List all open marketplace project briefs | No |
| `POST` | `/` | Post a new job need with budget, deadline, and skills | **Yes** (Client) |
| `GET` | `/:id` | Fetch specific brief details and submitted proposals | No |
| `GET` | `/:id/matches` | Get Gemini AI ranked freelancer matches for a brief | **Yes** |

### 🤝 AI Deal Room & Negotiations (`/api/v1/negotiations`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/` | Initialize a negotiation room between client and provider | **Yes** |
| `GET` | `/:id` | Get current deal state, offers history, and agreed price | **Yes** |
| `POST` | `/:id/compromise` | Request Gemini AI to mediate offer and propose middle ground | **Yes** |
| `PUT` | `/:id/accept` | Sign and lock agreed terms into an escrow contract | **Yes** |

### 💳 Escrow Orders & PayPal (`/api/v1/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/checkout` | Create PayPal Orders v2 order with `INTENT=CAPTURE` | **Yes** (Client) |
| `POST` | `/:id/capture` | Capture and lock funds into PayPal Smart Escrow | **Yes** (Client) |
| `GET` | `/` | Retrieve orders for the authenticated user | **Yes** |
| `GET` | `/:id` | Get order details, virtual card metadata, and step status | **Yes** |
| `PUT` | `/:id/deliver` | Provider submits deliverables for client inspection | **Yes** (Provider) |
| `PUT` | `/:id/approve` | Client approves delivery; releases escrow funds instantly | **Yes** (Client) |

### 💬 Conversations & Direct Chat (`/api/v1/conversations`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Fetch all active conversations for the authenticated user | **Yes** |
| `POST` | `/` | Start a direct conversation or proposal thread | **Yes** |
| `GET` | `/:id/messages` | Retrieve message history for a conversation | **Yes** |
| `POST` | `/:id/messages` | Send an encrypted message in a conversation thread | **Yes** |
| `DELETE`| `/:id` | Delete conversation and associated message history | **Yes** |

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **React 18.3** | Component-driven UI architecture |
| **Build Tool** | **Vite** | Fast Hot Module Replacement (HMR) and optimized bundler |
| **Styling** | **Tailwind CSS v4** | Modern CSS utility framework with custom glassmorphism design tokens |
| **Icons & UI Primitives**| **Lucide React** | Clean, accessible iconography |
| **Animations** | **Framer Motion** | Smooth interactive card transitions and modal reveals |
| **Backend Runtime** | **Node.js 20+** | High-performance asynchronous backend runtime |
| **API Framework** | **Express.js** | RESTful routing, validation, and security middleware |
| **AI Mediation Engine** | **Google Gemini 1.5 Flash** | Requirements decomposition and autonomous deal room compromise |
| **Escrow & Payments** | **PayPal REST Orders v2** | Non-custodial escrow deposits, captures, and automated payouts |
| **Database & Auth** | **Firebase Firestore & Auth** | NoSQL cloud persistence, real-time sync, and user identity management |
| **Code Quality** | **Oxlint & ESLint** | Static code analysis with 0 errors |

---

## 🚀 Setup & Installation

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PayPal Developer Account**: Sandbox client ID and secret ([developer.paypal.com](https://developer.paypal.com))
- **Google AI Studio Key**: API key for Gemini 1.5 Flash ([aistudio.google.com](https://aistudio.google.com))
- **Firebase Project**: Firestore database enabled with service account credentials

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/paypal-hackathon.git
cd paypal-hackathon
```

### 3. Backend Setup
```bash
cd server
npm install
```

Create a `server/.env` file:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_EMULATOR=false

# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-paypal-sandbox-secret
PAYPAL_ENV=sandbox
PAYOUT_MODE=simulated
PLATFORM_FEE_PERCENT=5

# Google Gemini AI Configuration
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key
AI_MODEL=gemini-1.5-flash
```

Start the backend server:
```bash
npm run dev
# Backend runs on http://localhost:5000
```

### 4. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
```

Create a `client/.env` file:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_USE_MOCK=false
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_PAYPAL_CLIENT_ID=your-paypal-sandbox-client-id
```

Start the frontend Vite development server:
```bash
npm run dev
# Frontend runs on http://localhost:5000 / http://localhost:5173
```

---

## 🧪 Live Demo & Evaluation Walkthrough

Follow these steps to experience the complete SkillPay AI escrow flow:

1. **Open the Application**:
   - Navigate to `http://localhost:5173` in your browser.
2. **Post a Project Need (Client)**:
   - Log in or register as a **Client**.
   - On the Customer Dashboard, click **"Post Project Need"**.
   - Enter a title, select a category, input budget and days, and choose or upload a custom project image.
   - Observe the **real-time visual upload progress bar** ($0\% \rightarrow 100\%$) and automated web compression.
   - Click **"Publish Project Need"** to launch the brief to the marketplace.
3. **Submit a Proposal (Freelancer)**:
   - Log in or switch to a **Freelancer** account.
   - On the Freelancer Dashboard, scroll to **"Open Marketplace Briefs"**.
   - Find the newly posted brief and click **"Send Proposal / Message"**.
   - Input your proposed rate, delivery days, and cover message. Click **"Send Proposal & Open Chat"**.
   - The app immediately opens **Messages** (`/messages?conv=...`) with the active proposal card pinned at the top.
4. **Negotiate in the AI Deal Room**:
   - Click **"Open Deal Room"** directly from the chat banner.
   - Submit counter-offers and click **"AI Compromise"** to watch Gemini mediate between client and freelancer constraints.
   - Both parties accept the terms to lock the agreement.
5. **Fund via PayPal Smart Escrow**:
   - Proceed to **Checkout**.
   - Click **"Authorize & Pay with PayPal Smart Escrow"**.
   - Authenticate with PayPal Sandbox credentials. The milestone funds lock securely in escrow.
6. **Milestone Delivery & Escrow Release**:
   - Navigate to `/orders`. Notice the interactive **Virtual Escrow Debit Card** showing status `Work in Progress`.
   - The freelancer submits deliverables: click **"Submit Milestone Delivery"**.
   - Switch to the client account: click **"Approve & Release Funds"**.
   - PayPal Smart Escrow releases the funds to the freelancer's verified PayPal account, accompanied by an instant celebration screen!

---

## 🔒 Security & Non-Custodial Compliance

- **Zero Intermediary Custody**: SkillPay AI never pools client money into private operating accounts. Funds move strictly between client accounts and provider accounts through PayPal Orders v2 escrow captures.
- **Strict Role-Based Scoping**: User profiles and records are verified directly against Firestore database state.
- **Token Redaction & Sanitization**: Authorization headers and credentials are automatically redacted in server logging pipelines.
- **XSS & Injection Hardening**: All inputs undergo schema validation (Zod) and sanitization before processing.

---

## 📄 License

This project is licensed under the **MIT License**.

Built with ❤️ for the **PayPal AI Hackathon**.