/**
 * Feature: careerpath-ai, Properties 1, 1b, 1c: OTP Authentication
 * Validates: Requirements 1.1, 1.2, 1b.1, 1b.2, 1b.3, 1b.5, 1b.6
 */

const fc = require('fast-check');
const bcrypt = require('bcryptjs');
const {
  generateOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiry,
  isOTPExpired,
  isValidOTPFormat,
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
} = require('../../src/utils/otpUtils');

// Generators
const validOTPArb = fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), {
  minLength: 6,
  maxLength: 6,
});

const invalidOTPFormatArb = fc.oneof(
  fc.string({ minLength: 0, maxLength: 5 }), // Too short
  fc.string({ minLength: 7, maxLength: 10 }), // Too long
  fc.stringOf(fc.constantFrom('a', 'b', 'c', 'x', 'y', 'z'), { minLength: 6, maxLength: 6 }), // Letters
  fc.constant('12345'), // 5 digits
  fc.constant('1234567'), // 7 digits
);

describe('Property 1c: OTP Hash Security', () => {
  /**
   * Property: Generated OTP is always 6 digits
   */
  it('generates OTP with exactly 6 digits', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), () => {
        const otp = generateOTP();
        expect(otp).toHaveLength(OTP_LENGTH);
        expect(/^\d{6}$/.test(otp)).toBe(true);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Hashed OTP is not reversible (different from original)
   */
  it('hashed OTP is different from original', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 10 }), async () => {
        const otp = generateOTP();
        const hash = await hashOTP(otp);
        
        // Hash should be different from original
        expect(hash).not.toBe(otp);
        // Hash should be a bcrypt hash (starts with $2)
        expect(hash.startsWith('$2')).toBe(true);
        return true;
      }),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Property: Only correct OTP verifies against hash
   */
  it('only correct OTP verifies against its hash', async () => {
    await fc.assert(
      fc.asyncProperty(validOTPArb, validOTPArb, async (correctOTP, wrongOTP) => {
        const hash = await hashOTP(correctOTP);
        
        // Correct OTP should verify
        const correctResult = await verifyOTP(correctOTP, hash);
        expect(correctResult).toBe(true);
        
        // Wrong OTP should not verify (unless they happen to be the same)
        if (correctOTP !== wrongOTP) {
          const wrongResult = await verifyOTP(wrongOTP, hash);
          expect(wrongResult).toBe(false);
        }
        
        return true;
      }),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Property: Same OTP hashed twice produces different hashes (salt)
   */
  it('same OTP produces different hashes due to salt', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 5 }), async () => {
        const otp = generateOTP();
        const hash1 = await hashOTP(otp);
        const hash2 = await hashOTP(otp);
        
        // Hashes should be different due to random salt
        expect(hash1).not.toBe(hash2);
        
        // But both should verify correctly
        expect(await verifyOTP(otp, hash1)).toBe(true);
        expect(await verifyOTP(otp, hash2)).toBe(true);
        
        return true;
      }),
      { numRuns: 5 }
    );
  }, 30000);
});

describe('Property 1b: OTP Expiration Enforcement', () => {
  /**
   * Property: OTP expiry is always 10 minutes in the future
   */
  it('OTP expiry is 10 minutes from now', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), () => {
        const before = Date.now();
        const expiry = getOTPExpiry();
        const after = Date.now();
        
        const expectedMin = before + OTP_EXPIRY_MINUTES * 60 * 1000;
        const expectedMax = after + OTP_EXPIRY_MINUTES * 60 * 1000;
        
        expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMin);
        expect(expiry.getTime()).toBeLessThanOrEqual(expectedMax);
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Fresh OTP is not expired
   */
  it('fresh OTP is not expired', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), () => {
        const expiry = getOTPExpiry();
        expect(isOTPExpired(expiry)).toBe(false);
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: OTP with past expiry is expired
   */
  it('OTP with past expiry is expired', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // Minutes in the past
        (minutesAgo) => {
          const pastExpiry = new Date(Date.now() - minutesAgo * 60 * 1000);
          expect(isOTPExpired(pastExpiry)).toBe(true);
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: OTP with future expiry is not expired
   */
  it('OTP with future expiry is not expired', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // Minutes in the future
        (minutesAhead) => {
          const futureExpiry = new Date(Date.now() + minutesAhead * 60 * 1000);
          expect(isOTPExpired(futureExpiry)).toBe(false);
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('OTP Format Validation', () => {
  /**
   * Property: Valid 6-digit OTPs pass format validation
   */
  it('valid 6-digit OTPs pass format validation', () => {
    fc.assert(
      fc.property(validOTPArb, (otp) => {
        expect(isValidOTPFormat(otp)).toBe(true);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid format OTPs fail validation
   */
  it('invalid format OTPs fail validation', () => {
    fc.assert(
      fc.property(invalidOTPFormatArb, (otp) => {
        // Skip if accidentally generated valid OTP
        if (/^\d{6}$/.test(otp)) return true;
        
        expect(isValidOTPFormat(otp)).toBe(false);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Generated OTPs always pass format validation
   */
  it('generated OTPs always pass format validation', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), () => {
        const otp = generateOTP();
        expect(isValidOTPFormat(otp)).toBe(true);
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
