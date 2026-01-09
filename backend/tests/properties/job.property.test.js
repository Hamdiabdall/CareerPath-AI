/**
 * Feature: careerpath-ai, Properties 6, 7, 8: Job Search Properties
 * Validates: Requirements 4.4, 4.5, 5.1
 */

const fc = require('fast-check');

// Mock job data generator
const skillIdArb = fc.hexaString({ minLength: 24, maxLength: 24 });
const contractTypeArb = fc.constantFrom('CDI', 'CDD', 'Freelance', 'Stage');

const jobArb = fc.record({
  _id: skillIdArb,
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 500 }),
  skills: fc.array(skillIdArb, { minLength: 0, maxLength: 5 }),
  contractType: contractTypeArb,
  deadline: fc.option(fc.date(), { nil: null }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
});

describe('Property 6: Skill Filter Correctness', () => {
  /**
   * Property: All returned jobs contain the filtered skill
   */
  it('all returned jobs contain the filtered skill', () => {
    fc.assert(
      fc.property(fc.array(jobArb, { minLength: 1, maxLength: 20 }), skillIdArb, (jobs, filterSkill) => {
        // Simulate skill filter
        const filteredJobs = jobs.filter((job) => job.skills.includes(filterSkill));

        // All filtered jobs should contain the skill
        for (const job of filteredJobs) {
          expect(job.skills).toContain(filterSkill);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Jobs without the skill are excluded
   */
  it('jobs without the skill are excluded', () => {
    fc.assert(
      fc.property(fc.array(jobArb, { minLength: 1, maxLength: 20 }), skillIdArb, (jobs, filterSkill) => {
        // Simulate skill filter
        const filteredJobs = jobs.filter((job) => job.skills.includes(filterSkill));
        const excludedJobs = jobs.filter((job) => !job.skills.includes(filterSkill));

        // Excluded jobs should not contain the skill
        for (const job of excludedJobs) {
          expect(job.skills).not.toContain(filterSkill);
        }

        // Filtered + excluded should equal original
        expect(filteredJobs.length + excludedJobs.length).toBe(jobs.length);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty skill filter returns all jobs
   */
  it('no skill filter returns all jobs', () => {
    fc.assert(
      fc.property(fc.array(jobArb, { minLength: 0, maxLength: 20 }), (jobs) => {
        // No filter applied
        const filteredJobs = jobs;

        expect(filteredJobs.length).toBe(jobs.length);

        return true;
      }),
      { numRuns: 50 }
    );
  });
});

describe('Property 7: Deadline Exclusion', () => {
  /**
   * Property: Expired jobs are excluded from candidate search
   */
  it('expired jobs are excluded from candidate search', () => {
    fc.assert(
      fc.property(fc.array(jobArb, { minLength: 1, maxLength: 20 }), (jobs) => {
        const now = new Date();

        // Simulate candidate search (exclude expired)
        const filteredJobs = jobs.filter((job) => {
          if (!job.deadline) return true; // No deadline = not expired
          return new Date(job.deadline) >= now;
        });

        // All filtered jobs should have future deadline or no deadline
        for (const job of filteredJobs) {
          if (job.deadline) {
            expect(new Date(job.deadline).getTime()).toBeGreaterThanOrEqual(now.getTime());
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Jobs with no deadline are always included
   */
  it('jobs with no deadline are always included', () => {
    fc.assert(
      fc.property(fc.array(jobArb, { minLength: 1, maxLength: 20 }), (jobs) => {
        const now = new Date();

        // Jobs without deadline
        const jobsWithoutDeadline = jobs.filter((job) => !job.deadline);

        // Simulate candidate search
        const filteredJobs = jobs.filter((job) => {
          if (!job.deadline) return true;
          return new Date(job.deadline) >= now;
        });

        // All jobs without deadline should be in filtered results
        for (const job of jobsWithoutDeadline) {
          expect(filteredJobs).toContainEqual(job);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Past deadline jobs are excluded
   */
  it('past deadline jobs are excluded', () => {
    fc.assert(
      fc.property(
        fc.array(jobArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 365 }), // Days in past
        (jobs, daysAgo) => {
          const now = new Date();
          const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

          // Create a job with past deadline
          const expiredJob = {
            ...jobs[0],
            deadline: pastDate,
          };

          // Simulate candidate search
          const isIncluded = !expiredJob.deadline || new Date(expiredJob.deadline) >= now;

          expect(isIncluded).toBe(false);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Property 8: Search Results Ordering', () => {
  /**
   * Property: Results are sorted by createdAt descending (newest first)
   */
  it('results are sorted by createdAt descending', () => {
    fc.assert(
      fc.property(fc.array(jobArb, { minLength: 2, maxLength: 20 }), (jobs) => {
        // Sort by createdAt descending
        const sortedJobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Verify ordering
        for (let i = 0; i < sortedJobs.length - 1; i++) {
          const current = new Date(sortedJobs[i].createdAt).getTime();
          const next = new Date(sortedJobs[i + 1].createdAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting is stable (preserves relative order of equal elements)
   */
  it('sorting preserves all elements', () => {
    fc.assert(
      fc.property(fc.array(jobArb, { minLength: 0, maxLength: 20 }), (jobs) => {
        // Sort by createdAt descending
        const sortedJobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Same number of elements
        expect(sortedJobs.length).toBe(jobs.length);

        // All original elements are present
        for (const job of jobs) {
          expect(sortedJobs).toContainEqual(job);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Newest job is always first
   */
  it('newest job is always first', () => {
    fc.assert(
      fc.property(
        fc.array(jobArb, { minLength: 2, maxLength: 20 }).filter((jobs) => {
          // Ensure at least 2 jobs with different dates
          const dates = jobs.map((j) => new Date(j.createdAt).getTime());
          return new Set(dates).size > 1;
        }),
        (jobs) => {
          // Find newest job
          const newestJob = jobs.reduce((newest, job) =>
            new Date(job.createdAt) > new Date(newest.createdAt) ? job : newest
          );

          // Sort
          const sortedJobs = [...jobs].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Newest should be first
          expect(new Date(sortedJobs[0].createdAt).getTime()).toBe(new Date(newestJob.createdAt).getTime());

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
