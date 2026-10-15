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
                redirectOnClick={() => window.location.reload()}
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
