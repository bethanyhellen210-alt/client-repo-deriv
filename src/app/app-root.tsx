import { lazy, Suspense, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import ErrorBoundary from '@/components/error-component/error-boundary';
import ErrorComponent from '@/components/error-component/error-component';
import ChunkLoader from '@/components/loader/chunk-loader';
import { api_base } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import { applyDomainUI } from '@/components/shared/utils/config/config';
import { localize } from '@deriv-com/translations';
import './app-root.scss';

const AppContent = lazy(() => import('./app-content'));

const AppRootLoader = () => {
    return <ChunkLoader message={localize('Loading...')} />;
};

const ErrorComponentWrapper = observer(() => {
    const { common } = useStore();
    const currentError = common.error;
    const errorHeader = currentError?.header;
    const errorMessage = currentError?.message;

    // Do not open the generic "Sorry for the interruption" modal for an
    // empty/stale error object. The modal is only useful when an actual
    // error message or header exists.
    if (!currentError || (!errorHeader && !errorMessage)) return null;

    return (
        <ErrorComponent
            header={errorHeader}
            message={errorMessage}
            redirect_label={currentError.redirect_label}
            redirectOnClick={currentError.redirectOnClick}
            should_clear_error_on_click={currentError.should_clear_error_on_click}
            setError={common.setError}
            redirect_to={currentError.redirect_to}
            should_redirect={currentError.should_redirect}
        />
    );
});

const AppRoot = () => {
    const store = useStore();
    const api_base_initialized = useRef(false);

    // Initialize API
    useEffect(() => {
        const initializeApi = async () => {
            if (!api_base_initialized.current) {
                try {
                    await api_base.init();
                    api_base_initialized.current = true;
                } catch (error) {
                    console.error('API initialization failed:', error);
                    api_base_initialized.current = false;
                }
            }
        };

        void initializeApi();
    }, []);

    useEffect(() => {
        applyDomainUI();
    }, []);

    if (!store) return <AppRootLoader />;

    return (
        <Suspense fallback={<AppRootLoader />}>
            <ErrorBoundary root_store={store}>
                <ErrorComponentWrapper />
                <AppContent />
            </ErrorBoundary>
        </Suspense>
    );
};

export default AppRoot;
