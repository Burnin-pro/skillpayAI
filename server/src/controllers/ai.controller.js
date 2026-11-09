import * as requirementAnalyzer from '../services/ai/requirementAnalyzer.js';
import * as pricingService from '../services/ai/pricingService.js';
import * as matchingService from '../services/ai/matchingService.js';
import * as providerRepository from '../repositories/providerRepository.js';
import * as assistantService from '../services/ai/assistantService.js';

export const chatAssistant = async (req, res) => {
  try {
    const { message, history, userRole, userName } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const role = userRole || req.user?.role || 'customer';
    const name = userName || req.user?.name || 'User';

    const result = await assistantService.chatWithAssistant({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      userRole: role,
      userName: name
    });

    return res.json(result);
  } catch (err) {
    console.error("ChatAssistant Error:", err);
    return res.status(200).json({
      reply: "### 🛡️ SkillPay AI Assistant\nI'm here to assist you with all things on SkillPay AI! You can post a project in our [AI Scope Studio](/projects/new), browse top talent in our [Freelancer Directory](/freelancers), or manage your contracts on [Orders & Escrow](/orders).\n\nHow can I help you today?",
      source: 'fallback_handler'
    });
  }
};

export const analyzeRequirement = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const analysis = await requirementAnalyzer.analyzeRequirement(text, req.user?.uid);
  res.json(analysis);
};

export const recommendPrice = async (req, res) => {
  const { jobRequirement } = req.body;
  if (!jobRequirement) return res.status(400).json({ error: 'jobRequirement is required' });

  const recommendation = await pricingService.recommendPrice(jobRequirement, req.user?.uid);
  res.json(recommendation);
};

export const matchProviders = async (req, res) => {
  const { jobRequirement } = req.body;
  if (!jobRequirement) return res.status(400).json({ error: 'jobRequirement is required' });

  // 1. Fetch available providers (in a real app, use vector search or inverted index)
  let providers = await providerRepository.searchProviders();
  
  // 2. Score them deterministically
  const matches = providers.map(p => {
    const { score, breakdown } = matchingService.calculateMatchScore(p, jobRequirement);
    return { ...p, score, breakdown };
  });

  // 3. Sort by score
  matches.sort((a, b) => b.score - a.score);
  
  // 4. Return top 5
  res.json(matches.slice(0, 5));
};
