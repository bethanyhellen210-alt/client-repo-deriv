/* eslint-disable react/react-in-jsx-scope */
import { useEffect } from 'react';

const AUDIO_IDS = ['announcement', 'earned-money', 'job-done', 'trade-profit', 'trade-loss', 'error', 'severe-error'];

// Mobile browsers (Android Chrome included) can refuse audio.play() when it's called from an
// async event (like a trade settling seconds after the user tapped Buy/Run) rather than directly
// inside a click handler. Unlock every audio element with one muted play+pause on the very first
// tap/click anywhere on the page — after that, browsers treat the element as already "activated"
// and later programmatic .play() calls go through normally.
export const playAppSound = (id: string) => {
    const element = document.getElementById(id) as HTMLAudioElement | null;
    if (!element) return;

    try {
        element.currentTime = 0;
        void element.play().catch(() => {
            // Browsers may block sound until the user has interacted with the page.
        });
    } catch {
        // Audio support must never interrupt trading or app navigation.
    }
};

const unlockAudioOnFirstInteraction = () => {
    AUDIO_IDS.forEach(id => {
        const el = document.getElementById(id) as HTMLAudioElement | null;
        if (!el) return;
        el.muted = true;
        el.play()
            .then(() => {
                el.pause();
                el.currentTime = 0;
                el.muted = false;
            })
            .catch(() => {
                el.muted = false;
            });
    });
};

const Audio = () => {
    useEffect(() => {
        const events: (keyof DocumentEventMap)[] = ['pointerdown', 'touchstart', 'click', 'keydown'];
        const unlock = () => {
            unlockAudioOnFirstInteraction();
            events.forEach(event => document.removeEventListener(event, unlock));
        };
        events.forEach(event => document.addEventListener(event, unlock, { once: true, passive: true }));
        return () => events.forEach(event => document.removeEventListener(event, unlock));
    }, []);

    return (
        <>
            <audio
                id='announcement'
                aria-label='audio'
                src={`${window.__webpack_public_path__}assets/media/announcement.mp3`}
            />
            <audio
                id='earned-money'
                aria-label='audio'
                src={`${window.__webpack_public_path__}assets/media/coins.mp3`}
            />
            <audio id='job-done' aria-label='audio' src={`${window.__webpack_public_path__}assets/media/job-done.mp3`} />
            {/* Dedicated trade outcome sounds — played once per contract settlement, for both bot and manual trades. */}
            <audio id='trade-profit' aria-label='audio' src={`${window.__webpack_public_path__}assets/media/coins.mp3`} />
            <audio
                id='trade-loss'
                aria-label='audio'
                src={`${window.__webpack_public_path__}assets/media/out-of-bounds.mp3`}
            />
            <audio
                id='error'
                aria-label='audio'
                src={`${window.__webpack_public_path__}assets/media/out-of-bounds.mp3`}
            />
            <audio
                id='severe-error'
                aria-label='audio'
                src={`${window.__webpack_public_path__}assets/media/i-am-being-serious.mp3`}
            />
        </>
    );
};

export default Audio;

