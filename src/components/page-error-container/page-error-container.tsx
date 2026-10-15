import React from 'react';
import ErrorModal from '../error-modal';
import PageError from '../page-error';
import UnhandledErrorModal from '../unhandled-error-modal';

type TPageErrorContainer = {
    buttonOnClick?: () => void;
    error_header?: React.ReactNode;
    error_messages?: Array<{ message: string; has_html?: boolean } | React.ReactNode>;
    redirect_labels: string[];
    redirect_urls?: string[];
    setError?: (has_error: boolean, error: React.ReactNode) => void;
    should_clear_error_on_click?: boolean;
    should_redirect?: boolean;
};

const PageErrorContainer = ({ error_header, error_messages, ...props }: TPageErrorContainer) => {
    const has_error_messages = Boolean(error_messages?.length);

    if (error_header && has_error_messages) {
        return <PageError header={error_header} messages={error_messages} {...props} />;
    }

    // Only show an error modal when the caller supplied real backend messages.
    // An empty array is a valid prop value and must not be treated as an error.
    if (has_error_messages) {
        return <ErrorModal messages={error_messages} />;
    }

    return null;
};

export default PageErrorContainer;
