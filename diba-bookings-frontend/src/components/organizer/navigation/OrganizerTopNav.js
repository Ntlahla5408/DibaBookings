function OrganizerTopNav({
    title,
    firstName,
    fullName,
    unread,
    setDrawerOpen,
    goTo
}) {
    return (
        <header className="organizer-header">
            <div className="header-title">
                <button
                    type="button"
                    className="menu-button"
                    aria-label="Open menu"
                    onClick={() => setDrawerOpen(true)}
                >
                    ☰
                </button>

                <div>
                    <h1>{title}</h1>
                </div>
            </div>

            <div className="header-user">
                <button
                    type="button"
                    className="notification-button"
                    aria-label={unread > 0 ? `Open notifications, ${unread} unread` : "Open notifications"}
                    onClick={() => goTo("notifications")}
                    title="Notifications"
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ display: "block" }}
                    >
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                        <path d="M10 21h4" />
                    </svg>

                    {unread > 0 && (
                        <i>{unread > 99 ? "99+" : unread}</i>
                    )}
                </button>

                <span className="avatar">
                    {firstName
                        .charAt(0)
                        .toUpperCase()}
                </span>

                <div>
                    <strong>{fullName}</strong>

                    <span>
                        Event Organiser
                    </span>
                </div>
            </div>
        </header>
    );
}

export default OrganizerTopNav;