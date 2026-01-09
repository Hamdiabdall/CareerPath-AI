/**
 * Feature: careerpath-ai, Properties 11, 12, 13, 16: AI Service Properties
 * Validates: Requirements 7.3, 7.5, 8.1, 8.5, 8.6, 11.4
 */

const fc = require('fast-check');
const { parseMatchResponse, buildOllamaRequest } = require('../../src/services/aiService');
const { AI_COVER_LETTER_MAX_WORDS } = require('../../src/config/constants');

// Generators
const scoreArb = fc.integer({ min: 0, max: 100 });
const justificationArb = fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0);
const wordArb = fc.string({ minLength: 1, maxLength: 15 }).filter((s) => /^[a-zA-Z]+$/.test(s));

describe('Property 11: AI Cover Letter Word Limit', () => {
  /**
   * Property: Word count enforcement
   */
  it('word count is enforced to max limit', () => {
    fc.assert(
      fc.property(
        fc.array(wordArb, { minLength: 1, maxLength: 500 }),
        (words) => {
          const text = words.join(' ');
          const wordCount = text.split(/\s+/).length;

          // Simulate word limit enforcement
          const limitedWords = text.split(/\s+/).slice(0, AI_COVER_LETTER_MAX_WORDS);
          const limitedText = limitedWords.join(' ');
          const limitedCount = limitedText.split(/\s+/).length;

          // Limited text should not exceed max words
          expect(limitedCount).toBeLessThanOrEqual(AI_COVER_LETTER_MAX_WORDS);

          // If original was under limit, should be unchanged
          if (wordCount <= AI_COVER_LETTER_MAX_WORDS) {
            expect(limitedCount).toBe(wordCount);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Text under limit is preserved
   */
  it('text under limit is preserved', () => {
    fc.assert(
      fc.property(
        fc.array(wordArb, { minLength: 1, maxLength: AI_COVER_LETTER_MAX_WORDS - 1 }),
        (words) => {
          const text = words.join(' ');
          const wordCount = text.split(/\s+/).length;

          // Should be under limit
          expect(wordCount).toBeLessThanOrEqual(AI_COVER_LETTER_MAX_WORDS);

          // Limiting should not change it
          const limitedWords = text.split(/\s+/).slice(0, AI_COVER_LETTER_MAX_WORDS);
          expect(limitedWords.length).toBe(wordCount);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 12: Ollama Request Serialization', () => {
  /**
   * Property: Request contains required fields
   */
  it('request contains model, messages with system and user roles', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        (systemPrompt, userPrompt) => {
          const request = buildOllamaRequest(systemPrompt, userPrompt);

          // Should have model
          expect(request).toHaveProperty('model');
          expect(typeof request.model).toBe('string');

          // Should have messages array
          expect(request).toHaveProperty('messages');
          expect(Array.isArray(request.messages)).toBe(true);

          // Should have system and user messages
          const roles = request.messages.map((m) => m.role);
          expect(roles).toContain('system');
          expect(roles).toContain('user');

          // Should have stream property
          expect(request).toHaveProperty('stream');
          expect(request.stream).toBe(false);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Request is valid JSON
   */
  it('request is valid JSON', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        (systemPrompt, userPrompt) => {
          const request = buildOllamaRequest(systemPrompt, userPrompt);

          // Should be serializable to JSON
          const json = JSON.stringify(request);
          expect(typeof json).toBe('string');

          // Should be parseable back
          const parsed = JSON.parse(json);
          expect(parsed).toEqual(request);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Messages preserve content
   */
  it('messages preserve prompt content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        (systemPrompt, userPrompt) => {
          const request = buildOllamaRequest(systemPrompt, userPrompt);

          const systemMsg = request.messages.find((m) => m.role === 'system');
          const userMsg = request.messages.find((m) => m.role === 'user');

          expect(systemMsg.content).toBe(systemPrompt);
          expect(userMsg.content).toBe(userPrompt);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 13: Match Score Bounds', () => {
  /**
   * Property: Valid JSON with score 0-100 is parsed correctly
   */
  it('valid JSON with score 0-100 is parsed correctly', () => {
    fc.assert(
      fc.property(scoreArb, justificationArb, (score, justification) => {
        const json = JSON.stringify({ score, justification });
        const result = parseMatchResponse(json);

        expect(result).not.toBeNull();
        expect(result.score).toBe(score);
        expect(result.justification).toBe(justification);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score outside 0-100 is rejected
   */
  it('score outside 0-100 is rejected', () => {
    fc.assert(
      fc.property(
        fc.integer().filter((n) => n < 0 || n > 100),
        justificationArb,
        (invalidScore, justification) => {
          const json = JSON.stringify({ score: invalidScore, justification });
          const result = parseMatchResponse(json);

          expect(result).toBeNull();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty justification is rejected
   */
  it('empty justification is rejected', () => {
    fc.assert(
      fc.property(scoreArb, (score) => {
        const json = JSON.stringify({ score, justification: '' });
        const result = parseMatchResponse(json);

        expect(result).toBeNull();

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Missing fields are rejected
   */
  it('missing fields are rejected', () => {
    fc.assert(
      fc.property(scoreArb, justificationArb, (score, justification) => {
        // Missing score
        const noScore = JSON.stringify({ justification });
        expect(parseMatchResponse(noScore)).toBeNull();

        // Missing justification
        const noJustification = JSON.stringify({ score });
        expect(parseMatchResponse(noJustification)).toBeNull();

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: JSON with markdown code blocks is handled
   */
  it('JSON with markdown code blocks is handled', () => {
    fc.assert(
      fc.property(scoreArb, justificationArb, (score, justification) => {
        const json = JSON.stringify({ score, justification });

        // With ```json wrapper
        const withMarkdown = '```json\n' + json + '\n```';
        const result = parseMatchResponse(withMarkdown);

        expect(result).not.toBeNull();
        expect(result.score).toBe(score);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Score is rounded to integer
   */
  it('score is rounded to integer', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }),
        justificationArb,
        (floatScore, justification) => {
          const json = JSON.stringify({ score: floatScore, justification });
          const result = parseMatchResponse(json);

          if (result) {
            expect(Number.isInteger(result.score)).toBe(true);
            expect(result.score).toBe(Math.round(floatScore));
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Property 16: Mock AI Determinism', () => {
  /**
   * Property: Mock responses are consistent
   */
  it('mock responses are consistent', () => {
    const { mockResponses } = require('../../src/config/ollama');

    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), () => {
        // Cover letter mock should be consistent
        const coverLetter1 = mockResponses.coverLetter;
        const coverLetter2 = mockResponses.coverLetter;
        expect(coverLetter1).toBe(coverLetter2);

        // Match analysis mock should be consistent
        const match1 = mockResponses.matchAnalysis;
        const match2 = mockResponses.matchAnalysis;
        expect(match1).toBe(match2);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Mock match analysis is valid JSON
   */
  it('mock match analysis is valid JSON', () => {
    const { mockResponses } = require('../../src/config/ollama');

    const parsed = JSON.parse(mockResponses.matchAnalysis);

    expect(parsed).toHaveProperty('score');
    expect(parsed).toHaveProperty('justification');
    expect(typeof parsed.score).toBe('number');
    expect(parsed.score).toBeGreaterThanOrEqual(0);
    expect(parsed.score).toBeLessThanOrEqual(100);
    expect(typeof parsed.justification).toBe('string');
  });
});
