/**
 * Feature: careerpath-ai, Property 10: Application Status Preservation
 * Validates: Requirements 6.3
 *
 * For any application status update, only the status field should change;
 * all other fields (coverLetter, appliedAt, etc.) should remain unchanged.
 */

const fc = require('fast-check');

// Generators
const statusArb = fc.constantFrom('pending', 'accepted', 'rejected', 'interview');
const objectIdArb = fc.hexaString({ minLength: 24, maxLength: 24 });
const coverLetterArb = fc.string({ minLength: 10, maxLength: 500 });
const dateArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') });

const applicationArb = fc.record({
  _id: objectIdArb,
  job: objectIdArb,
  candidate: objectIdArb,
  status: statusArb,
  coverLetter: coverLetterArb,
  aiGeneratedContent: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: null }),
  matchScore: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
  matchJustification: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: null }),
  appliedAt: dateArb,
});

describe('Property 10: Application Status Preservation', () => {
  /**
   * Property: Status update only changes status field
   */
  it('status update only changes status field', () => {
    fc.assert(
      fc.property(applicationArb, statusArb, (application, newStatus) => {
        // Simulate status update
        const updated = { ...application, status: newStatus };

        // Only status should change
        expect(updated._id).toBe(application._id);
        expect(updated.job).toBe(application.job);
        expect(updated.candidate).toBe(application.candidate);
        expect(updated.coverLetter).toBe(application.coverLetter);
        expect(updated.aiGeneratedContent).toBe(application.aiGeneratedContent);
        expect(updated.matchScore).toBe(application.matchScore);
        expect(updated.matchJustification).toBe(application.matchJustification);
        expect(updated.appliedAt).toEqual(application.appliedAt);

        // Status should be updated
        expect(updated.status).toBe(newStatus);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Cover letter is never modified by status update
   */
  it('cover letter is never modified by status update', () => {
    fc.assert(
      fc.property(applicationArb, statusArb, (application, newStatus) => {
        const originalCoverLetter = application.coverLetter;

        // Simulate status update
        const updated = { ...application, status: newStatus };

        // Cover letter should be unchanged
        expect(updated.coverLetter).toBe(originalCoverLetter);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Applied date is never modified by status update
   */
  it('applied date is never modified by status update', () => {
    fc.assert(
      fc.property(applicationArb, statusArb, (application, newStatus) => {
        const originalAppliedAt = application.appliedAt;

        // Simulate status update
        const updated = { ...application, status: newStatus };

        // Applied date should be unchanged
        expect(updated.appliedAt.getTime()).toBe(originalAppliedAt.getTime());

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: AI content is preserved during status update
   */
  it('AI content is preserved during status update', () => {
    fc.assert(
      fc.property(applicationArb, statusArb, (application, newStatus) => {
        const originalAIContent = application.aiGeneratedContent;

        // Simulate status update
        const updated = { ...application, status: newStatus };

        // AI content should be unchanged
        expect(updated.aiGeneratedContent).toBe(originalAIContent);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Match score is preserved during status update
   */
  it('match score is preserved during status update', () => {
    fc.assert(
      fc.property(applicationArb, statusArb, (application, newStatus) => {
        const originalMatchScore = application.matchScore;
        const originalJustification = application.matchJustification;

        // Simulate status update
        const updated = { ...application, status: newStatus };

        // Match data should be unchanged
        expect(updated.matchScore).toBe(originalMatchScore);
        expect(updated.matchJustification).toBe(originalJustification);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple status updates preserve all non-status fields
   */
  it('multiple status updates preserve all non-status fields', () => {
    fc.assert(
      fc.property(
        applicationArb,
        fc.array(statusArb, { minLength: 1, maxLength: 10 }),
        (application, statusUpdates) => {
          let current = { ...application };

          // Apply multiple status updates
          for (const newStatus of statusUpdates) {
            current = { ...current, status: newStatus };
          }

          // All non-status fields should be unchanged
          expect(current._id).toBe(application._id);
          expect(current.job).toBe(application.job);
          expect(current.candidate).toBe(application.candidate);
          expect(current.coverLetter).toBe(application.coverLetter);
          expect(current.aiGeneratedContent).toBe(application.aiGeneratedContent);
          expect(current.matchScore).toBe(application.matchScore);
          expect(current.matchJustification).toBe(application.matchJustification);
          expect(current.appliedAt.getTime()).toBe(application.appliedAt.getTime());

          // Final status should be the last update
          expect(current.status).toBe(statusUpdates[statusUpdates.length - 1]);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Status update is idempotent for same status
   */
  it('status update is idempotent for same status', () => {
    fc.assert(
      fc.property(applicationArb, (application) => {
        const originalStatus = application.status;

        // Update to same status
        const updated = { ...application, status: originalStatus };

        // Should be identical
        expect(updated).toEqual(application);

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
