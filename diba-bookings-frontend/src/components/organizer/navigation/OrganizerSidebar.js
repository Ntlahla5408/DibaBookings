import nmuLogo from "../../../assets/images/Nelson mandela uniLogo.png";
import { clearSession } from "../../../utils/sessionUtils";

const navItems = [
    ["⌂", "Dashboard", "dashboard"],
    ["▣", "My Bookings", "bookings"],
    ["◫", "My Events", "events"],
    ["bell", "Notifications", "notifications"],
    ["▤", "Policies", "policies"],
    ["✉", "Support Tickets", "support"],
    ["?", "Help Centre", "help"]
];

function OrganizerSidebar({
    view,
    unread,
    drawerOpen,
    setDrawerOpen,
    goTo
}) {
    return (
        <>
            {drawerOpen && (
                <button
                    className="organizer-overlay"
                    aria-label="Close navigation"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            <aside className={`organizer-drawer ${drawerOpen ? "open" : ""}`}>
                <div className="drawer-header">
                    <div className="brand-lockup">
                        <img
                            className="brand-mark-logo"
                            src={nmuLogo}
                            alt="Nelson Mandela University"
                            width="42"
                            height="42"
                            style={{ objectFit: "contain", flexShrink: 0 }}
                        />
                        <div>
                            <strong>DIBA</strong>
                            <span>Bookings</span>
                        </div>
                    </div>
                    <button className="drawer-close" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>×</button>
                </div>

                <p className="sidebar-label">Workspace</p>
                <nav className="dashboard-nav" aria-label="Dashboard navigation">
                    {navItems.map(([icon, label, key]) => (
                        <button
                            key={key}
                            type="button"
                            className={`nav-item ${view === key ? "active" : ""}`}
                            onClick={() => goTo(key)}
                        >
                            <span className="nav-icon" aria-hidden="true">
                                {key === "notifications" ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ display: "block", margin: "0 auto" }}
                                    >
                                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                        <path d="M10 21h4" />
                                    </svg>
                                ) : icon}
                            </span>
                            <span>{label}</span>
                            {key === "notifications" && unread > 0 && (
                                <span className="nav-count" aria-label={`${unread} unread notifications`}>
                                    {unread > 99 ? "99+" : unread}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button type="button" className={`nav-item ${view === "profile" ? "active" : ""}`} onClick={() => goTo("profile")}>
                        <span className="nav-icon">◎</span><span>Profile</span>
                    </button>
                    <button type="button" className={`nav-item ${view === "settings" ? "active" : ""}`} onClick={() => goTo("settings")}>
                        <span className="nav-icon">⚙</span><span>Settings</span>
                    </button>
                    <button type="button" className="nav-item logout-item" onClick={clearSession}>
                        <span className="nav-icon">↪</span><span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default OrganizerSidebar;