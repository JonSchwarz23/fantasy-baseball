import "./Modal.scss";

const Modal = ({ children, onClose }) => {
    return (
        <div>
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal">{children}</div>
        </div>
    );
};

export default Modal;
