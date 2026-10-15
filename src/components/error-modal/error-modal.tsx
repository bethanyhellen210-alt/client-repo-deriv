import React from 'react';
import DesktopWrapper from '../shared_ui/desktop-wrapper';
import MobileDialog from '../shared_ui/mobile-dialog';
import MobileWrapper from '../shared_ui/mobile-wrapper';
import Modal from '../shared_ui/modal';
import ErrorModalContent from './error-modal-content';

type TMessageObject = {
    message?: string;
    toString?: () => string;
};

type TErrorModalProps = {
    messages: Array<TMessageObject | React.ReactNode>;
};

const getErrorDescription = (message: TMessageObject | React.ReactNode | undefined): string => {
    if (message == null) return '';

    if (typeof message === 'string' || typeof message === 'number') {
        return String(message);
    }

    if (React.isValidElement(message)) {
        return '';
    }

    if (typeof message === 'object' && 'message' in message && typeof message.message === 'string') {
        return message.message;
    }

    if (message instanceof Error) {
        return message.message;
    }

    if (typeof message === 'object' && typeof message.toString === 'function') {
        const value = message.toString();
        return value === '[object Object]' ? '' : value;
    }

    return '';
};

const ErrorModal = ({ messages }: TErrorModalProps) => {
    const [is_error_modal_open, setErrorModalOpen] = React.useState(false);
    const error_message_description = getErrorDescription(messages?.[0]);

    React.useEffect(() => {
        setErrorModalOpen(true);
    }, []);

    const toggleErrorModal = () => {
        setErrorModalOpen(!is_error_modal_open);
    };

    return (
        <Modal has_close_icon width='440px' height='284px' is_open={is_error_modal_open} toggleModal={toggleErrorModal}>
            <DesktopWrapper>
                <Modal.Body>
                    <ErrorModalContent error_message={error_message_description} />
                </Modal.Body>
            </DesktopWrapper>
            <MobileWrapper>
                <MobileDialog
                    portal_element_id='modal_root'
                    has_close_icon
                    visible={is_error_modal_open}
                    onClose={toggleErrorModal}
                >
                    <Modal.Body>
                        <ErrorModalContent error_message={error_message_description} />
                    </Modal.Body>
                </MobileDialog>
            </MobileWrapper>
        </Modal>
    );
};

export default ErrorModal;
