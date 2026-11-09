# Frontend Contract & Data Specifications

This document outlines the data schemas, entity states, and endpoints governing the SkillPay AI Freelancer Redesign.

## 1. Provider (Freelancer) Profile Schema

```typescript
interface ProviderProfile {
  id: string;                      // Unique provider UID (e.g. 'u_provider')
  uid: string;
  name: string;
  email: string;
  role: 'provider';
  headline: string;                // e.g. "Senior Full-Stack & Fintech React Developer"
  bio: string;                     // Minimum 50 chars for publishing
  avatar?: string;
  photoURL?: string;
  location?: string;
  timezone?: string;               // e.g. "UTC-08:00 (PST)"
  languages?: string[];            // e.g. ["English", "Tamil"]
  rating: number;                  // 1.0 - 5.0
  experienceYears: number;         // e.g. 6
  basePriceCents: number;          // Core starting project price in cents (e.g. 8500 = $85.00)
  hourlyRateCents?: number;        // e.g. 5000 = $50.00/hr
  deliveryDaysTypical: number;     // e.g. 3
  revisionsIncluded: number;       // e.g. 2
  availability: 'available' | 'busy' | 'away';
  responseTimeHours: number;       // e.g. 1
  weeklyCapacity?: string;         // e.g. "30 hrs/week"
  paypalEmail: string;             // PayPal Sandbox payout address
  published: boolean;              // Only published profiles appear in search and AI matching
  profileCompleteness: number;     // 0 - 100, computed server-side
  onboardingStep: number;          // 1 - 6
  skills: string[];
  skillNames: string[];
  skillDetails?: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'expert';
    years: number;
  }>;
  packages: Array<{
    tier: 'basic' | 'standard' | 'premium';
    title: string;
    description: string;
    priceCents: number;
    deliveryDays: number;
    revisions?: number;
  }>;
  portfolio: Array<{
    title: string;
    url?: string;
    image?: string;
  }>;
  certifications?: string[];
  completedProjects: number;
  completedOrders: number;
}
```

## 2. Hire Request Schema

```typescript
type HireRequestStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'withdrawn';

interface HireRequest {
  id: string;                      // e.g. "hr_1792349000"
  customerId: string;              // Client UID
  customerName: string;
  customerEmail?: string;
  providerId: string;              // Freelancer UID
  providerName?: string;
  jobId?: string;                  // Associated job (if any)
  title: string;                   // Project brief title
  description: string;             // Detailed scope
  budgetCents: number;             // USD cents (e.g. 8500 = $85)
  deadlineDays: number;            // e.g. 3
  selectedPackage?: {
    tier: string;
    title: string;
    priceCents: number;
  };
  message?: string;                // Client intro message
  aiMatchScore: number;            // Calculated fit percentage (e.g. 94)
  status: HireRequestStatus;
  declineReason?: string;
  negotiationId?: string;          // Created atomically on accept
  createdAt: string;               // ISO 8601
  updatedAt?: string;
}
```

## 3. Conversation & Messaging Schema

```typescript
interface Conversation {
  id: string;                      // e.g. "conv_restaurant_demo"
  participantIds: string[];        // [customerId, providerId]
  customerId: string;
  providerId: string;
  hireRequestId?: string;          // Pinned hire request card
  lastMessage?: string;
  lastMessageAt: string;           // ISO 8601
  unreadBy: Record<string, number>;// { [userId]: count }
}

interface Message {
  id: string;                      // e.g. "msg_1"
  senderId: string;
  body: string;
  createdAt: string;               // ISO 8601
}
```

## 4. Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/providers` | Public | List published providers with filters (search, category, price, availability). Unpublished excluded. |
| `GET` | `/api/v1/providers/:id` | Public | Retrieve single provider. Non-owners cannot see unpublished profiles. |
| `PUT` | `/api/v1/providers/me` | Provider | Update freelancer profile & recalculate completeness. |
| `POST` | `/api/v1/providers/me/publish` | Provider | Publish/unpublish profile with validation checks. |
| `POST` | `/api/v1/hire-requests` | Customer | Submit new project hire request to freelancer. |
| `GET` | `/api/v1/hire-requests` | Authenticated | List hire requests filtered by user's role (customerId or providerId). |
| `POST` | `/api/v1/hire-requests/:id/accept` | Provider | Accept request and create/open Deal Room in 1 Firestore transaction. |
| `POST` | `/api/v1/hire-requests/:id/decline` | Provider | Decline request with optional reason. |
| `POST` | `/api/v1/hire-requests/:id/withdraw`| Customer | Cancel pending hire request. |
| `GET` | `/api/v1/conversations` | Authenticated | List conversations for current user. |
| `GET` | `/api/v1/conversations/:id/messages` | Authenticated | Fetch messages for a conversation (participants only). |
| `POST`| `/api/v1/conversations/:id/messages` | Authenticated | Send message and update unread counters. |
| `POST`| `/api/v1/ai/suggest-price` | Provider | AI pricing recommendation engine. |
| `POST`| `/api/v1/ai/improve-bio` | Provider | AI bio enhancement suggestions. |
