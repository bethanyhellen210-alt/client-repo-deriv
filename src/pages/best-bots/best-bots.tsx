import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { getBestBotsFileUrl, getBestBotsFolder } from '@/components/shared';
import Modal from '@/components/shared_ui/modal';
import { DBOT_TABS } from '@/constants/bot-contents';
import { load, save_types } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import { isPremiumProtectedBot, setActiveBot } from '@/utils/bot-tracker';
import './best-bots.scss';

type TBot = {
    id: string;
    name: string;
    file: string;
    guide_file?: string;
    emoji: string;
    is_premium?: boolean;
    priority?: number;
};

type TBotManifestEntry = {
    id?: string;
    name?: string;
    file: string;
    guide_file?: string;
    emoji?: string;
    is_premium?: boolean;
    priority?: number;
};

const formatMoney = (value: number | string | null | undefined) => {
    const n = Number(value || 0);
    return `$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const toBotId = (file: string) =>
    file
        .replace(/\.xml$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const createManifestBot = (entry: TBotManifestEntry): TBot => {
    const name = entry.name || entry.file.replace(/\.xml$/i, '');

    return {
        id: entry.id || toBotId(entry.file),
        name,
        file: entry.file,
        guide_file: entry.guide_file,
        emoji: entry.emoji || 'BOT',
        is_premium: entry.is_premium,
        priority: entry.priority,
    };
};

// Free Bots is intentionally empty until the owner adds entries to bots.json.
export const getBestBotsForFolder = (_bots_folder: string): TBot[] => [];

const BotCard = observer(({ bot }: { bot: TBot }) => {
    const { dashboard, toolbar, ui } = useStore();
    const { setActiveTab } = dashboard;
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const guideUrl = bot.guide_file ? getBestBotsFileUrl(bot.guide_file) : '';

    const toggleGuideModal = () => {
        if (!guideUrl) return;
        setIsGuideOpen(current => !current);
    };

    const handleLoad = async () => {
        setLoading(true);
        setError(false);
        try {
            const url = getBestBotsFileUrl(bot.file);
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const xml_text = await res.text();
            const workspace = window.Blockly?.derivWorkspace;
            if (!workspace) throw new Error('Workspace not ready');
            const load_result = await load({
                block_string: xml_text,
                file_name: bot.name,
                workspace,
                from: save_types.LOCAL,
                drop_event: {},
                strategy_id: null,
                showIncompatibleStrategyDialog: false,
            });
            if (load_result?.error) throw new Error(load_result.error);
            setActiveBot('best-bot', bot.id, bot.name);
            const is_protected_bot = isPremiumProtectedBot(bot.id);
            try {
                toolbar.setStrategyProtected(
                    is_protected_bot,
                    is_protected_bot ? 'This is a premium bot and cannot be downloaded.' : undefined
                );
            } catch {
                // Keep loading the bot even if toolbar protection is unavailable.
            }
            setTimeout(() => {
                const ws = window.Blockly?.derivWorkspace;
                if (ws) {
                    ws.getAllBlocks(false).forEach(block => {
                        if (
                            [
                                'before_purchase',
                                'after_purchase',
                                'during_purchase',
                                'purchase',
                                'smart_purchase_contract',
                                'trade_again',
                            ].includes(block.type)
                        ) {
                            block.setCollapsed(true);
                            if (is_protected_bot) {
                                block.contextMenu = false;
                                block.setMovable(false);
                            }
                        }
                    });
                }
            }, 500);
            setLoaded(true);
            setTimeout(() => setLoaded(false), 3000);
            setActiveTab(DBOT_TABS.BOT_BUILDER);

            // Blockly is kept mounted while hidden on Free Bots. Resize only after
            // the Builder tab becomes visible so its toolbox and workspace measure correctly.
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    const active_workspace = window.Blockly?.derivWorkspace;
                    if (active_workspace && typeof window.Blockly?.svgResize === 'function') {
                        window.Blockly.svgResize(active_workspace);
                    }
                });
            });
        } catch {
            setError(true);
            setTimeout(() => setError(false), 4000);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            if (!navigator.clipboard) return;
            await navigator.clipboard.writeText(bot.name);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    const cardTypeLabel = bot.is_premium ? 'Premium bot' : 'Free bot';

    const cardClassName = `bb-card${bot.is_premium ? ' bb-card--premium' : ''}${
        ui.is_dark_mode_on ? ' bb-card--dark' : ' bb-card--light'
    }`;

    return (
        <>
            <div className={cardClassName}>
                <div className='bb-card__header'>
                    <div className='bb-card__eyebrow-row'>
                        <span className='bb-card__eyebrow'>{cardTypeLabel}</span>
                        {bot.is_premium && <span className='bb-card__premium-badge'>Premium</span>}
                    </div>
                    <button
                        className={`bb-card__copy${copied ? ' bb-card__copy--copied' : ''}`}
                        type='button'
                        aria-label={`Copy ${bot.name}`}
                        onClick={handleCopy}
                    >
                        <span />
                        <span />
                    </button>
                </div>

                <h3 className='bb-card__name'>{bot.name}</h3>

                <div className='bb-card__actions'>
                    {guideUrl ? (
                        <button
                            className='bb-card__guide'
                            type='button'
                            aria-label={`${bot.name} guide`}
                            onClick={toggleGuideModal}
                        >
                            <span className='bb-card__guide-icon' />
                            Guide
                        </button>
                    ) : (
                        <div className='bb-card__guide'>
                            <span className='bb-card__guide-icon' />
                            Guide
                        </div>
                    )}
                    <button
                        className={`bb-card__btn${loaded ? ' bb-card__btn--loaded' : ''}${
                            error ? ' bb-card__btn--error' : ''
                        }`}
                        onClick={handleLoad}
                        disabled={loading}
                    >
                        <span>{loading ? 'Loading...' : loaded ? 'Loaded' : error ? 'Retry' : 'Load Bot'}</span>
                        <span className='bb-card__btn-icon'>↓</span>
                    </button>
                </div>
            </div>
            {guideUrl && (
                <Modal
                    title={`${bot.name} guide`}
                    width='min(96vw, 1040px)'
                    height='min(88vh, 820px)'
                    is_open={isGuideOpen}
                    toggleModal={toggleGuideModal}
                    should_close_on_click_outside
                    is_vertical_centered
                >
                    <Modal.Body className='bb-guide-modal__body'>
                        <iframe className='bb-guide-modal__frame' src={guideUrl} title={`${bot.name} guide`} />
                        <a className='bb-guide-modal__link' href={guideUrl} target='_blank' rel='noreferrer'>
                            Open in new tab
                        </a>
                    </Modal.Body>
                </Modal>
            )}
        </>
    );
});

const BestBots = () => {
    const botsFolder = getBestBotsFolder();
    const [bots, setBots] = useState<TBot[]>(() => getBestBotsForFolder(botsFolder));

    useEffect(() => {
        let isMounted = true;
        const configuredBots = getBestBotsForFolder(botsFolder);

        setBots(configuredBots);

        fetch(getBestBotsFileUrl('bots.json'))
            .then(response => {
                if (!response.ok) return [];
                return response.json();
            })
            .then((manifestBots: TBotManifestEntry[]) => {
                if (!isMounted || !Array.isArray(manifestBots)) return;
                const dynamicBots = manifestBots
                    .filter(bot => bot?.file?.toLowerCase().endsWith('.xml'))
                    .map(createManifestBot);
                const mergedBots = [...configuredBots];
                const seenFiles = new Set(mergedBots.map(bot => bot.file));

                dynamicBots.forEach(bot => {
                    if (!seenFiles.has(bot.file)) {
                        mergedBots.push(bot);
                        seenFiles.add(bot.file);
                    }
                });

                setBots(mergedBots);
            })
            .catch(() => {
                if (isMounted) setBots(configuredBots);
            });

        return () => {
            isMounted = false;
        };
    }, [botsFolder]);

    return (
        <div className='best-bots'>
            <div className='best-bots__grid'>
                {bots.length > 0 ? (
                    bots.map(bot => <BotCard key={bot.id} bot={bot} />)
                ) : (
                    <div className='best-bots__empty'>
                        <h2>No bots added yet</h2>
                        <p>Add your own bot XML files and list them in the bots.json manifest to display them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BestBots;
