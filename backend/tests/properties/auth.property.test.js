/**
 * Feature: careerpath-ai, Property 2: Authorization Enforcement
 * Validates: Requirements 1.4, 1.5
 * 
 * For any protected endpoint and any user, if the user's role does not match
 * the endpoint's required role, the request should be rejected with 403 status;
 * if no valid token is provided, the request should be rejected with 401 status.
 */

const fc = require('fast-check');
const jwt = require('jsonwebtoken');
const { auth } = require('../../src/middleware/auth');
const { roleGuard } = require('../../src/middleware/roleGuard');
const { JWT_SECRET } = require('../../src/config/constants');

// Mock User model
jest.mock('../../src/models', () => ({
  User: {
    findById: jest.fn(),
  },
}));

const { User } = require('../../src/models');

// Generators
const roleArb = fc.constantFrom('candidate', 'recruiter', 'admin');
const invalidTokenArb = fc.oneof(
  fc.constant(''),
  fc.constant('invalid-token'),
  fc.constant('Bearer '),
  fc.constant('Bearer invalid'),
  fc.hexaString({ minLength: 10, maxLength: 50 }).map(s => `Bearer ${s}`)
);

// Helper to create mock request/response
const createMockReqRes = (authHeader = null) => {
  const req = {
    headers: authHeader ? { authorization: authHeader } : {},
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

// Helper to create valid JWT
const createValidToken = (userId, role) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

describe('Property 2: Authorization Enforcement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property: For any invalid or missing token, auth middleware returns 401
   */
  test.each([
    ['no token', undefined],
    ['empty string', ''],
    ['no Bearer prefix', 'some-token'],
    ['Bearer with no token', 'Bearer '],
    ['invalid JWT', 'Bearer invalid.token.here'],
  ])('rejects request with 401 when token is %s', async (_, authHeader) => {
    const { req, res, next } = createMockReqRes(authHeader);

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'AUTH_INVALID_TOKEN',
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * Property: For any valid token but non-existent user, returns 401
   */
  it('rejects with 401 when user not found', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (userId) => {
        jest.clearAllMocks();
        const token = createValidToken(userId, 'candidate');
        const { req, res, next } = createMockReqRes(`Bearer ${token}`);

        User.findById.mockResolvedValue(null);

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
        return true;
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: For any role mismatch, roleGuard returns 403
   */
  it('rejects with 403 when role does not match required role', () => {
    fc.assert(
      fc.property(
        roleArb,
        roleArb.filter(r => r !== 'admin'), // User role (not admin for this test)
        (requiredRole, userRole) => {
          // Skip if roles match
          if (requiredRole === userRole) return true;

          const { req, res, next } = createMockReqRes();
          req.user = { _id: 'user123', role: userRole };

          const middleware = roleGuard(requiredRole);
          middleware(req, res, next);

          if (requiredRole !== userRole) {
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                success: false,
                error: expect.objectContaining({
                  code: 'AUTH_FORBIDDEN',
                }),
              })
            );
            expect(next).not.toHaveBeenCalled();
          }
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: For any matching role, roleGuard calls next()
   */
  it('allows access when role matches required role', () => {
    fc.assert(
      fc.property(roleArb, (role) => {
        const { req, res, next } = createMockReqRes();
        req.user = { _id: 'user123', role };

        const middleware = roleGuard(role);
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: roleGuard with array of roles allows any matching role
   */
  it('allows access when user role is in allowed roles array', () => {
    fc.assert(
      fc.property(
        fc.array(roleArb, { minLength: 1, maxLength: 3 }),
        roleArb,
        (allowedRoles, userRole) => {
          const { req, res, next } = createMockReqRes();
          req.user = { _id: 'user123', role: userRole };

          const middleware = roleGuard(allowedRoles);
          middleware(req, res, next);

          if (allowedRoles.includes(userRole)) {
            expect(next).toHaveBeenCalled();
          } else {
            expect(res.status).toHaveBeenCalledWith(403);
          }
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: roleGuard returns 401 when no user is attached (not authenticated)
   */
  it('returns 401 when user is not authenticated', () => {
    fc.assert(
      fc.property(roleArb, (requiredRole) => {
        const { req, res, next } = createMockReqRes();
        // No req.user attached

        const middleware = roleGuard(requiredRole);
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
        return true;
      }),
      { numRuns: 30 }
    );
  });
});
