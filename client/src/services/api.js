import { MOCK_PROVIDERS, DEMO_REQUEST } from './mockData';
import { calculateMatchScore } from '../utils/matching';
import { apiClient } from './apiClient';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- Auth ---
  getMe: async () => {
    if (!isMock) return apiClient.get('/auth/me');
    await delay(500);
    const userJson = localStorage.getItem('skillpay_user');
    return userJson ? JSON.parse(userJson) : null;
  },
  loginDemo: async (role) => {
    await delay(500);
    const user = {
      id: role === 'provider' ? 'u_provider' : `u_${role}`,
      name: role === 'provider' ? 'Muthu Kumar' : `Demo ${role}`,
      role
    };
    localStorage.setItem('skillpay_user', JSON.stringify(user));
    localStorage.setItem('skillpay_user_role', role);
    return user;
  },
  logout: async () => {
    await delay(300);
    localStorage.removeItem('skillpay_user');
  },

  // --- Providers / Freelancers ---
  getProviders: async (params = {}) => {
    if (!isMock) {
      const qs = new URLSearchParams(params).toString();
      return apiClient.get(`/providers${qs ? '?' + qs : ''}`);
    }
    await delay(400);
    let list = [...MOCK_PROVIDERS];
    if (params.publishedOnly !== false) {
      list = list.filter(p => p.published !== false);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.headline && p.headline.toLowerCase().includes(q)) ||
        (p.skills && p.skills.some(s => s.toLowerCase().includes(q)))
      );
    }
    return list;
  },

  getProviderById: async (id) => {
    try {
      if (!isMock) {
        const res = await apiClient.get(`/providers/${id}`);
        if (res && (res.id || res.name)) return res;
      }
    } catch (e) {
      console.debug("Backend provider fetch notice, using verified profile fallback:", e?.message);
    }

    // 1. Check local saved provider profiles and logged-in user
    try {
      const u = JSON.parse(localStorage.getItem('skillpay_user') || 'null');
      const myUid = u?.uid || u?.id;
      const isMe = id === myUid || id === 'provider_muthu' || id === 'me';
      
      const saved = localStorage.getItem(`skillpay_provider_profile_${id}`) || 
                    localStorage.getItem('skillpay_provider_profile') ||
                    (isMe ? localStorage.getItem('skillpay_provider_profile_provider_muthu') : null);

      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          id: id || parsed.id || 'provider_muthu',
          name: (isMe && u?.name) ? u.name : parsed.name,
          photoURL: (isMe && (u?.photoURL || u?.avatar)) ? (u.photoURL || u.avatar) : parsed.photoURL,
          avatar: (isMe && (u?.photoURL || u?.avatar)) ? (u.photoURL || u.avatar) : parsed.avatar,
          published: true
        };
      }

      if (isMe && u) {
        const effectivePhoto = u.photoURL || u.avatar || localStorage.getItem('skillpay_user_photo_' + myUid) || localStorage.getItem('skillpay_user_photo_global') || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=faces';
        return {
          id: id || myUid || 'provider_muthu',
          name: u.name || 'Muthuvelpandiyan',
          headline: u.headline || 'Full-Stack Developer & UI Engineer',
          bio: u.bio || 'Full-Stack Developer and technical consultant specializing in React, Node.js, TailwindCSS, TypeScript with verified PayPal Smart Escrow milestone delivery.',
          location: u.location || 'Remote (Global)',
          photoURL: effectivePhoto,
          avatar: effectivePhoto,
          skills: u.skillNames || ['React', 'Node.js', 'TailwindCSS', 'TypeScript', 'PayPal Escrow API'],
          skillNames: u.skillNames || ['React', 'Node.js', 'TailwindCSS', 'TypeScript', 'PayPal Escrow API'],
          basePriceCents: u.basePriceCents || 11000,
          hourlyRateCents: u.hourlyRateCents || 4500,
          experienceYears: u.experienceYears || 5,
          completedProjects: u.completedProjects || 0,
          rating: 5.0,
          availability: u.availability || 'available',
          paypalEmail: u.paypalEmail || 'sb-a47yah53090787@business.example.com',
          published: true
        };
      }
    } catch (e) {
      console.warn("Local profile resolution warning:", e);
    }

    return null;
  },

  updateMyProviderProfile: async (data) => {
    if (!isMock) return apiClient.put('/providers/me', data);
    await delay(500);
    const existing = JSON.parse(localStorage.getItem('skillpay_user') || '{}');
    const merged = { ...existing, ...data };
    localStorage.setItem('skillpay_user', JSON.stringify(merged));
    return merged;
  },

  publishMyProviderProfile: async (publish = true) => {
    if (!isMock) return apiClient.post('/providers/me/publish', { publish });
    await delay(400);
    const existing = JSON.parse(localStorage.getItem('skillpay_user') || '{}');
    existing.published = publish;
    localStorage.setItem('skillpay_user', JSON.stringify(existing));
    return existing;
  },

  // --- Hire Requests ---
  createHireRequest: async (data) => {
    if (!isMock) return apiClient.post('/hire-requests', data);
    await delay(600);
    const mockRequest = {
      id: `hr_${Date.now()}`,
      ...data,
      status: 'pending',
      aiMatchScore: 94,
      createdAt: new Date().toISOString()
    };
    const saved = JSON.parse(localStorage.getItem('skillpay_mock_requests') || '[]');
    saved.unshift(mockRequest);
    localStorage.setItem('skillpay_mock_requests', JSON.stringify(saved));

    // Automatically create or link the conversation for this specific freelancer
    try {
      const customerId = data.customerId || 'cust';
      const providerId = data.providerId || 'prov';
      const convId = `conv_${customerId}_${providerId}`;
      const convs = JSON.parse(localStorage.getItem('skillpay_conversations') || '[]');
      const existingIdx = convs.findIndex(c => c.id === convId || (c.customerId === customerId && c.providerId === providerId));

      const convObj = {
        id: existingIdx >= 0 ? convs[existingIdx].id : convId,
        title: `Hire Request: ${data.title || 'Project'}`,
        participantIds: [customerId, providerId],
        customerId: customerId,
        customerName: data.customerName || 'Client',
        customerEmail: data.customerEmail || '',
        providerId: providerId,
        providerName: data.providerName || 'Freelancer',
        hireRequestId: mockRequest.id,
        lastMessage: data.message || `Sent hire request: ${data.title}`,
        lastMessageAt: new Date().toISOString(),
        unreadBy: { [providerId]: 1, [customerId]: 0 }
      };

      if (existingIdx >= 0) {
        convs[existingIdx] = { ...convs[existingIdx], ...convObj };
      } else {
        convs.unshift(convObj);
      }
      localStorage.setItem('skillpay_conversations', JSON.stringify(convs));

      // Append introductory message to that specific conversation
      if (data.message) {
        const msgKey = `skillpay_messages_${convObj.id}`;
        const existingMsgs = JSON.parse(localStorage.getItem(msgKey) || '[]');
        existingMsgs.push({
          id: `msg_${Date.now()}`,
          conversationId: convObj.id,
          senderId: customerId,
          senderName: data.customerName || 'Client',
          senderRole: 'customer',
          body: data.message,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(msgKey, JSON.stringify(existingMsgs));
      }
    } catch (e) {
      console.warn("Auto-create conversation notice:", e);
    }

    return mockRequest;
  },

  getHireRequests: async (providedUser = null) => {
    try {
      const backendRequests = await apiClient.get('/hire-requests');
      if (Array.isArray(backendRequests)) return backendRequests;
    } catch (e) {
      console.debug("Backend hire requests fetch note:", e?.message);
    }
    const u = providedUser || (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_user') || 'null'); } catch { return null; }
    })();
    const saved = JSON.parse(localStorage.getItem('skillpay_hire_requests') || localStorage.getItem('skillpay_mock_requests') || '[]');
    if (!u) return saved;

    const myUid = u.uid || u.id;
    return saved.filter(req => {
      if (!req) return false;
      if (u.role === 'provider') {
        const isMyProv = Boolean(myUid && req.providerId === myUid);
        const isMyProvLegacy = Boolean(u.id && req.providerId === u.id);
        const isMyProvEmail = Boolean(u.email && req.providerEmail && req.providerEmail.toLowerCase() === u.email.toLowerCase());
        return isMyProv || isMyProvLegacy || isMyProvEmail;
      } else {
        const isMyCust = Boolean(myUid && req.customerId === myUid);
        const isMyCustLegacy = Boolean(u.id && req.customerId === u.id);
        const isMyEmail = Boolean(u.email && req.customerEmail && req.customerEmail.toLowerCase() === u.email.toLowerCase());
        return isMyCust || isMyCustLegacy || isMyEmail;
      }
    });
  },

  getHireRequestById: async (id) => {
    if (!isMock) return apiClient.get(`/hire-requests/${id}`);
    await delay(300);
    const list = await api.getHireRequests();
    return list.find(r => r.id === id) || null;
  },

  acceptHireRequest: async (id) => {
    try {
      const res = await apiClient.post(`/hire-requests/${id}/accept`);
      if (res) return res;
    } catch (e) {
      console.debug("Backend accept hire request note:", e?.message);
    }
    const saved = JSON.parse(localStorage.getItem('skillpay_hire_requests') || localStorage.getItem('skillpay_mock_requests') || '[]');
    const updated = saved.map(r => r.id === id ? { ...r, status: 'accepted' } : r);
    localStorage.setItem('skillpay_hire_requests', JSON.stringify(updated));
    return {
      hireRequest: { id, status: 'accepted', negotiationId: id },
      negotiation: { id, jobId: id }
    };
  },

  declineHireRequest: async (id, reason = '') => {
    try {
      const res = await apiClient.post(`/hire-requests/${id}/decline`, { reason });
      if (res) return res;
    } catch (e) {
      console.debug("Backend decline note:", e?.message);
    }
    const saved = JSON.parse(localStorage.getItem('skillpay_hire_requests') || localStorage.getItem('skillpay_mock_requests') || '[]');
    const updated = saved.map(r => r.id === id ? { ...r, status: 'declined', reason } : r);
    localStorage.setItem('skillpay_hire_requests', JSON.stringify(updated));
    return { id, status: 'declined', reason };
  },

  withdrawHireRequest: async (id) => {
    try {
      const res = await apiClient.post(`/hire-requests/${id}/withdraw`);
      if (res) return res;
    } catch (e) {
      console.debug("Backend withdraw note:", e?.message);
    }
    const saved = JSON.parse(localStorage.getItem('skillpay_hire_requests') || localStorage.getItem('skillpay_mock_requests') || '[]');
    const updated = saved.map(r => r.id === id ? { ...r, status: 'withdrawn' } : r);
    localStorage.setItem('skillpay_hire_requests', JSON.stringify(updated));
    return { id, status: 'withdrawn' };
  },

  // --- Conversations & Messages ---
  startOrGetConversation: async ({ providerId, providerName, customerId, customerName, customerEmail, initialMessage }) => {
    const convId = `conv_${customerId}_${providerId}`;
    const stored = (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_conversations') || '[]'); } catch { return []; }
    })();

    let found = stored.find(c => c.id === convId || (c.customerId === customerId && c.providerId === providerId));
    if (!found) {
      found = {
        id: convId,
        title: `Discussion with ${providerName}`,
        participantIds: [customerId, providerId],
        customerId,
        customerName: customerName || 'Client',
        customerEmail: customerEmail || '',
        providerId,
        providerName: providerName || 'Freelancer',
        lastMessage: initialMessage || 'Started conversation',
        lastMessageAt: new Date().toISOString(),
        unreadBy: { [providerId]: 0, [customerId]: 0 }
      };
      const updated = [found, ...stored];
      localStorage.setItem('skillpay_conversations', JSON.stringify(updated));

      if (initialMessage) {
        const msgKey = `skillpay_messages_${convId}`;
        const msgs = [{
          id: `msg_${Date.now()}`,
          conversationId: convId,
          senderId: customerId,
          senderName: customerName || 'Client',
          senderRole: 'customer',
          body: initialMessage,
          createdAt: new Date().toISOString()
        }];
        localStorage.setItem(msgKey, JSON.stringify(msgs));
      }
    }
    return found;
  },

  getConversations: async (providedUser = null) => {
    const u = providedUser || (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_user') || 'null'); } catch { return null; }
    })();

    if (!u) return [];

    let apiList = [];
    if (!isMock) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1200));
        const res = await Promise.race([apiClient.get('/conversations'), timeoutPromise]);
        if (Array.isArray(res) && res.length > 0) apiList = res;
      } catch (e) {
        console.debug("Backend conversations fetch notice:", e?.message);
      }
    }

    const stored = (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_conversations') || '[]'); } catch { return []; }
    })();

    let combined = [...stored];
    apiList.forEach(ac => {
      if (!combined.some(c => c.id === ac.id)) combined.unshift(ac);
    });

    const isDemoClient = u.id === 'u_customer' || u.email === 'demo-customer@skillpay.demo' || u.email === 'customer@skillpay.demo';
    const isDemoMuthu = u.id === 'u_provider' || u.id === 'provider_muthu' || u.email === 'demo-provider@skillpay.demo' || u.name === 'Muthu Kumar';

    // Only inject demo conversation for the seeded demo accounts
    if ((isDemoClient || isDemoMuthu) && !combined.some(c => c.id === 'conv_restaurant_demo')) {
      const defaultDemoConv = {
        id: 'conv_restaurant_demo',
        title: 'Responsive Restaurant Website & Escrow',
        participantIds: ['u_customer', 'u_provider', 'provider_muthu', 'demo-customer@skillpay.demo'],
        customerId: 'u_customer',
        customerEmail: 'demo-customer@skillpay.demo',
        providerId: 'provider_muthu',
        customerName: 'Alex (Client)',
        providerName: 'Muthu Kumar (Freelancer)',
        hireRequestId: 'hr_restaurant_demo',
        lastMessage: 'Looking forward to discussing the project with you and finalizing milestones!',
        lastMessageAt: new Date().toISOString(),
        unreadBy: { u_provider: 1, u_customer: 0 }
      };
      combined.unshift(defaultDemoConv);
      localStorage.setItem('skillpay_conversations', JSON.stringify(combined));
    }

    // Auto-recover any orphaned proposal conversations from briefs or messages into combined
    try {
      const briefs = JSON.parse(localStorage.getItem('skillpay_market_briefs') || '[]');
      briefs.forEach(b => {
        if (Array.isArray(b.proposals) && b.proposals.length > 0) {
          b.proposals.forEach(p => {
            const cId = p.conversationId || `conv_brief_${b.id}_${p.providerId}`;
            if (!combined.some(c => c.id === cId)) {
              const recoveredConv = {
                id: cId,
                briefId: b.id,
                title: `Proposal: ${b.title}`,
                participantIds: [b.clientId, p.providerId, b.clientEmail, p.providerEmail].filter(Boolean),
                providerId: p.providerId,
                providerName: p.providerName || 'Freelancer',
                providerEmail: p.providerEmail || '',
                customerId: b.clientId || 'client',
                customerName: b.clientName || 'Client',
                customerEmail: b.clientEmail || '',
                proposalPrice: p.price,
                proposalDays: p.days,
                lastMessage: p.message ? `[PROPOSAL for "${b.title}"]: $${p.price} USD in ${p.days} days. ${p.message}` : 'Proposal sent',
                lastMessageAt: p.createdAt || new Date().toISOString(),
                unreadBy: { [b.clientId || 'client']: 1, [p.providerId]: 0 },
                status: 'active'
              };
              combined.unshift(recoveredConv);
            }
          });
        }
      });

      // Also recover any skillpay_messages_brief_* or skillpay_messages_conv_* that has messages
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('skillpay_messages_brief_') || key.startsWith('skillpay_messages_conv_'))) {
          const cId = key.replace('skillpay_messages_', '');
          if (!combined.some(c => c.id === cId)) {
            const msgs = JSON.parse(localStorage.getItem(key) || '[]');
            if (msgs.length > 0) {
              const briefMatch = briefs.find(b => cId.includes(b.id));
              const firstMsg = msgs[0];
              const pId = (firstMsg.senderRole === 'provider' ? firstMsg.senderId : null) || u?.uid || u?.id || 'provider';
              const pName = (firstMsg.senderRole === 'provider' ? firstMsg.senderName : null) || u?.name || 'Freelancer';
              const cIdVal = briefMatch?.clientId || (firstMsg.senderRole === 'customer' ? firstMsg.senderId : 'client');
              const cNameVal = briefMatch?.clientName || (firstMsg.senderRole === 'customer' ? firstMsg.senderName : 'Client');
              const recovered = {
                id: cId,
                briefId: briefMatch?.id || 'brief',
                title: briefMatch ? `Proposal: ${briefMatch.title}` : 'Marketplace Proposal',
                participantIds: [cIdVal, pId, briefMatch?.clientEmail, u?.email].filter(Boolean),
                providerId: pId,
                providerName: pName,
                providerEmail: u?.email || '',
                customerId: cIdVal,
                customerName: cNameVal,
                customerEmail: briefMatch?.clientEmail || '',
                lastMessage: msgs[msgs.length - 1].body,
                lastMessageAt: msgs[msgs.length - 1].createdAt || new Date().toISOString(),
                unreadBy: { [cIdVal]: 1, [pId]: 0 },
                status: 'active'
              };
              combined.unshift(recovered);
            }
          }
        }
      }
      localStorage.setItem('skillpay_conversations', JSON.stringify(combined));
    } catch (e) {
      console.warn("Proposal recovery warning:", e);
    }

    // STRICT USER SCOPING
    const myUid = u.uid || u.id;
    const myEmail = u.email;

    const filtered = combined.filter(conv => {
      if (!conv) return false;
      if (u.role === 'provider') {
        const isMyProviderId = Boolean(myUid && conv.providerId === myUid);
        const isMyProviderLegacy = Boolean(u.id && conv.providerId === u.id);
        const isMyName = Boolean(u.name && conv.providerName && conv.providerName.toLowerCase().includes(u.name.toLowerCase()));
        const isMyParticipant = Boolean(myUid && Array.isArray(conv.participantIds) && conv.participantIds.includes(myUid));
        const isMyEmail = Boolean(myEmail && conv.providerEmail && conv.providerEmail.toLowerCase() === myEmail.toLowerCase());
        const isMyParticipantEmail = Boolean(myEmail && Array.isArray(conv.participantIds) && conv.participantIds.includes(myEmail));
        const isDemoMatch = Boolean(isDemoMuthu && (conv.providerId === 'u_provider' || conv.providerId === 'provider_muthu'));
        return isMyProviderId || isMyProviderLegacy || isMyName || isMyParticipant || isMyEmail || isMyParticipantEmail || isDemoMatch;
      } else {
        const isMyCustomerId = Boolean(myUid && conv.customerId === myUid);
        const isMyCustomerLegacy = Boolean(u.id && conv.customerId === u.id);
        const isMyEmail = Boolean(myEmail && conv.customerEmail && conv.customerEmail.toLowerCase() === myEmail.toLowerCase());
        const isMyParticipant = Boolean(
          (myUid && Array.isArray(conv.participantIds) && conv.participantIds.includes(myUid)) ||
          (myEmail && Array.isArray(conv.participantIds) && conv.participantIds.includes(myEmail))
        );
        const isMyName = Boolean(u.name && conv.customerName && conv.customerName.toLowerCase().includes(u.name.toLowerCase()));
        const isDemoMatch = Boolean(isDemoClient && (conv.customerId === 'u_customer' || conv.customerEmail === 'demo-customer@skillpay.demo'));
        return isMyCustomerId || isMyCustomerLegacy || isMyEmail || isMyName || isMyParticipant || isDemoMatch;
      }
    });

    return filtered;
  },

  getMessages: async (conversationId) => {
    let apiMsgs = [];
    if (!isMock) {
      try {
        const res = await apiClient.get(`/conversations/${conversationId}/messages`);
        if (Array.isArray(res) && res.length > 0) apiMsgs = res;
      } catch (e) {
        console.debug("Backend messages fetch notice:", e?.message);
      }
    }

    const storageKey = `skillpay_messages_${conversationId}`;
    const stored = (() => {
      try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
    })();

    if (apiMsgs.length > 0) return apiMsgs;
    if (stored.length > 0) return stored;

    // ONLY seeded demo conversation gets default messages
    if (conversationId === 'conv_restaurant_demo') {
      const initialMessages = [
        {
          id: 'msg_1',
          conversationId,
          senderId: 'u_customer',
          senderName: 'Alex (Client)',
          senderRole: 'customer',
          body: 'Hi Muthu, I sent you a hire request for our Italian restaurant site. We have our brand assets and menu ready.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'msg_2',
          conversationId,
          senderId: 'u_customer',
          senderName: 'Alex (Client)',
          senderRole: 'customer',
          body: 'Looking forward to discussing the project with you and finalizing milestones!',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(initialMessages));
      return initialMessages;
    }

    return [];
  },

  sendMessage: async (conversationId, body) => {
    const storedUser = (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_user') || '{}'); } catch { return {}; }
    })();
    const isProvider = storedUser?.role === 'provider';
    const myUid = storedUser?.uid || storedUser?.id || (isProvider ? 'u_provider' : 'u_customer');
    const myName = storedUser?.name || (isProvider ? 'Freelancer' : 'Client');

    const newMsg = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: myUid,
      senderName: myName,
      senderRole: isProvider ? 'provider' : 'customer',
      body,
      createdAt: new Date().toISOString()
    };

    const storageKey = `skillpay_messages_${conversationId}`;
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updated = [...existing, newMsg];
      localStorage.setItem(storageKey, JSON.stringify(updated));

      // Update conversation preview or create fallback conversation if not yet present
      const convs = JSON.parse(localStorage.getItem('skillpay_conversations') || '[]');
      const convIndex = convs.findIndex(c => c.id === conversationId);
      if (convIndex >= 0) {
        convs[convIndex] = {
          ...convs[convIndex],
          lastMessage: body,
          lastMessageAt: newMsg.createdAt
        };
      } else {
        convs.unshift({
          id: conversationId,
          title: 'Direct Chat',
          participantIds: [myUid],
          providerId: isProvider ? myUid : 'u_provider',
          customerId: !isProvider ? myUid : 'u_customer',
          providerName: isProvider ? myName : 'Freelancer',
          customerName: !isProvider ? myName : 'Client',
          lastMessage: body,
          lastMessageAt: newMsg.createdAt,
          unreadBy: {}
        });
      }
      localStorage.setItem('skillpay_conversations', JSON.stringify(convs));
    } catch (e) {
      console.warn("Storage sync warning:", e);
    }

    if (!isMock) {
      try {
        await apiClient.post(`/conversations/${conversationId}/messages`, { body });
      } catch (e) {
        console.debug("Backend message delivery:", e?.message);
      }
    }

    return newMsg;
  },

  deleteConversation: async (conversationId) => {
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_conversations') || '[]');
      const updated = stored.filter(c => c.id !== conversationId);
      localStorage.setItem('skillpay_conversations', JSON.stringify(updated));
      localStorage.removeItem(`skillpay_messages_${conversationId}`);
      if (!isMock) {
        await apiClient.delete(`/conversations/${conversationId}`).catch(() => {});
      }
      return { success: true, id: conversationId };
    } catch (e) {
      console.warn("Delete conversation error:", e);
      return { success: true, id: conversationId };
    }
  },

  // --- Orders (Real Data with Strict User Scoping) ---
  getLocalOrders: (providedUser = null) => {
    const u = providedUser || (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_user') || 'null'); } catch { return null; }
    })();

    if (!u) return [];

    const stored = (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_orders') || '[]'); } catch { return []; }
    })();

    const isDemoClient = u.id === 'u_customer' || u.email === 'demo-customer@skillpay.demo' || u.email === 'customer@skillpay.demo';
    const isDemoMuthu = u.id === 'u_provider' || u.id === 'provider_muthu' || u.email === 'demo-provider@skillpay.demo' || u.name === 'Muthu Kumar';

    const myUid = u.uid || u.id;
    const myEmail = u.email;

    return stored.filter(order => {
      if (!order) return false;
      if (u.role === 'admin') return true;
      if (u.role === 'provider') {
        const isMyProviderId = Boolean(myUid && order.providerId === myUid);
        const isMyProviderLegacy = Boolean(u.id && order.providerId === u.id);
        const isMyName = Boolean(u.name && order.providerName && order.providerName.toLowerCase().includes(u.name.toLowerCase()));
        const isDemoMatch = Boolean(isDemoMuthu && (order.providerId === 'provider_muthu' || order.providerId === 'u_provider'));
        return isMyProviderId || isMyProviderLegacy || isMyName || isDemoMatch;
      } else {
        const isMyCustomerId = Boolean(myUid && order.customerId === myUid);
        const isMyCustomerLegacy = Boolean(u.id && order.customerId === u.id);
        const isMyEmail = Boolean(myEmail && order.customerEmail && order.customerEmail.toLowerCase() === myEmail.toLowerCase());
        const isDemoMatch = Boolean(isDemoClient && (order.customerId === 'u_customer' || order.customerEmail === 'demo-customer@skillpay.demo'));
        return isMyCustomerId || isMyCustomerLegacy || isMyEmail || isDemoMatch;
      }
    });
  },

  getOrders: async (providedUser = null) => {
    const u = providedUser || (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_user') || 'null'); } catch { return null; }
    })();

    if (!u) return [];

    let backendOrders = [];
    if (!isMock) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1200));
        const res = await Promise.race([apiClient.get('/orders'), timeoutPromise]);
        if (Array.isArray(res) && res.length > 0) backendOrders = res;
      } catch (e) {
        console.debug("Backend orders fetch notice:", e?.message);
      }
    }

    const stored = (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_orders') || '[]'); } catch { return []; }
    })();

    const list = [...stored];
    backendOrders.forEach(bo => {
      if (!list.some(o => o.id === bo.id)) list.push(bo);
    });

    // STRICT USER SCOPING:
    const myUid = u.uid || u.id;
    const myEmail = u.email;

    const filtered = list.filter(order => {
      if (!order) return false;
      if (u.role === 'admin') return true;
      if (u.role === 'provider') {
        const isMyProviderId = Boolean(myUid && order.providerId === myUid);
        const isMyProviderLegacy = Boolean(u.id && order.providerId === u.id);
        const isMyName = Boolean(u.name && order.providerName && order.providerName.toLowerCase().includes(u.name.toLowerCase()));
        const isDemoMatch = Boolean(isDemoMuthu && (order.providerId === 'provider_muthu' || order.providerId === 'u_provider'));
        return isMyProviderId || isMyProviderLegacy || isMyName || isDemoMatch;
      } else {
        const isMyCustomerId = Boolean(myUid && order.customerId === myUid);
        const isMyCustomerLegacy = Boolean(u.id && order.customerId === u.id);
        const isMyEmail = Boolean(myEmail && order.customerEmail && order.customerEmail.toLowerCase() === myEmail.toLowerCase());
        const isDemoMatch = Boolean(isDemoClient && (order.customerId === 'u_customer' || order.customerEmail === 'demo-customer@skillpay.demo'));
        return isMyCustomerId || isMyCustomerLegacy || isMyEmail || isDemoMatch;
      }
    });

    return filtered;
  },

  getOrderById: async (orderId, providedUser = null) => {
    const list = await api.getOrders(providedUser);
    if (!orderId) return list[0] || null;
    const cleanId = orderId.replace(/^ORD-/, '');
    const found = list.find(o => o.id === orderId || o.id === `ORD-${cleanId}` || o.id === cleanId);
    return found || null;
  },

  // --- Client Project Needs (Traditional Marketplace Briefs) ---
  getMarketProjectNeeds: async () => {
    const stored = (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_market_briefs') || '[]'); } catch { return []; }
    })();

    const defaultBriefs = [
      {
        id: 'brief_italian_bistro',
        title: 'Responsive Restaurant Website with Table Booking & PayPal Escrow',
        clientName: 'Alex G.',
        clientRole: 'Verified Client (5 Orders)',
        category: 'Web Development',
        budgetUSD: 85,
        deadlineDays: 3,
        skills: ['React', 'TailwindCSS', 'Node.js'],
        description: 'Need a fast, mobile-friendly landing page for our boutique Italian eatery with interactive menu, online table reservation, and PayPal Smart Escrow integration.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop',
        postedAt: 'Today',
        proposalsCount: 2,
        status: 'open',
        verifiedEscrow: true
      },
      {
        id: 'brief_saas_metrics',
        title: 'Modern Analytics Dashboard & Client Portal Redesign',
        clientName: 'David K.',
        clientRole: 'Verified Enterprise Client',
        category: 'UI/UX Design & Frontend',
        budgetUSD: 160,
        deadlineDays: 5,
        skills: ['React', 'TypeScript', 'TailwindCSS'],
        description: 'Looking for a skilled frontend engineer to revamp our SaaS analytics UI with real-time charts, dark mode, and sleek glassmorphism cards.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop',
        postedAt: '1 day ago',
        proposalsCount: 4,
        status: 'open',
        verifiedEscrow: true
      },
      {
        id: 'brief_ecommerce_gateway',
        title: 'E-commerce Checkout Optimization with PayPal Sandbox',
        clientName: 'Sophia M.',
        clientRole: 'Verified Store Owner',
        category: 'Full-Stack Development',
        budgetUSD: 120,
        deadlineDays: 4,
        skills: ['JavaScript', 'Node.js', 'API Integration'],
        description: 'Streamline our multi-step checkout flow, integrate PayPal Smart Buttons, and implement auto-milestone escrow releases.',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&h=350&fit=crop',
        postedAt: '2 days ago',
        proposalsCount: 3,
        status: 'open',
        verifiedEscrow: true
      }
    ];

    if (stored.length === 0) {
      localStorage.setItem('skillpay_market_briefs', JSON.stringify(defaultBriefs));
      return defaultBriefs.filter(b => b.status !== 'assigned' && !b.assignedProviderId);
    }

    const combined = [...stored];
    defaultBriefs.forEach(db => {
      if (!combined.some(c => c.id === db.id)) combined.push(db);
    });
    // Filter out assigned briefs so assigned projects are automatically hidden from the marketplace!
    return combined.filter(b => b.status !== 'assigned' && !b.assignedProviderId);
  },

  getMarketProjectNeedsSync: () => {
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_market_briefs') || '[]');
      if (stored.length > 0) {
        return stored.filter(b => b.status !== 'assigned' && !b.assignedProviderId);
      }
    } catch {}
    return [
      {
        id: 'brief_italian_bistro',
        title: 'Responsive Restaurant Website with Table Booking & PayPal Escrow',
        clientName: 'Alex G.',
        clientRole: 'Verified Client (5 Orders)',
        category: 'Web Development',
        budgetUSD: 85,
        deadlineDays: 3,
        skills: ['React', 'TailwindCSS', 'Node.js'],
        description: 'Need a fast, mobile-friendly landing page for our boutique Italian eatery with interactive menu, online table reservation, and PayPal Smart Escrow integration.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop',
        postedAt: 'Today',
        proposalsCount: 2,
        status: 'open',
        verifiedEscrow: true
      },
      {
        id: 'brief_saas_metrics',
        title: 'Modern Analytics Dashboard & Client Portal Redesign',
        clientName: 'David K.',
        clientRole: 'Verified Enterprise Client',
        category: 'UI/UX Design & Frontend',
        budgetUSD: 160,
        deadlineDays: 5,
        skills: ['React', 'TypeScript', 'TailwindCSS'],
        description: 'Looking for a skilled frontend engineer to revamp our SaaS analytics UI with real-time charts, dark mode, and sleek glassmorphism cards.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop',
        postedAt: '1 day ago',
        proposalsCount: 4,
        status: 'open',
        verifiedEscrow: true
      }
    ];
  },

  postMarketProjectNeed: async (briefData) => {
    const stored = (() => {
      try { return JSON.parse(localStorage.getItem('skillpay_market_briefs') || '[]'); } catch { return []; }
    })();

    const newBrief = {
      id: `brief_${Date.now()}`,
      title: briefData.title,
      clientName: briefData.clientName || 'Client',
      clientId: briefData.clientId || null,
      clientEmail: briefData.clientEmail || null,
      clientRole: 'Verified Client • PayPal Escrow Ready',
      category: briefData.category || 'Web Development',
      budgetUSD: Number(briefData.budgetUSD || 85),
      deadlineDays: Number(briefData.deadlineDays || 4),
      skills: briefData.skills || ['React', 'JavaScript'],
      description: briefData.description,
      imageUrl: briefData.imageUrl || null,
      postedAt: 'Just now',
      proposalsCount: 0,
      status: 'open',
      assignedProviderId: null,
      proposals: [],
      verifiedEscrow: true
    };

    const updated = [newBrief, ...stored];
    localStorage.setItem('skillpay_market_briefs', JSON.stringify(updated));
    return newBrief;
  },

  submitMarketProposal: async ({ brief, provider, price, days, message }) => {
    const providerId = provider?.uid || provider?.id || 'u_provider';
    const providerName = provider?.name || provider?.displayName || 'Freelancer';
    const providerEmail = provider?.email || '';

    const customerId = brief.clientId || 'u_customer';
    const customerName = brief.clientName || 'Client';
    const customerEmail = brief.clientEmail || '';

    const priceNum = Number(price || brief.budgetUSD || 85);
    const daysNum = Number(days || brief.deadlineDays || 3);
    const convId = `conv_brief_${brief.id}_${providerId}`;
    const proposalBody = `[PROPOSAL for "${brief.title}"]: $${priceNum} USD in ${daysNum} days. ${message?.trim() || ''}`;
    const nowIso = new Date().toISOString();

    // 1. Try to create conversation on backend if connected
    if (!isMock) {
      try {
        await apiClient.post('/conversations', {
          customerId,
          providerId,
          jobId: brief.id
        }).catch(() => {});
      } catch (e) {
        console.debug("Backend conv create notice:", e?.message);
      }
    }

    // 2. Ensure conversation is stored in skillpay_conversations
    let convObj = null;
    try {
      const storedConvs = JSON.parse(localStorage.getItem('skillpay_conversations') || '[]');
      const convIndex = storedConvs.findIndex(c => c.id === convId || (c.briefId === brief.id && c.providerId === providerId));

      convObj = {
        id: convId,
        briefId: brief.id,
        title: `Proposal: ${brief.title}`,
        participantIds: Array.from(new Set([customerId, providerId, customerEmail, providerEmail].filter(Boolean))),
        providerId,
        providerName,
        providerEmail,
        customerId,
        customerName,
        customerEmail,
        proposalPrice: priceNum,
        proposalDays: daysNum,
        lastMessage: proposalBody,
        lastMessageAt: nowIso,
        unreadBy: {
          [customerId]: 1,
          [providerId]: 0
        },
        status: 'active'
      };

      if (convIndex >= 0) {
        storedConvs[convIndex] = { ...storedConvs[convIndex], ...convObj };
      } else {
        storedConvs.unshift(convObj);
      }
      localStorage.setItem('skillpay_conversations', JSON.stringify(storedConvs));
    } catch (e) {
      console.warn("Storage conversation save error:", e);
    }

    // 3. Store the proposal message in skillpay_messages_${convId}
    const newMsg = {
      id: `msg_${Date.now()}`,
      conversationId: convId,
      senderId: providerId,
      senderName: providerName,
      senderRole: 'provider',
      body: proposalBody,
      createdAt: nowIso
    };
    try {
      const storageKey = `skillpay_messages_${convId}`;
      const existingMsgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...existingMsgs, newMsg]));
    } catch (e) {
      console.warn("Storage message save error:", e);
    }

    // 4. Try to push message to backend
    if (!isMock) {
      try {
        await apiClient.post(`/conversations/${convId}/messages`, { body: proposalBody }).catch(() => {});
      } catch (e) {
        console.debug("Backend message delivery notice:", e?.message);
      }
    }

    // 5. Update the brief proposals count & proposal item in storage
    try {
      const storedBriefs = JSON.parse(localStorage.getItem('skillpay_market_briefs') || '[]');
      const bIdx = storedBriefs.findIndex(b => b.id === brief.id);
      if (bIdx >= 0) {
        storedBriefs[bIdx].proposalsCount = (storedBriefs[bIdx].proposalsCount || 0) + 1;
        storedBriefs[bIdx].proposals = storedBriefs[bIdx].proposals || [];
        storedBriefs[bIdx].proposals.unshift({
          id: `prop_${Date.now()}`,
          briefId: brief.id,
          providerId,
          providerName,
          providerEmail,
          price: priceNum,
          days: daysNum,
          message: message?.trim() || '',
          conversationId: convId,
          createdAt: nowIso,
          status: 'pending'
        });
        localStorage.setItem('skillpay_market_briefs', JSON.stringify(storedBriefs));
      }
    } catch (e) {
      console.warn("Storage brief update error:", e);
    }

    // 6. Push notification to the client
    try {
      api.addNotification({
        id: `notif_${Date.now()}`,
        userId: customerId,
        type: 'proposal',
        title: 'New Proposal Received! 📩',
        message: `${providerName} submitted a proposal ($${priceNum} USD, ${daysNum} days) for "${brief.title}".`,
        link: `/messages?conv=${convId}`,
        read: false,
        timestamp: Date.now()
      });
    } catch (e) {}

    return {
      success: true,
      conversationId: convId,
      conversation: convObj,
      message: newMsg
    };
  },

  acceptMarketProposal: async (briefId, providerId, providerName = 'Freelancer', clientName = 'Alex (Client)') => {
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_market_briefs') || '[]');
      const brief = stored.find(b => b.id === briefId);
      if (brief) {
        brief.status = 'assigned';
        brief.assignedProviderId = providerId;
        brief.assignedProviderName = providerName;
        localStorage.setItem('skillpay_market_briefs', JSON.stringify(stored));
      }

      // Add real notification for freelancer
      api.addNotification({
        id: `notif_${Date.now()}`,
        userId: providerId,
        type: 'proposal_accepted',
        title: 'Proposal Accepted! 🎉',
        message: `Client ${clientName} accepted your proposal for "${brief?.title || 'Project'}". Funds secured in PayPal Smart Escrow.`,
        link: '/orders',
        read: false,
        timestamp: Date.now()
      });

      return { success: true, brief };
    } catch (e) {
      console.error("Accept proposal error:", e);
      return { success: false, error: e.message };
    }
  },

  // --- Notifications System ---
  getNotifications: (user = null) => {
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_notifications') || '[]');
      const myUid = user?.uid || user?.id;
      const isProvider = user?.role === 'provider';

      // Provide initial notifications if empty
      if (stored.length === 0) {
        const defaultNotifs = [
          {
            id: 'notif_1',
            userId: myUid || 'u_provider',
            forRole: 'provider',
            type: 'order',
            title: 'PayPal Escrow Secured ($85.00)',
            message: 'Milestone 1 funded for "Responsive Restaurant Website". Work is officially active.',
            link: '/orders',
            read: false,
            timestamp: Date.now() - 1000 * 60 * 18 // 18m ago
          },
          {
            id: 'notif_2',
            userId: myUid || 'u_provider',
            forRole: 'provider',
            type: 'request',
            title: 'New Client Hire Request',
            message: 'Alex G. requested a 4-day web project with AI Deal Room mediation.',
            link: '/freelancer/requests',
            read: false,
            timestamp: Date.now() - 1000 * 60 * 95 // ~1.5h ago
          },
          {
            id: 'notif_3',
            userId: myUid || 'u_customer',
            forRole: 'customer',
            type: 'proposal',
            title: 'Proposal Received',
            message: 'Muthupandi submitted a verified proposal for your project need.',
            link: '/messages',
            read: false,
            timestamp: Date.now() - 1000 * 60 * 35
          }
        ];
        localStorage.setItem('skillpay_notifications', JSON.stringify(defaultNotifs));
        return defaultNotifs.filter(n => (!n.userId || n.userId === myUid) && (!n.forRole || (isProvider ? n.forRole === 'provider' : n.forRole === 'customer')));
      }

      return stored.filter(n => {
        if (n.userId && myUid && n.userId !== myUid) return false;
        if (n.forRole && user?.role && n.forRole !== user.role) return false;
        return true;
      });
    } catch {
      return [];
    }
  },

  addNotification: (notif) => {
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_notifications') || '[]');
      const item = {
        id: notif.id || `notif_${Date.now()}`,
        timestamp: Date.now(),
        read: false,
        ...notif
      };
      const updated = [item, ...stored.slice(0, 49)];
      localStorage.setItem('skillpay_notifications', JSON.stringify(updated));
      return item;
    } catch (e) {
      console.warn("Could not save notification:", e);
    }
  },

  markNotificationRead: (notifId) => {
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_notifications') || '[]');
      const updated = stored.map(n => n.id === notifId ? { ...n, read: true } : n);
      localStorage.setItem('skillpay_notifications', JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  markAllNotificationsRead: (user = null) => {
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_notifications') || '[]');
      const updated = stored.map(n => ({ ...n, read: true }));
      localStorage.setItem('skillpay_notifications', JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  // --- AI Tools ---
  suggestBasePrice: async (payload) => {
    if (!isMock) return apiClient.post('/ai/suggest-price', payload);
    await delay(700);
    const exp = payload.experienceYears || 4;
    const base = 75 + exp * 5;
    return {
      suggestedPriceCents: base * 100,
      rangeCents: [(base - 15) * 100, (base + 25) * 100],
      suggestedPriceUSD: base,
      rangeUSD: [base - 15, base + 25],
      reasons: [
        `${payload.level || 'Intermediate'} proficiency with ${exp} years of verified experience.`,
        `High demand market rates for ${payload.category || 'Web Development'} skill stack.`,
        `Recommended base project fee to maximize client conversion on PayPal Smart Escrow.`
      ],
      disclaimer: 'AI suggestion, not a guarantee'
    };
  },

  improveBio: async (payload) => {
    if (!isMock) return apiClient.post('/ai/improve-bio', payload);
    await delay(800);
    return {
      improvedBio: `Results-driven software engineer and ${payload.headline || 'technical specialist'} with ${payload.experienceYears || 3}+ years of hands-on experience building high-performance solutions with ${(payload.skills || []).slice(0, 3).join(', ') || 'modern web technologies'}. Committed to clear milestones, transparent communication, and 100% verified delivery via PayPal Smart Escrow.`,
      suggestions: [
        'Emphasize your technical edge and PayPal Smart Escrow reliability.',
        'Highlight concrete deliverables to boost client hire confidence.'
      ]
    };
  },

  analyzeRequirement: async (text) => {
    if (!isMock) return apiClient.post('/ai/analyze-requirement', { text });
    await delay(1500);
    if (text === DEMO_REQUEST) {
      return { category: 'Web Development', skills: ['HTML', 'CSS', 'JavaScript'], budget: 100, deadlineDays: 4, complexity: 'medium', confidence: 95 };
    }
    return { category: 'General', skills: ['Communication'], budget: 50, deadlineDays: 7, complexity: 'low', confidence: 70 };
  },

  recommendPrice: async (jobRequirement) => {
    if (!isMock) return apiClient.post('/ai/recommend-price', { jobRequirement });
    await delay(1000);
    if (jobRequirement.budget === 100) {
      return { recommendedPrice: 85, range: [80, 120], reasons: ["Medium complexity implies ~10 hours of work.", "4-day deadline requires moderate urgency."] };
    }
    return { recommendedPrice: jobRequirement.budget * 0.9, range: [jobRequirement.budget * 0.8, jobRequirement.budget * 1.2], reasons: ["Based on average market rates."] };
  },

  matchProviders: async (jobRequirement) => {
    if (!isMock) return apiClient.post('/ai/match-providers', { jobRequirement });
    await delay(1200);
    const matches = MOCK_PROVIDERS.map(provider => {
      const { score, breakdown } = calculateMatchScore(provider, jobRequirement);
      const isDemo = jobRequirement.budget === 100;
      if (isDemo && provider.name === 'Muthu') {
        return { ...provider, score: 94, breakdown: { skill: 40, budget: 20, deadline: 15, rating: 10, experience: 4, availability: 5 }, rationale: "Perfect match." };
      }
      return { ...provider, score, breakdown, rationale: `Strong match.` };
    });
    return matches.sort((a, b) => b.score - a.score);
  },

  createJob: async (jobData) => {
    if (!isMock) return apiClient.post('/jobs', jobData);
    await delay(800);
    return { id: `job_${Date.now()}`, ...jobData, status: 'open', createdAt: new Date().toISOString() };
  },

  createNegotiation: async (jobId, providerId, initialOffer) => {
    if (!isMock) return apiClient.post('/negotiations', { jobId, providerId, initialOffer });
    await delay(600);
    return {
      id: `neg_${Date.now()}`,
      jobId,
      providerId,
      status: 'active',
      history: [{ sender: 'customer', amount: initialOffer.price, message: "Let's work together.", timestamp: new Date().toISOString() }]
    };
  },

  askAssistant: async ({ message, history = [], userRole = 'customer', userName = 'User' }) => {
    try {
      const res = await apiClient.post('/ai/assistant', { message, history, userRole, userName });
      if (res && res.reply) return res;
    } catch (e) {
      console.warn("Assistant backend notice, using smart local assistant engine:", e?.message);
    }

    // Direct contextual intelligence matching based on user query
    const msg = (message || '').toLowerCase();

    if (
      msg.includes('contact') ||
      msg.includes('professional') ||
      msg.includes('message') ||
      msg.includes('reach out') ||
      msg.includes('talk to') ||
      msg.includes('communicate') ||
      msg.includes('chat with')
    ) {
      return {
        reply: `### How to Contact Verified Professionals
You can easily find, message, and collaborate with top professionals on SkillPay AI:

1. **Browse Talent**: Go to the [Find Freelancers Directory](/freelancers) to filter verified experts by skills, category, and hourly rate.
2. **View Profile**: Click **View Profile** on any freelancer to see their portfolio, verified ratings, and packages.
3. **Send Message or Hire Request**:
   - Click **Message Freelancer** to open direct chat in [Messages](/messages).
   - Click **Hire / Send Request** to invite them directly with your project requirements.
4. **Negotiate in Deal Room**: Coordinate deliverables, milestones, and price securely in the [AI Deal Room](/deal-room).
5. **Secure Escrow**: Once agreed, fund milestones through PayPal Smart Escrow. Funds remain protected until you inspect deliverables!`,
        source: 'smart_client_assistant'
      };
    }

    if (msg.includes('escrow') || msg.includes('safe') || msg.includes('protect') || msg.includes('guarantee')) {
      return {
        reply: `### PayPal Smart Escrow Protection
SkillPay AI uses a **100% non-custodial milestone escrow vault**:
1. **Deposit**: When a deal is signed, the client funds the project milestone through [PayPal Smart Checkout](/checkout/demo).
2. **Lock**: Funds are safely locked in the PayPal Smart Escrow sandbox — neither party can lose funds in transit.
3. **Delivery**: The freelancer completes the work and submits deliverables.
4. **Approval & Release**: Once the client reviews and approves, funds are instantly transferred to the freelancer's PayPal account.

Track active contracts anytime on the [Orders & Escrow Page](/orders).`,
        source: 'smart_client_assistant'
      };
    }

    if (msg.includes('post') || msg.includes('client') || msg.includes('hire') || msg.includes('create project') || msg.includes('need') || msg.includes('brief')) {
      return {
        reply: `### How to Post a Project as a Client
You have two simple ways to get work done:
1. **AI Scope Studio**: Visit [Post a Project](/projects/new), describe your idea in plain English, and our Gemini AI extracts the budget, skills, and complexity automatically.
2. **Direct Project Need**: Open your [Client Dashboard](/customer) and click **Post Project Need** to publish an open marketplace brief immediately with custom category and budget pills.
3. **Browse Top Talent**: Search and invite verified freelancers on our [Freelancers Directory](/freelancers).`,
        source: 'smart_client_assistant'
      };
    }

    if (msg.includes('freelancer') || msg.includes('paid') || msg.includes('earn') || msg.includes('payout') || msg.includes('deliver')) {
      return {
        reply: `### Freelancer Workflow & Payouts
Here is how freelancers work and get paid on SkillPay AI:
1. **Setup Your Profile**: Set your rates, skills, and PayPal payout email in the [Profile Builder](/freelancer/profile).
2. **Receive Hire Requests**: Review and accept incoming requests on [Incoming Hire Briefs](/freelancer/requests).
3. **Milestone Delivery**: When milestones are completed, submit deliverables on the [Freelancer Hub](/freelancer).
4. **Instant Release**: As soon as the client approves the work, funds are credited directly to your PayPal account.`,
        source: 'smart_client_assistant'
      };
    }

    if (msg.includes('order') || msg.includes('tracking') || msg.includes('status')) {
      return {
        reply: `### Escrow Order Tracking
Every project has a live milestone timeline on the [Orders Page](/orders):
- **Agreement Signed**: Terms confirmed by both parties.
- **Payment Secured**: Funds deposited into the PayPal Escrow Vault.
- **In Progress**: Freelancer actively working on deliverables.
- **Delivered**: Work submitted for client review.
- **Completed**: Client approves, and funds disburse automatically.`,
        source: 'smart_client_assistant'
      };
    }

    return {
      reply: `### SkillPay AI Assistant
I am here to guide you with any questions about SkillPay AI:

- **Contact Professionals**: Browse verified talent on [Find Freelancers](/freelancers) and message any expert.
- **Post a Project**: Scope out work in [AI Scope Studio](/projects/new) or via your [Client Dashboard](/customer).
- **Escrow & Orders**: Track milestones securely on [Orders & Escrow](/orders).

Feel free to ask me anything specific about escrow, hiring, or payments!`,
      source: 'smart_client_assistant'
    };
  }
};
