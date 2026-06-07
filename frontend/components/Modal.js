// components/Modal.js
export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop click from closing when clicking inside */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
