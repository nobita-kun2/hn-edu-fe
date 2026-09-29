import { useState, type ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { BrandMark } from "../common/BrandMark";
import { NotificationBell } from "../common/NotificationBell";
import { ROLES } from "../../utils/constants";
import type { UserRole } from "../../types/user.types";
import "./MainLayout.css";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

function GridIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M15.5 5.5c1.5.3 2.5 1.5 2.5 3s-1 2.7-2.5 3M18 19c0-2.5-1.5-4.3-3.5-4.9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12V20H5.5C4.7 20 4 19.3 4 18.5V5.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M20 5.5C20 4.7 19.3 4 18.5 4H12V20H18.5C19.3 20 20 19.3 20 18.5V5.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3.5 9.5H20.5M8 3V6M16 3V6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6.5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15.5 12.5H18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V10M11 20V4M18 20V14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M3 20H21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20L4.7 16.7L16 5.4C16.6 4.8 17.6 4.8 18.2 5.4L18.6 5.8C19.2 6.4 19.2 7.4 18.6 8L7.3 19.3L4 20Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function ClipboardCheckIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="4.5" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 4V3.5C9 3.2 9.2 3 9.5 3H14.5C14.8 3 15 3.2 15 3.5V4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8.5 13L11 15.5L16 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12C4 7.6 7.8 4 12.5 4S21 7.6 21 12s-3.8 8-8.5 8c-1 0-1.9-.1-2.8-.4L4 20.5l1.4-3.6C4.5 15.7 4 13.9 4 12Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M4.5 20c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 20H5.5C4.7 20 4 19.3 4 18.5V5.5C4 4.7 4.7 4 5.5 4H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M14 16L18 12L14 8M18 12H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 2.5V5M12 19V21.5M4.2 4.2L6 6M18 18L19.8 19.8M2.5 12H5M19 12H21.5M4.2 19.8L6 18M18 6L19.8 4.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 1010.5 10.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6.5H20M4 12H20M4 17.5H20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  [ROLES.ADMIN]: [
    { to: "/admin", label: "Dashboard", icon: <GridIcon />, end: true },
    { to: "/admin/tutors", label: "Quản lý Gia sư", icon: <UsersIcon /> },
    { to: "/admin/classes", label: "Quản lý Lớp học", icon: <BookIcon /> },
    { to: "/admin/schedules", label: "Quản lý Lịch dạy", icon: <CalendarIcon /> },
    { to: "/admin/tuition", label: "Quản lý Học phí", icon: <WalletIcon /> },
    { to: "/admin/reports", label: "Báo cáo Thu-Chi & Lương", icon: <ChartIcon /> },
  ],
  [ROLES.TUTOR]: [
    { to: "/tutor", label: "Dashboard", icon: <GridIcon />, end: true },
    { to: "/tutor/classes", label: "Lớp học của tôi", icon: <BookIcon /> },
    { to: "/tutor/quizzes/new", label: "Soạn Quiz", icon: <PencilIcon /> },
    { to: "/tutor/quizzes/results", label: "Kết quả Quiz theo lớp", icon: <ClipboardCheckIcon /> },
    { to: "/tutor/salary", label: "Xem lương", icon: <WalletIcon /> },
  ],
  [ROLES.STUDENT]: [
    { to: "/student", label: "Dashboard", icon: <GridIcon />, end: true },
    { to: "/student/classes", label: "Lớp học của tôi", icon: <BookIcon /> },
    { to: "/student/chatbot", label: "Chatbot AI trợ giảng", icon: <ChatIcon /> },
  ],
};

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  TUTOR: "Gia sư",
  STUDENT: "Học viên",
};

export function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = user ? NAV_ITEMS[user.role] : [];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          {user && (
            <button
              type="button"
              className="app-header-menu-btn"
              aria-label="Mở menu điều hướng"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen((v) => !v)}
            >
              <MenuIcon />
            </button>
          )}
          <BrandMark />
        </div>

        {user && (
          <div className="app-header-right">
            <NotificationBell />
            <button
              type="button"
              className="app-header-theme-btn"
              aria-label="Chuyển giao diện sáng/tối"
              title="Chuyển giao diện sáng/tối"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <NavLink to="/profile" className="app-header-user">
              <span className="app-header-user-avatar" aria-hidden="true">
                <UserIcon />
              </span>
              <span className="app-header-user-info">
                <span className="app-header-user-name">{user.fullName}</span>
                <span className="app-header-user-role">{ROLE_LABEL[user.role]}</span>
              </span>
            </NavLink>
            <button type="button" className="app-header-logout" onClick={logout}>
              <LogoutIcon />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </header>

      <div className="app-body">
        {user && (
          <>
            {isSidebarOpen && (
              <button
                type="button"
                className="app-sidebar-backdrop"
                aria-label="Đóng menu"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <aside className={`app-sidebar ${isSidebarOpen ? "app-sidebar--open" : ""}`}>
              <nav className="app-nav">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `app-nav-item ${isActive ? "app-nav-item--active" : ""}`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <span className="app-nav-item-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </aside>
          </>
        )}

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
