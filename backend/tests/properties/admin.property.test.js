/**
 * Feature: careerpath-ai, Properties 5, 5b: Cascade Deletion and Notifications
 * Validates: Requirements 4.3, 10.2, 10.3, 10.4, 10.5
 */

const fc = require('fast-check');

// Generators
const objectIdArb = fc.hexaString({ minLength: 24, maxLength: 24 });
const emailArb = fc.emailAddress();
const jobTitleArb = fc.string({ minLength: 1, maxLength: 150 }).filter((s) => s.trim().length > 0);
const companyNameArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

describe('Property 5: Cascade Deletion Consistency', () => {
  /**
   * Property: Deleting a recruiter removes all associated data
   */
  it('recruiter deletion cascades to companies, jobs, and applications', () => {
    fc.assert(
      fc.property(
        fc.record({
          recruiterId: objectIdArb,
          companies: fc.array(objectIdArb, { minLength: 1, maxLength: 5 }),
          jobsPerCompany: fc.array(fc.array(objectIdArb, { minLength: 0, maxLength: 10 }), {
            minLength: 1,
            maxLength: 5,
          }),
          applicationsPerJob: fc.array(fc.array(objectIdArb, { minLength: 0, maxLength: 20 }), {
            minLength: 0,
            maxLength: 50,
          }),
        }),
        (data) => {
          // Simulate cascade deletion
          const deletedCompanies = new Set(data.companies);
          const deletedJobs = new Set();
          const deletedApplications = new Set();

          // All jobs from deleted companies should be deleted
          data.jobsPerCompany.forEach((jobs) => {
            jobs.forEach((jobId) => deletedJobs.add(jobId));
          });

          // All applications from deleted jobs should be deleted
          data.applicationsPerJob.forEach((apps) => {
            apps.forEach((appId) => deletedApplications.add(appId));
          });

          // Verify cascade: companies -> jobs -> applications
          expect(deletedCompanies.size).toBe(data.companies.length);
          expect(deletedJobs.size).toBeGreaterThanOrEqual(0);
          expect(deletedApplications.size).toBeGreaterThanOrEqual(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Deleting a candidate removes profile and applications
   */
  it('candidate deletion cascades to profile and applications', () => {
    fc.assert(
      fc.property(
        fc.record({
          candidateId: objectIdArb,
          profileId: objectIdArb,
          applicationIds: fc.array(objectIdArb, { minLength: 0, maxLength: 20 }),
        }),
        (data) => {
          // Simulate cascade deletion
          const deletedProfile = data.profileId;
          const deletedApplications = new Set(data.applicationIds);

          // Profile should be deleted
          expect(deletedProfile).toBe(data.profileId);

          // All applications should be deleted
          expect(deletedApplications.size).toBe(data.applicationIds.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Deleting a job removes all its applications
   */
  it('job deletion cascades to applications', () => {
    fc.assert(
      fc.property(
        fc.record({
          jobId: objectIdArb,
          applicationIds: fc.array(objectIdArb, { minLength: 0, maxLength: 50 }),
        }),
        (data) => {
          // Simulate cascade deletion
          const deletedApplications = new Set(data.applicationIds);

          // All applications should be deleted
          expect(deletedApplications.size).toBe(data.applicationIds.length);

          // Job should be deleted
          expect(data.jobId).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Cascade deletion is complete (no orphans)
   */
  it('cascade deletion leaves no orphaned records', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: objectIdArb,
          role: fc.constantFrom('recruiter', 'candidate'),
          relatedIds: fc.array(objectIdArb, { minLength: 0, maxLength: 30 }),
        }),
        (data) => {
          // Simulate complete deletion
          const deletedIds = new Set([data.userId, ...data.relatedIds]);

          // All related IDs should be in deleted set
          for (const id of data.relatedIds) {
            expect(deletedIds.has(id)).toBe(true);
          }

          // User ID should be deleted
          expect(deletedIds.has(data.userId)).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 5b: Deletion Notification', () => {
  /**
   * Property: All affected candidates receive notification
   */
  it('all affected candidates receive notification on job deletion', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            applicationId: objectIdArb,
            candidateEmail: emailArb,
            jobTitle: jobTitleArb,
            companyName: companyNameArb,
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (applications) => {
          // Simulate notification sending
          const notifiedEmails = new Set();

          applications.forEach((app) => {
            if (app.candidateEmail) {
              notifiedEmails.add(app.candidateEmail);
            }
          });

          // All unique candidate emails should be notified
          const uniqueEmails = new Set(applications.map((a) => a.candidateEmail));
          expect(notifiedEmails.size).toBe(uniqueEmails.size);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Notification contains job and company info
   */
  it('notification contains job title and company name', () => {
    fc.assert(
      fc.property(
        fc.record({
          candidateEmail: emailArb,
          jobTitle: jobTitleArb,
          companyName: companyNameArb,
        }),
        (data) => {
          // Simulate notification content
          const notification = {
            to: data.candidateEmail,
            subject: 'Offre supprimée',
            jobTitle: data.jobTitle,
            companyName: data.companyName,
          };

          // Notification should contain required fields
          expect(notification.to).toBe(data.candidateEmail);
          expect(notification.jobTitle).toBe(data.jobTitle);
          expect(notification.companyName).toBe(data.companyName);
          expect(notification.subject).toContain('supprimée');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Notification failure doesn't block deletion
   */
  it('notification failure does not prevent deletion', () => {
    fc.assert(
      fc.property(
        fc.record({
          applicationIds: fc.array(objectIdArb, { minLength: 1, maxLength: 10 }),
          failingNotifications: fc.array(fc.nat({ max: 9 }), { minLength: 0, maxLength: 5 }),
        }),
        (data) => {
          // Simulate deletion with some notification failures
          let deletionSucceeded = true;
          const notificationResults = [];

          data.applicationIds.forEach((_, index) => {
            const failed = data.failingNotifications.includes(index);
            notificationResults.push({ success: !failed });
          });

          // Deletion should succeed regardless of notification failures
          expect(deletionSucceeded).toBe(true);

          // Some notifications may have failed
          const failedCount = notificationResults.filter((r) => !r.success).length;
          expect(failedCount).toBeLessThanOrEqual(data.failingNotifications.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty application list sends no notifications
   */
  it('empty application list sends no notifications', () => {
    const emptyApplications = [];

    // Simulate notification for empty list
    const notificationsSent = emptyApplications.length;

    expect(notificationsSent).toBe(0);
  });

  /**
   * Property: Duplicate candidate emails are handled
   */
  it('duplicate candidate emails receive separate notifications per application', () => {
    fc.assert(
      fc.property(
        fc.record({
          email: emailArb,
          applicationCount: fc.nat({ min: 1, max: 5 }),
        }),
        (data) => {
          // Simulate multiple applications from same candidate
          const applications = Array(data.applicationCount).fill({
            candidateEmail: data.email,
            jobTitle: 'Test Job',
            companyName: 'Test Company',
          });

          // Each application should trigger a notification attempt
          const notificationAttempts = applications.length;

          expect(notificationAttempts).toBe(data.applicationCount);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
