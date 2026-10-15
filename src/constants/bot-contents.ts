type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    BEST_BOTS: 2,
    BOT_IDEAS: 3,
    UP_AND_DOWN: 4,
    AUTO_TRADES: 5,
    MANUAL_TRADING: 6,
    SCANNER: 7,
    ACCUMILATOIRS: 8,
    ANALYSIS_TOOL: 9,
    CHART: 10,
    TRADING_VIEW: 11,
    COMPETITION: 12,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-best-bots',
    'id-bot-ideas',
    'id-up-and-down',
    'id-auto-trades',
    'id-manual-trading',
    'id-scanner',
    'id-accumilatoirs',
    'id-analysistool',
    'id-chart',
    'id-tradingview',
    'id-competition',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
