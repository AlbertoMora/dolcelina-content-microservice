// test/unit/utils/session-helper.test.js

jest.mock('@aure/commons', () => ({
    getTokenData: jest.fn(),
}));

const { getUserSession } = require('../../../dist/utils/session-helper');
const { getTokenData } = require('@aure/commons');

describe('session-helper', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getUserSession', () => {
        it('extracts bearer token and passes it to getTokenData', () => {
            const mockSession = { user: { id: 'user-abc', email: 'test@example.com' } };
            getTokenData.mockReturnValue(mockSession);

            const result = getUserSession('Bearer my-jwt-token');

            expect(getTokenData).toHaveBeenCalledWith('my-jwt-token');
            expect(result).toEqual(mockSession);
        });

        it('returns null/undefined when getTokenData cannot parse the token', () => {
            getTokenData.mockReturnValue(null);

            const result = getUserSession('Bearer invalid-token');

            expect(getTokenData).toHaveBeenCalledWith('invalid-token');
            expect(result).toBeNull();
        });

        it('calls getTokenData with undefined when authorization header is missing', () => {
            getTokenData.mockReturnValue(null);

            getUserSession(undefined);

            // split is called on undefined → optional chaining returns undefined → token is undefined
            expect(getTokenData).toHaveBeenCalledWith(undefined);
        });

        it('calls getTokenData with undefined when header has no space separator', () => {
            getTokenData.mockReturnValue(null);

            getUserSession('NoSpaceToken');

            // split(' ') → ['NoSpaceToken'], destructuring [, token] gives undefined
            expect(getTokenData).toHaveBeenCalledWith(undefined);
        });
    });
});
