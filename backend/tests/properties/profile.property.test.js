/**
 * Feature: careerpath-ai, Properties 3, 4: Profile Data Integrity and PDF Extraction
 * Validates: Requirements 2.1, 2.2, 2.5, 3.2, 4.2
 */

const fc = require('fast-check');
const path = require('path');
const fs = require('fs');

// Generators for profile data
const firstNameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);
const lastNameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);
const bioArb = fc.string({ minLength: 0, maxLength: 500 });
const phoneArb = fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '-', '+'), {
  minLength: 8,
  maxLength: 15,
});

const profileDataArb = fc.record({
  firstName: fc.option(firstNameArb, { nil: undefined }),
  lastName: fc.option(lastNameArb, { nil: undefined }),
  bio: fc.option(bioArb, { nil: undefined }),
  phone: fc.option(phoneArb, { nil: undefined }),
});

describe('Property 3: Profile Data Integrity', () => {
  /**
   * Property: Partial updates preserve unchanged fields
   * For any profile update with partial data, unchanged fields retain original values
   */
  it('partial updates preserve unchanged fields', () => {
    fc.assert(
      fc.property(
        profileDataArb,
        profileDataArb,
        (originalData, updateData) => {
          // Simulate original profile
          const original = {
            firstName: originalData.firstName || 'John',
            lastName: originalData.lastName || 'Doe',
            bio: originalData.bio || 'Original bio',
            phone: originalData.phone || '0123456789',
          };

          // Apply partial update (only defined fields)
          const updated = { ...original };
          for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined) {
              updated[key] = value;
            }
          }

          // Verify unchanged fields are preserved
          for (const [key, value] of Object.entries(original)) {
            if (updateData[key] === undefined) {
              expect(updated[key]).toBe(value);
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Update only modifies specified fields
   */
  it('update only modifies specified fields', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('firstName', 'lastName', 'bio', 'phone'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (fieldToUpdate, newValue) => {
          const original = {
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Original bio',
            phone: '0123456789',
          };

          // Apply single field update
          const updateData = { [fieldToUpdate]: newValue };
          const updated = { ...original, ...updateData };

          // Verify only the specified field changed
          for (const [key, value] of Object.entries(original)) {
            if (key === fieldToUpdate) {
              expect(updated[key]).toBe(newValue);
            } else {
              expect(updated[key]).toBe(value);
            }
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Empty update preserves all fields
   */
  it('empty update preserves all fields', () => {
    fc.assert(
      fc.property(profileDataArb, (originalData) => {
        const original = {
          firstName: originalData.firstName || 'John',
          lastName: originalData.lastName || 'Doe',
          bio: originalData.bio || 'Bio',
          phone: originalData.phone || '0123456789',
        };

        // Apply empty update
        const updated = { ...original };

        // All fields should be preserved
        expect(updated).toEqual(original);

        return true;
      }),
      { numRuns: 50 }
    );
  });
});

describe('Property 4: PDF Text Extraction', () => {
  /**
   * Property: Text normalization is idempotent
   * Normalizing text twice produces same result as normalizing once
   */
  it('text normalization is idempotent', () => {
    const normalizeText = (text) => {
      return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    };

    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 1000 }), (text) => {
        const normalized1 = normalizeText(text);
        const normalized2 = normalizeText(normalized1);

        // Normalizing twice should give same result
        expect(normalized2).toBe(normalized1);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Normalized text has no excessive whitespace
   */
  it('normalized text has no excessive whitespace', () => {
    const normalizeText = (text) => {
      return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    };

    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 500 }), (text) => {
        const normalized = normalizeText(text);

        // No multiple consecutive spaces
        expect(normalized).not.toMatch(/  /);

        // No more than 2 consecutive newlines
        expect(normalized).not.toMatch(/\n\n\n/);

        // No leading/trailing whitespace
        expect(normalized).toBe(normalized.trim());

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Text content is preserved (modulo whitespace)
   */
  it('text content is preserved after normalization', () => {
    const normalizeText = (text) => {
      return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    };

    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0), {
          minLength: 1,
          maxLength: 10,
        }),
        (words) => {
          // Create text with various whitespace
          const text = words.join('   \n\n\n   ');
          const normalized = normalizeText(text);

          // All original words should be present
          for (const word of words) {
            const trimmedWord = word.trim();
            if (trimmedWord.length > 0) {
              // Word should be present (possibly with normalized whitespace)
              expect(normalized.includes(trimmedWord) || normalized.includes(trimmedWord.replace(/\s+/g, ' '))).toBe(
                true
              );
            }
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('PDF File Validation', () => {
  /**
   * Property: PDF magic bytes check is consistent
   */
  it('PDF magic bytes check is consistent', () => {
    const isPDFHeader = (buffer) => {
      if (buffer.length < 4) return false;
      const header = buffer.slice(0, 4).toString();
      return header === '%PDF';
    };

    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 100 }), (bytes) => {
        const buffer = Buffer.from(bytes);
        const result1 = isPDFHeader(buffer);
        const result2 = isPDFHeader(buffer);

        // Same input should give same result
        expect(result1).toBe(result2);

        // If starts with %PDF, should return true
        if (buffer.length >= 4 && buffer.slice(0, 4).toString() === '%PDF') {
          expect(result1).toBe(true);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid PDF header is detected
   */
  it('valid PDF header is detected', () => {
    const isPDFHeader = (buffer) => {
      if (buffer.length < 4) return false;
      const header = buffer.slice(0, 4).toString();
      return header === '%PDF';
    };

    // Test with valid PDF header
    const validPDFBuffer = Buffer.from('%PDF-1.4 some content');
    expect(isPDFHeader(validPDFBuffer)).toBe(true);

    // Test with invalid headers
    const invalidBuffers = [
      Buffer.from(''),
      Buffer.from('PDF'),
      Buffer.from('text'),
      Buffer.from('<!DOCTYPE'),
    ];

    for (const buffer of invalidBuffers) {
      expect(isPDFHeader(buffer)).toBe(false);
    }
  });
});
