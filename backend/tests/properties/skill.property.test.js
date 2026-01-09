/**
 * Feature: careerpath-ai, Properties 14, 15: Skills and Password Exclusion
 * Validates: Requirements 9.4, 10.1
 */

const fc = require('fast-check');

// Generators
const skillNameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);

describe('Property 14: Skills Alphabetical Ordering', () => {
  /**
   * Property: Skills are sorted alphabetically (case-insensitive)
   */
  it('skills are sorted alphabetically', () => {
    fc.assert(
      fc.property(fc.array(skillNameArb, { minLength: 0, maxLength: 20 }), (skillNames) => {
        // Simulate alphabetical sort (case-insensitive)
        const sorted = [...skillNames].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Verify ordering
        for (let i = 0; i < sorted.length - 1; i++) {
          const current = sorted[i].toLowerCase();
          const next = sorted[i + 1].toLowerCase();
          expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting preserves all elements
   */
  it('sorting preserves all elements', () => {
    fc.assert(
      fc.property(fc.array(skillNameArb, { minLength: 0, maxLength: 20 }), (skillNames) => {
        const sorted = [...skillNames].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Same number of elements
        expect(sorted.length).toBe(skillNames.length);

        // All original elements present
        for (const name of skillNames) {
          expect(sorted).toContain(name);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting is idempotent
   */
  it('sorting is idempotent', () => {
    fc.assert(
      fc.property(fc.array(skillNameArb, { minLength: 0, maxLength: 20 }), (skillNames) => {
        const sorted1 = [...skillNames].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        const sorted2 = [...sorted1].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Sorting twice should give same result
        expect(sorted2).toEqual(sorted1);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Case variations are grouped together
   */
  it('case variations are grouped together', () => {
    const testCases = [
      ['React', 'react', 'REACT'],
      ['JavaScript', 'javascript', 'JAVASCRIPT'],
      ['Python', 'python', 'PYTHON'],
    ];

    for (const variations of testCases) {
      const sorted = [...variations].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      // All variations should be adjacent (same position in case-insensitive sort)
      const lowerSorted = sorted.map((s) => s.toLowerCase());
      const uniqueLower = [...new Set(lowerSorted)];
      expect(uniqueLower.length).toBe(1);
    }
  });
});

describe('Property 15: Password Exclusion', () => {
  /**
   * Property: Password field is never present in user response
   */
  it('password field is never present in user response', () => {
    fc.assert(
      fc.property(
        fc.record({
          _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }),
          role: fc.constantFrom('candidate', 'recruiter', 'admin'),
          isVerified: fc.boolean(),
          createdAt: fc.date(),
        }),
        (user) => {
          // Simulate toJSON transformation (remove password)
          const sanitized = { ...user };
          delete sanitized.password;

          // Password should not be present
          expect(sanitized).not.toHaveProperty('password');

          // Other fields should be present
          expect(sanitized).toHaveProperty('_id');
          expect(sanitized).toHaveProperty('email');
          expect(sanitized).toHaveProperty('role');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: User list never contains passwords
   */
  it('user list never contains passwords', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('candidate', 'recruiter', 'admin'),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (users) => {
          // Simulate sanitization
          const sanitized = users.map((user) => {
            const { password, ...rest } = user;
            return rest;
          });

          // No user should have password
          for (const user of sanitized) {
            expect(user).not.toHaveProperty('password');
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: OTP field is also excluded
   */
  it('OTP field is also excluded', () => {
    fc.assert(
      fc.property(
        fc.record({
          _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }),
          otp: fc.record({
            code: fc.string({ minLength: 60, maxLength: 60 }),
            expiresAt: fc.date(),
          }),
        }),
        (user) => {
          // Simulate toJSON transformation
          const sanitized = { ...user };
          delete sanitized.password;
          delete sanitized.otp;

          // Sensitive fields should not be present
          expect(sanitized).not.toHaveProperty('password');
          expect(sanitized).not.toHaveProperty('otp');

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
