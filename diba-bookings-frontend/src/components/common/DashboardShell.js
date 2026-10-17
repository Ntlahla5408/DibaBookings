import { Button } from "react-bootstrap";

function DashboardShell({
    title,
    eyebrow,
    subtitle,
    onLogout,
    children,
    navigation = [],
    profileLabel = "Staff",
    notice = "",
    activeNavigation = "Dashboard"
}) {
    const initials = String(profileLabel || "Staff")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "ST";

    return (
        <main className="app-shell" id="staff-dashboard-top">
            <header className="bg-white border-bottom mb-4" style={{ margin: "-1rem -1rem 1.5rem", padding: "0 1rem" }}>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 py-3">
                    <a href="#staff-dashboard-top" className="text-decoration-none d-flex align-items-center gap-2" style={{ color: "#071B2C" }}>
                        <span className="d-inline-flex align-items-center justify-content-center rounded-3 fw-bold" style={{ width: 42, height: 42, color: "#fff", background: "#071B2C", letterSpacing: "-1px" }}>D</span>
                        <span>
                            <strong className="d-block" style={{ letterSpacing: ".06em" }}>DIBA BOOKINGS</strong>
                            <span className="small text-muted">Venue management portal</span>
                        </span>
                    </a>
                    <div className="d-flex flex-wrap align-items-center gap-3">
                        <a href="#staff-pending" className="text-decoration-none text-secondary" aria-label="Go to pending booking notifications">🔔</a>
                        <a href="#staff-help" className="text-decoration-none text-secondary" aria-label="Help and support">?</a>
                        <div className="d-flex align-items-center gap-2">
                            <span className="rounded-circle d-inline-flex align-items-center justify-content-center fw-semibold" style={{ width: 36, height: 36, background: "#eaf0f5", color: "#071B2C" }} aria-label={`Profile: ${profileLabel}`}>{initials}</span>
                            <span className="small fw-semibold d-none d-sm-inline">{profileLabel}</span>
                        </div>
                        <Button variant="outline-dark" size="sm" onClick={onLogout}>Sign out</Button>
                    </div>
                </div>
                {navigation.length > 0 && (
                    <nav className="d-flex flex-wrap gap-1" aria-label="Staff dashboard navigation">
                        {navigation.map((item) => {
                            const isActive = item.label === activeNavigation;
                            return (
                                <a key={item.label} href={item.href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`text-decoration-none px-3 py-3 small fw-semibold border-bottom border-3 ${isActive ? "text-primary border-primary" : "text-secondary border-transparent"}`}
                                    style={{ marginBottom: -1 }}>
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>
                )}
            </header>

            <section className="mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
                    <div>
                        <p className="eyebrow mb-1">{eyebrow}</p>
                        <h1 className="mb-1">{title}</h1>
                        <p className="subhead mb-0">{subtitle}</p>
                    </div>
                </div>
                {notice && (
                    <div className="rounded-3 px-3 py-3 d-flex gap-2 align-items-start" role="note" style={{ background: "#f0edff", border: "1px solid #e1dbff", color: "#332b60" }}>
                        <span aria-hidden="true">ⓘ</span>
                        <span>{notice}</span>
                    </div>
                )}
            </section>

            {children}

            <footer id="staff-help" className="border-top mt-5 pt-4 pb-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <strong className="small">DIBA BOOKINGS</strong>
                        <p className="small text-muted mb-0">Staff workspace for bookings and venues.</p>
                    </div>
                    <nav className="d-flex flex-wrap gap-3 small" aria-label="Footer links">
                        <a href="#staff-pending" className="text-secondary">Help and support</a>
                        <a href="#all-bookings" className="text-secondary">Booking guide</a>
                        <a href="#staff-venues" className="text-secondary">Venue directory</a>
                    </nav>
                </div>
            </footer>
        </main>
    );
}

export default DashboardShell;
