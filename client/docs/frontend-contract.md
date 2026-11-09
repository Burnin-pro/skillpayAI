# SkillPay AI - Frontend / Backend API Contract

This document defines the mock API layer (`src/services/api.js`) which must be implemented by the backend.

## Base URL
`/api/v1`

## Authentication
Currently mocked via localStorage. Expect JWT in `Authorization: Bearer <token>` for all protected routes.

---

### `GET /auth/me`
Returns the current user profile.
**Response (200 OK):**
```json
{
  "id": "u123",
  "name": "Demo Customer",
  "role": "customer", // or "provider", "admin"
  "email": "customer@skillpay.demo"
}
```

---

### `POST /ai/analyze`
Extracts structured parameters from a natural language request.
**Request:**
```json
{
  "text": "I need a responsive restaurant website..."
}
```
**Response (200 OK):**
```json
{
  "category": "Web Development",
  "skills": ["HTML", "CSS", "JavaScript"],
  "budget": 100,
  "deadlineDays": 4,
  "complexity": "medium",
  "confidence": 95
}
```

---

### `POST /ai/match`
Returns a scored list of providers for the given requirements.
**Request:**
```json
{
  "jobRequirement": {
    "budget": 100,
    "deadlineDays": 4,
    "complexity": "medium",
    "skills": ["HTML", "CSS", "JavaScript"]
  }
}
```
**Response (200 OK):**
```json
[
  {
    "id": "p1",
    "name": "Muthu",
    "avatar": "url",
    "rating": 4.9,
    "hourlyRate": 35,
    "score": 94,
    "breakdown": {
      "skill": 40,
      "budget": 20,
      "deadline": 15,
      "rating": 10,
      "experience": 4,
      "availability": 5
    },
    "rationale": "Perfect skill alignment."
  }
]
```

---

### `POST /ai/price`
Calculates a fair market price for the job.
**Request:** Same as `/ai/match`.
**Response (200 OK):**
```json
{
  "recommendedPrice": 85,
  "range": [80, 120],
  "reasons": ["Medium complexity implies ~10 hours of work."]
}
```

---

### `POST /negotiations`
Initializes a new deal room.
**Request:**
```json
{
  "jobId": "job123",
  "providerId": "p1",
  "initialOffer": {
    "price": 70,
    "delivery": 4,
    "revisions": 1
  }
}
```

---

### `POST /orders`
Creates the final agreed order (Proposal accepted).
**Request:**
```json
{
  "negotiationId": "neg123",
  "agreedPrice": 85,
  "deliveryDays": 3,
  "revisions": 2
}
```
**Response (200 OK):**
```json
{
  "orderId": "ORD-12345",
  "status": "pending_payment"
}
```

---

### `POST /paypal/create-order`
Creates a PayPal order.
**Request:**
```json
{
  "orderId": "ORD-12345",
  "amount": 89.25
}
```

### `POST /paypal/capture-order`
Captures the funds into escrow after PayPal approval.
**Request:**
```json
{
  "paypalOrderId": "PAYPAL_ID"
}
```

## Status Enums
- **Job Status:** `open`, `negotiating`, `agreed`, `closed`
- **Negotiation Status:** `active`, `agreed`, `cancelled`
- **Order Status:** `pending_payment`, `in_progress`, `delivered`, `revision_requested`, `completed`, `cancelled`
- **Payment Status:** `idle`, `creating`, `awaiting`, `capturing`, `success`, `failed`
