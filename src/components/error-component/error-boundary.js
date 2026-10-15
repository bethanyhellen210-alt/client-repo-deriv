import React from 'react';
import PropTypes from 'prop-types';
import ErrorComponent from './index';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch = (error, info) => {
        if (window.TrackJS) window.TrackJS.console.log(this.props.root_store);

        this.setState({
            hasError: true,
            error,
            info,
        });
    };
    render = () => {
        if (!this.state.hasError) return this.props.children;

        return (
            <ErrorComponent
                header='Something went wrong'
                message='The app could not finish loading. Please refresh and try again.'
                redirect_label='Refresh'
                redirectOnClick={async () => {
                    try {
                        if ('serviceWorker' in navigator) {
                            const registrations = await navigator.serviceWorker.getRegistrations();
                            await Promise.all(registrations.map(registration => registration.unregister()));
                        }

                        if ('caches' in window) {
                            const cacheNames = await caches.keys();
                            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                        }
                    } catch (cleanupError) {
                        console.warn('[ErrorBoundary] Could not clear cached app assets:', cleanupError);
                    } finally {
                        const url = new URL(window.location.href);
                        url.searchParams.set('reload', Date.now().toString());
                        window.location.replace(url.toString());
                    }
                }}
                should_show_refresh={true}
                should_redirect={false}
            />
        );
    };
}

ErrorBoundary.propTypes = {
    root_store: PropTypes.object,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default ErrorBoundary;
