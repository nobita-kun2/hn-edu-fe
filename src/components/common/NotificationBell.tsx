import { useEffect, useRef, useState } from "react";
import "./NotificationBell.css";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

// Mock data — backend chưa có API thông báo, tạm hiển thị dữ liệu tĩnh để dựng giao diện.
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Lịch dạy mới được duyệt",
    message: "Buổi dạy lớp Ôn thi THCS ngày 03/10/2026 đã được duyệt.",
    time: "5 phút trước",
    isRead: false,
  },
  {
    id: 2,
    title: "Học viên đăng ký lớp",
    message: "Một học viên mới vừa đăng ký lớp IELTS Test Class.",
    time: "1 giờ trước",
    isRead: false,
  },
  {
    id: 3,
    title: "Yêu cầu đổi lịch",
    message: "Gia sư tutor1 đã gửi yêu cầu dời lịch buổi dạy.",
    time: "3 giờ trước",
    isRead: false,
  },
  {
    id: 4,
    title: "Nhắc lịch dạy",
    message: "Bạn có 1 buổi dạy sắp diễn ra trong 30 phút nữa.",
    time: "Hôm qua",
    isRead: true,
  },
];

function BellIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9.5C6 6.5 8.2 4.5 12 4.5S18 6.5 18 9.5c0 4.5 1.5 5.5 1.5 6.5H4.5C4.5 15 6 14 6 9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M10 19.5c.4.7 1.1 1 2 1s1.6-.3 2-1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function markAsRead(id: number) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="notification-bell" ref={rootRef}>
      <button
        type="button"
        className="app-header-theme-btn notification-bell-btn"
        aria-label="Thông báo"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notification-bell-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel" role="menu">
          <div className="notification-panel-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button type="button" className="notification-mark-all" onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="notification-empty">Không có thông báo nào.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`notification-item ${n.isRead ? "" : "notification-item--unread"}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <span className="notification-item-dot" aria-hidden="true" />
                    <span className="notification-item-body">
                      <span className="notification-item-title">{n.title}</span>
                      <span className="notification-item-message">{n.message}</span>
                      <span className="notification-item-time">{n.time}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
