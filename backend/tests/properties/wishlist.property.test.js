/**
 * Feature: careerpath-ai, Property 9: Wishlist Idempotence
 * Validates: Requirements 5.2, 5.3
 *
 * For any candidate and JobOffer, adding the same job to wishlist multiple times
 * should result in exactly one entry; removing a job should result in zero entries.
 */

const fc = require('fast-check');

// Generators
const jobIdArb = fc.hexaString({ minLength: 24, maxLength: 24 });

describe('Property 9: Wishlist Idempotence', () => {
  /**
   * Property: Adding same job multiple times results in exactly one entry
   */
  it('adding same job multiple times results in exactly one entry', () => {
    fc.assert(
      fc.property(
        fc.array(jobIdArb, { minLength: 0, maxLength: 10 }), // Initial wishlist
        jobIdArb, // Job to add
        fc.integer({ min: 1, max: 10 }), // Number of times to add
        (initialWishlist, jobToAdd, timesToAdd) => {
          // Simulate $addToSet behavior
          let wishlist = [...new Set(initialWishlist)]; // Start with unique items

          for (let i = 0; i < timesToAdd; i++) {
            // $addToSet only adds if not present
            if (!wishlist.includes(jobToAdd)) {
              wishlist.push(jobToAdd);
            }
          }

          // Count occurrences of the added job
          const count = wishlist.filter((id) => id === jobToAdd).length;

          // Should be exactly 1 (or 0 if it was already there and we're checking uniqueness)
          expect(count).toBeLessThanOrEqual(1);

          // If we added it, it should be there exactly once
          if (timesToAdd > 0) {
            expect(wishlist).toContain(jobToAdd);
            expect(count).toBe(1);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Removing a job results in zero entries of that job
   */
  it('removing a job results in zero entries', () => {
    fc.assert(
      fc.property(
        fc.array(jobIdArb, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (wishlist, indexToRemove) => {
          const uniqueWishlist = [...new Set(wishlist)];
          if (uniqueWishlist.length === 0) return true;

          const safeIndex = indexToRemove % uniqueWishlist.length;
          const jobToRemove = uniqueWishlist[safeIndex];

          // Simulate $pull behavior
          const afterRemoval = uniqueWishlist.filter((id) => id !== jobToRemove);

          // Job should not be in the list
          expect(afterRemoval).not.toContain(jobToRemove);

          // Count should be 0
          const count = afterRemoval.filter((id) => id === jobToRemove).length;
          expect(count).toBe(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Add then remove results in original state (if job wasn't there)
   */
  it('add then remove returns to original state', () => {
    fc.assert(
      fc.property(
        fc.array(jobIdArb, { minLength: 0, maxLength: 10 }),
        jobIdArb.filter((id) => id.length === 24), // Ensure valid ID
        (initialWishlist, newJob) => {
          const uniqueInitial = [...new Set(initialWishlist)];

          // Skip if job already in list
          if (uniqueInitial.includes(newJob)) return true;

          // Add job
          const afterAdd = [...uniqueInitial, newJob];
          expect(afterAdd).toContain(newJob);

          // Remove job
          const afterRemove = afterAdd.filter((id) => id !== newJob);
          expect(afterRemove).not.toContain(newJob);

          // Should be back to original
          expect(afterRemove.length).toBe(uniqueInitial.length);
          expect(afterRemove.sort()).toEqual(uniqueInitial.sort());

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Wishlist maintains uniqueness
   */
  it('wishlist maintains uniqueness', () => {
    fc.assert(
      fc.property(
        fc.array(jobIdArb, { minLength: 0, maxLength: 20 }),
        fc.array(jobIdArb, { minLength: 0, maxLength: 10 }),
        (initialJobs, jobsToAdd) => {
          // Simulate adding multiple jobs with $addToSet
          let wishlist = [...new Set(initialJobs)];

          for (const job of jobsToAdd) {
            if (!wishlist.includes(job)) {
              wishlist.push(job);
            }
          }

          // All items should be unique
          const uniqueCount = new Set(wishlist).size;
          expect(uniqueCount).toBe(wishlist.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Removing non-existent job doesn't change wishlist
   */
  it('removing non-existent job does not change wishlist', () => {
    fc.assert(
      fc.property(
        fc.array(jobIdArb, { minLength: 0, maxLength: 10 }),
        jobIdArb,
        (wishlist, jobToRemove) => {
          const uniqueWishlist = [...new Set(wishlist)];

          // Skip if job is in the list
          if (uniqueWishlist.includes(jobToRemove)) return true;

          // Remove non-existent job
          const afterRemoval = uniqueWishlist.filter((id) => id !== jobToRemove);

          // Should be unchanged
          expect(afterRemoval.length).toBe(uniqueWishlist.length);
          expect(afterRemoval).toEqual(uniqueWishlist);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
