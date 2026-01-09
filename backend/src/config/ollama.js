const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT, 10) || 30000; // 30 seconds
const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true';

// Create axios instance for Ollama
const ollamaClient = axios.create({
  baseURL: OLLAMA_URL,
  timeout: OLLAMA_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check if Ollama service is available
 * @returns {Promise<boolean>}
 */
const isOllamaAvailable = async () => {
  if (USE_MOCK_AI) {
    return true;
  }

  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('Ollama service unavailable:', error.message);
    return false;
  }
};

/**
 * Send chat request to Ollama
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>}
 */
const chat = async (messages) => {
  const response = await ollamaClient.post('/api/chat', {
    model: OLLAMA_MODEL,
    messages,
    stream: false,
  });

  return response.data.message?.content || '';
};

/**
 * Mock responses for demo/testing
 */
const mockResponses = {
  coverLetter: `Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste proposé au sein de votre entreprise.

Fort de mon expérience et de mes compétences, je suis convaincu de pouvoir apporter une contribution significative à votre équipe. Mon parcours m'a permis de développer une expertise solide dans les domaines requis.

Je serais ravi de pouvoir échanger avec vous lors d'un entretien afin de vous présenter plus en détail mon profil et ma motivation.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`,

  matchAnalysis: JSON.stringify({
    score: 75,
    justification: "Bon profil avec compétences correspondantes aux exigences du poste."
  }),
};

module.exports = {
  OLLAMA_URL,
  OLLAMA_MODEL,
  OLLAMA_TIMEOUT,
  USE_MOCK_AI,
  ollamaClient,
  isOllamaAvailable,
  chat,
  mockResponses,
};
