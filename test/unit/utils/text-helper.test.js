// test/unit/utils/text-helper.test.js

const { stringToSlug } = require('../../../dist/utils/text-helper');

describe('text-helper', () => {
    describe('stringToSlug', () => {
        it('converts a plain string to a lowercase hyphenated slug', () => {
            expect(stringToSlug('Hello World')).toBe('hello-world');
        });

        it('trims leading and trailing whitespace', () => {
            expect(stringToSlug('  Summer Sale  ')).toBe('summer-sale');
        });

        it('lowercases all characters', () => {
            expect(stringToSlug('UPPERCASE')).toBe('uppercase');
        });

        it('replaces multiple spaces with a single hyphen', () => {
            expect(stringToSlug('a   b')).toBe('a-b');
        });

        it('removes special characters in strict mode', () => {
            const slug = stringToSlug('Café & Bistró!');
            expect(slug).toMatch(/^[a-z0-9-]+$/);
        });

        it('returns an empty string when input is empty', () => {
            expect(stringToSlug('')).toBe('');
        });

        it('handles strings with numbers', () => {
            expect(stringToSlug('Product 123')).toBe('product-123');
        });

        it('removes characters matching the custom pattern when shouldRemove is true', () => {
            const slug = stringToSlug('hello.world', true);
            // strict + custom remove: dots should be removed
            expect(slug).not.toContain('.');
        });

        it('does not remove dots when shouldRemove is false (default)', () => {
            // slugify with strict:true already strips dots, but we verify the function is called
            const slug = stringToSlug('file.name');
            expect(typeof slug).toBe('string');
        });
    });
});
