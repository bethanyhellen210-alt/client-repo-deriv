import { api_base } from '@/external/bot-skeleton/services/api/api-base';

type ApiResponse = Record<string, any>;

const unwrap = (value: any): ApiResponse =>
    value?.data && typeof value.data === 'object' ? value.data : value || {};

export class PremiumDerivApiService {
    private static requestId = 8000;

    private static async getApi(): Promise<any> {
        const api = api_base.api as any;
        if (api?.connection?.readyState === WebSocket.OPEN) return api;
        if (!api) {
            await api_base.init(true);
        }
        for (let attempt = 0; attempt < 80; attempt += 1) {
            const current = api_base.api as any;
            if (current?.connection?.readyState === WebSocket.OPEN) return current;
            await new Promise(resolve => window.setTimeout(resolve, 125));
        }
        throw new Error('Deriv market feed is not connected. Reconnect Deriv and try again.');
    }

    private static async request(payload: Record<string, unknown>): Promise<ApiResponse> {
        const api = await this.getApi();
        const response = unwrap(await api.send({ ...payload, req_id: ++this.requestId }));
        if (response?.error) {
            const message = response.error.message || response.error.code || 'Deriv request failed.';
            throw new Error(String(message));
        }
        return response;
    }

    static async activeSymbols(): Promise<any[]> {
        const response = await this.request({ active_symbols: 'brief' });
        return Array.isArray(response.active_symbols) ? response.active_symbols : [];
    }

    static async ticksHistory(symbol: string, count = 1000, style: 'ticks' | 'candles' = 'ticks'): Promise<number[]> {
        const response = await this.request({
            ticks_history: symbol,
            end: 'latest',
            count: Math.min(5000, Math.max(1, Math.trunc(count))),
            style,
        });
        if (style === 'candles') return [];
        return Array.isArray(response.history?.prices)
            ? response.history.prices.map(Number).filter(Number.isFinite)
            : [];
    }
}
