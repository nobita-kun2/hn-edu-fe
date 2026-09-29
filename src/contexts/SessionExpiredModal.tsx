import { useEffect, useState } from "react";
import "./SessionExpiredModal.css";

const SESSION_EXPIRED_MESSAGE = "Phiên làm việc đã hết hạn, vui lòng đăng nhập lại";

// Lets non-React modules (the axios interceptor in api.ts, which runs outside
// the component tree) trigger this modal without needing a hook — same
// bridge pattern as showGlobalToast in ToastContext.tsx.
let trigger: (() => void) | null = null;

export function showSessionExpiredModal() {
  trigger?.();
}

export function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    trigger = () => setIsOpen(true);
    return () => {
      trigger = null;
    };
  }, []);

  function handleConfirm() {
    setIsOpen(false);
    window.location.href = "/login";
  }

  if (!isOpen) return null;

  return (
    <div className="session-expired-backdrop">
      <div className="session-expired-panel" role="alertdialog" aria-modal="true">
        <p className="session-expired-message">{SESSION_EXPIRED_MESSAGE}</p>
        <div className="session-expired-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
