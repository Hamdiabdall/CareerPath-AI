const { chat, isOllamaAvailable, USE_MOCK_AI, mockResponses, OLLAMA_TIMEOUT } = require('../config/ollama');
const { AIUnavailableError, AITimeoutError, AIParseError } = require('../utils/errors');
const { AI_COVER_LETTER_MAX_WORDS } = require('../config/constants');

/**
 * Generate cover letter using AI
 * @param {Object} candidate - Candidate profile
 * @param {Object} job - Job offer
 * @returns {Promise<string>} Generated cover letter
 */
const generateCoverLetter = async (candidate, job) => {
  // Check if mock mode
  if (USE_MOCK_AI) {
    return mockResponses.coverLetter;
  }

  // Check Ollama availability
  const available = await isOllamaAvailable();
  if (!available) {
    throw new AIUnavailableError();
  }

  const systemPrompt = `Tu es un expert en recrutement et rédaction professionnelle. Ta tâche est de rédiger des lettres de motivation convaincantes, professionnelles et concises (max ${AI_COVER_LETTER_MAX_WORDS} mots). Ne pars pas dans le blabla inutile. Réponds uniquement avec la lettre de motivation, sans introduction ni commentaire.`;

  const candidateName = candidate.firstName && candidate.lastName 
    ? `${candidate.firstName} ${candidate.lastName}` 
    : 'Le candidat';
  
  const skillsList = job.skills?.map(s => s.name).join(', ') || 'Non spécifiées';
  const cvSnippet = candidate.cvText 
    ? candidate.cvText.substring(0, 500) + '...' 
    : 'Non disponible';

  const userPrompt = `Rédige une lettre de motivation pour le poste de ${job.title} chez ${job.company?.name || 'l\'entreprise'}.

Voici le profil du candidat :
- Nom : ${candidateName}
- Bio : ${candidate.bio || 'Non renseignée'}
- Compétences clés : ${skillsList}
- Extrait du CV : ${cvSnippet}

L'offre requiert : ${job.description?.substring(0, 300) || 'Non spécifié'}`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await Promise.race([
      chat(messages),
      new Promise((_, reject) => 
        setTimeout(() => reject(new AITimeoutError()), OLLAMA_TIMEOUT)
      ),
    ]);

    // Ensure word limit
    const words = response.split(/\s+/);
    if (words.length > AI_COVER_LETTER_MAX_WORDS) {
      return words.slice(0, AI_COVER_LETTER_MAX_WORDS).join(' ') + '...';
    }

    return response;
  } catch (error) {
    if (error instanceof AITimeoutError || error instanceof AIUnavailableError) {
      throw error;
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new AIUnavailableError();
    }
    throw new AIParseError(`Failed to generate cover letter: ${error.message}`);
  }
};

/**
 * Analyze candidate-job match using AI
 * @param {Object} candidate - Candidate profile
 * @param {Object} job - Job offer
 * @returns {Promise<{score: number, justification: string}>} Match analysis
 */
const analyzeMatch = async (candidate, job) => {
  // Check if mock mode
  if (USE_MOCK_AI) {
    return JSON.parse(mockResponses.matchAnalysis);
  }

  // Check Ollama availability
  const available = await isOllamaAvailable();
  if (!available) {
    throw new AIUnavailableError();
  }

  const systemPrompt = `Tu es une API d'analyse de recrutement. Tu ne réponds JAMAIS en dehors du format JSON.
Ta tâche : Analyser la correspondance entre un candidat et une offre d'emploi en te basant sur son CV et son profil.
Retourne UNIQUEMENT un objet JSON valide sans markdown (pas de \`\`\`json).
Format attendu : { "score": number (0-100), "justification": "string (phrase courte expliquant le score)" }`;

  const requiredSkills = job.skills?.map(s => s.name).join(', ') || 'Non spécifiées';
  
  // Use CV text if available, otherwise use bio
  const cvContent = candidate.cvText 
    ? candidate.cvText.substring(0, 1500) 
    : 'CV non disponible';
  
  const candidateName = candidate.firstName && candidate.lastName 
    ? `${candidate.firstName} ${candidate.lastName}` 
    : 'Candidat';

  const userPrompt = `PROFIL DU CANDIDAT :
- Nom : ${candidateName}
- Bio : ${candidate.bio || 'Non renseignée'}
- Contenu du CV : ${cvContent}

OFFRE D'EMPLOI :
- Titre : ${job.title}
- Description : ${job.description?.substring(0, 500) || 'Non spécifiée'}
- Compétences requises : ${requiredSkills}
- Type de contrat : ${job.contractType || 'Non spécifié'}

Analyse la compatibilité entre le profil/CV du candidat et les exigences de l'offre. Donne un score de 0 à 100 et une justification courte.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    let response = await Promise.race([
      chat(messages),
      new Promise((_, reject) => 
        setTimeout(() => reject(new AITimeoutError()), OLLAMA_TIMEOUT)
      ),
    ]);

    // Try to parse JSON
    let result = parseMatchResponse(response);
    
    // If parsing failed, retry with stricter prompt
    if (!result) {
      const stricterPrompt = `IMPORTANT: Réponds UNIQUEMENT avec ce format JSON exact, rien d'autre:
{"score": 75, "justification": "Explication courte"}

${userPrompt}`;

      response = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: stricterPrompt },
      ]);

      result = parseMatchResponse(response);
      
      if (!result) {
        throw new AIParseError('Failed to parse AI response after retry');
      }
    }

    return result;
  } catch (error) {
    if (error instanceof AITimeoutError || error instanceof AIUnavailableError || error instanceof AIParseError) {
      throw error;
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new AIUnavailableError();
    }
    throw new AIParseError(`Failed to analyze match: ${error.message}`);
  }
};

/**
 * Parse match analysis response
 * @param {string} response - AI response
 * @returns {Object|null} Parsed result or null
 */
const parseMatchResponse = (response) => {
  try {
    // Remove markdown code blocks if present
    let cleaned = response
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Try to extract JSON from response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
      return null;
    }
    if (typeof parsed.justification !== 'string' || parsed.justification.length === 0) {
      return null;
    }

    return {
      score: Math.round(parsed.score),
      justification: parsed.justification,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Build Ollama request object (for testing)
 * @param {string} systemPrompt - System prompt
 * @param {string} userPrompt - User prompt
 * @returns {Object} Request object
 */
const buildOllamaRequest = (systemPrompt, userPrompt) => {
  return {
    model: process.env.OLLAMA_MODEL || 'llama3.2',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: false,
  };
};

module.exports = {
  generateCoverLetter,
  analyzeMatch,
  parseMatchResponse,
  buildOllamaRequest,
};
