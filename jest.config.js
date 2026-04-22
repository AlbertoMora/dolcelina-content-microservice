// jest.config.js
module.exports = {
    projects: [
        {
            displayName: 'unit',
            testEnvironment: 'node',
            roots: ['<rootDir>/test/unit'],
            testMatch: ['**/*.test.js'],
            clearMocks: true,
        },
        {
            displayName: 'integration',
            testEnvironment: 'node',
            roots: ['<rootDir>/test/integration'],
            testMatch: ['**/*.test.js'],
            clearMocks: true,
        },
    ],
};
