import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import pino from 'pino';

const logger = pino();

const SYSTEM_INSTRUCTION = `You are SkillPay AI Assistant, the intelligent, friendly, and authoritative AI guide for SkillPay AI — the next-generation autonomous freelance marketplace powered by PayPal Smart Escrow and Gemini AI milestone intelligence.

Your mission is to help clients and freelancers succeed on the platform, resolve questions, explain escrow protections, and guide them through our workflows.

CORE PLATFORM KNOWLEDGE:
1. OVERVIEW:
   - SkillPay AI replaces traditional high-fee, high-dispute platforms with autonomous milestone contracts secured by PayPal Sandbox Smart Escrow and Gemini AI negotiation mediation.
   - Zero dispute risk: Funds are held in non-custodial smart escrow vaults until milestones are inspected and approved by the client.

2. FOR CLIENTS:
   - Post AI Project Scope (/projects/new): Type requirements in natural language. Gemini AI extracts category, estimated budget, timeline, required skills, and complexity.
   - Post Project Need Modal (/customer): Clients can also publish traditional open marketplace briefs directly from their dashboard.
   - Browse Freelancers (/freelancers): Filter top-rated talent, view verified Escrow Pro profiles, send hire requests or invite to Deal Room.
   - Client Dashboard (/customer): Real-time metrics for active projects, pending payments, escrow secured, and action items.
   - PayPal Escrow Checkout (/checkout/:negotiationId): Deposit funds into smart milestone vaults using PayPal Smart Buttons.
   - Order Tracking (/orders/:orderId): Track project timeline: Agreement Signed -> Payment Secured -> Work Started -> Delivery Submitted -> Funds Released.
   - Milestone Approval: Review freelancer deliverables. When satisfied, 1-click release transfers funds directly to the freelancer.

3. FOR FREELANCERS:
   - Freelancer Hub (/freelancer): Real-time metrics (Active Orders, Escrow Locked, Total Earnings), active project tracking, delivery submissions.
   - Incoming Hire Briefs (/freelancer/requests): Review client hire requests, accept proposals, and initiate Deal Room mediation.
   - Profile Builder (/freelancer/profile, /freelancer/onboarding): Configure portfolio, hourly/fixed rates, verified skills, and PayPal payout email.
   - Escrow Order Deliveries: Upload deliverables directly to the order tracking page for client review.
   - Guaranteed Payouts: Once the client approves the milestone, funds are instantly transferred to your PayPal account.

4. AI DEAL ROOM (/deal/:negotiationId):
   - Autonomous negotiation space between client and freelancer.
   - Gemini AI analyzes counter-offers, assesses market rates, and suggests fair compromise terms for milestones and pricing.

5. ESCROW GUARANTEE & POLICIES:
   - 100% non-custodial escrow protection under PayPal Smart Escrow protocols.
   - Transparent 10% platform fee.
   - Funds are never released early without client authorization.
   - Automated dispute mediation ensures fair resolution if scope conflicts occur.

RESPONSE GUIDELINES:
- Be concise, accurate, encouraging, and professional.
- Do NOT use emojis in your responses under any circumstance. Use clean professional text.
- Use markdown formatting with clear bullet points where helpful.
- When suggesting a page or action, include helpful markdown route links:
  * [Post a Project](/projects/new)
  * [Client Dashboard](/customer)
  * [Find Freelancers](/freelancers)
  * [Orders & Escrow](/orders)
  * [Freelancer Workspace](/freelancer)
  * [Incoming Requests](/freelancer/requests)
  * [Profile Builder](/freelancer/profile)
- Keep responses focused on SkillPay AI, escrow, and freelancing best practices.`;

// Intelligent fallback responses if Gemini experiences temporary 503 spikes or network latency
function generateFallbackResponse(userMessage, userRole) {
  const msg = (userMessage || '').toLowerCase();

  // 1. Contacting Professionals / Freelancers / Messaging
  if (
    msg.includes('contact') || 
    msg.includes('professional') || 
    msg.includes('message') || 
    msg.includes('reach out') || 
    msg.includes('talk to') || 
    msg.includes('communicate') ||
    msg.includes('chat with')
  ) {
    return `### How to Contact Verified Professionals
You can easily find, message, and collaborate with top professionals on SkillPay AI:

1. **Browse Talent**: Go to the [Find Freelancers Directory](/freelancers) to filter verified experts by skills, category, and hourly rate.
2. **View Profile**: Click **View Profile** on any freelancer to see their portfolio, verified ratings, and packages.
3. **Send Message or Hire Request**:
   - Click **Message Freelancer** to open direct chat in [Messages](/messages).
   - Click **Hire / Send Request** to invite them directly with your project requirements.
4. **Negotiate in Deal Room**: Coordinate deliverables, milestones, and price securely in the [AI Deal Room](/deal-room).
5. **Secure Escrow**: Once agreed, fund milestones through PayPal Smart Escrow. Funds remain protected until you inspect deliverables!`;
  }

  // 2. Escrow & Payment Safety
  if (msg.includes('escrow') || msg.includes('safe') || msg.includes('protect') || msg.includes('guarantee')) {
    return `### PayPal Smart Escrow Protection
SkillPay AI uses a **100% non-custodial milestone escrow vault**:
1. **Deposit**: When a deal is signed, the client funds the project milestone through [PayPal Smart Checkout](/checkout/demo).
2. **Lock**: Funds are safely locked in the PayPal Smart Escrow sandbox — neither party can lose funds in transit.
3. **Delivery**: The freelancer completes the work and submits deliverables.
4. **Approval & Release**: Once the client reviews and approves, funds are instantly transferred to the freelancer's PayPal account.

Track active contracts anytime on the [Orders & Escrow Page](/orders).`;
  }

  // 3. Post a Project / Client Workflow
  if (msg.includes('post') || msg.includes('client') || msg.includes('hire') || msg.includes('create project') || msg.includes('need') || msg.includes('brief')) {
    return `### How to Post a Project as a Client
You have two simple ways to get work done:
1. **AI Scope Studio**: Visit [Post a Project](/projects/new), describe your idea in plain English, and our Gemini AI extracts the budget, skills, and complexity automatically.
2. **Direct Project Need**: Open your [Client Dashboard](/customer) and click **Post Project Need** to publish an open marketplace brief immediately with custom category and budget pills.
3. **Browse Top Talent**: Search and invite verified freelancers on our [Freelancers Directory](/freelancers).`;
  }

  // 4. Freelancer Payouts & Earnings
  if (msg.includes('freelancer') || msg.includes('paid') || msg.includes('earn') || msg.includes('payout') || msg.includes('deliver')) {
    return `### Freelancer Workflow & Payouts
Here is how freelancers work and get paid on SkillPay AI:
1. **Setup Your Profile**: Set your rates, skills, and PayPal payout email in the [Profile Builder](/freelancer/profile).
2. **Receive Hire Requests**: Review and accept incoming requests on [Incoming Hire Briefs](/freelancer/requests).
3. **Milestone Delivery**: When milestones are completed, submit deliverables on the [Freelancer Hub](/freelancer).
4. **Instant Release**: As soon as the client approves the work, funds are credited directly to your PayPal account.`;
  }

  // 5. Deal Room & Negotiation
  if (msg.includes('deal room') || msg.includes('negotiate') || msg.includes('contract') || msg.includes('terms')) {
    return `### Gemini AI Deal Room
The **AI Deal Room** is our autonomous negotiation environment:
- Clients and freelancers propose budget, milestones, and deadlines.
- Gemini AI mediates counter-offers in real-time and recommends balanced compromises based on market standards.
- Once both parties agree, a PayPal Smart Escrow order is automatically generated.`;
  }

  // 6. Fees & Pricing
  if (msg.includes('fee') || msg.includes('cost') || msg.includes('price') || msg.includes('charge')) {
    return `### Transparent Fee Structure
- **Platform Fee**: Flat 10% platform fee on completed escrow milestones.
- **Escrow Guarantee**: 100% dispute protection with PayPal Sandbox Smart Buttons.
- **Zero Hidden Costs**: No subscription fees or withdrawal penalties.

View your project calculations during checkout or on your [Dashboard](/dashboard).`;
  }

  // 7. Orders & Tracking
  if (msg.includes('order') || msg.includes('tracking') || msg.includes('status')) {
    return `### Escrow Order Tracking
Every project has a live milestone timeline on the [Orders Page](/orders):
- **Agreement Signed**: Terms confirmed by both parties.
- **Payment Secured**: Funds deposited into the PayPal Escrow Vault.
- **In Progress**: Freelancer actively working on deliverables.
- **Delivered**: Work submitted for client review.
- **Completed**: Client approves, and funds disburse automatically.`;
  }

  // Default general assistant response
  return `### Welcome to SkillPay AI Assistant
I am here to assist you with every aspect of the platform:

- **Contact Talent**: Browse verified experts on [Find Freelancers](/freelancers) and click **Message Freelancer** or **Hire**.
- **For Clients**: [Post an AI Project](/projects/new) or view your [Client Dashboard](/customer).
- **For Freelancers**: Manage active milestones on the [Freelancer Workspace](/freelancer) or update your [Profile](/freelancer/profile).
- **Escrow & Orders**: Check your live contracts on [Orders & Escrow](/orders).

Feel free to ask me anything about how PayPal Smart Escrow works, project posting, or milestone releases.`;
}

export const chatWithAssistant = async ({ message, history = [], userRole = 'customer', userName = 'User' }) => {
  const apiKey = env.AI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    logger.warn('AI_API_KEY not configured, using smart knowledge base assistant.');
    return {
      reply: generateFallbackResponse(message, userRole),
      source: 'knowledge_base'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = env.AI_MODEL || 'gemini-1.5-flash';
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800,
      }
    });

    // Format previous turns for context
    const chatHistory = (history || []).slice(-6).map(h => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const chat = model.startChat({
      history: chatHistory
    });

    const userPrompt = `User Name: ${userName} (Role: ${userRole || 'visitor'})\nQuestion: ${message}`;
    
    // Timeout of 8 seconds to ensure swift response
    const result = await Promise.race([
      chat.sendMessage(userPrompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API Timeout')), 8000))
    ]);

    const replyText = result.response.text();
    return {
      reply: replyText,
      source: 'gemini'
    };

  } catch (error) {
    logger.warn({ error: error.message }, 'Gemini assistant fell back to knowledge base');
    return {
      reply: generateFallbackResponse(message, userRole),
      source: 'knowledge_base',
      notice: error.message
    };
  }
};

