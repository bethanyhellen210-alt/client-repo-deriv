jest.mock('@/external/bot-skeleton', () => ({
    load: jest.fn(),
    save_types: { LOCAL: 'local' },
}));

jest.mock('@/hooks/useStore', () => ({
    useStore: jest.fn(),
}));

import { getBestBotsForFolder } from '../best-bots';

describe('Free Bots catalogue', () => {
    it('starts empty so the owner can add their own bots', () => {
        expect(getBestBotsForFolder('optimumtraders.site')).toEqual([]);
    });

    it('does not seed bots for other domains', () => {
        expect(getBestBotsForFolder('riskmanagers.site')).toEqual([]);
        expect(getBestBotsForFolder('derivhhub.com')).toEqual([]);
    });

    it('returns an empty list for an unknown domain', () => {
        expect(getBestBotsForFolder('future-domain.site')).toEqual([]);
    });
});
