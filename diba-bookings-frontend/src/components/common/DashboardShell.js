import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import nmuLogo from "../../assets/images/Nelson mandela uniLogo.png";

function DashboardShell({
    title,
    onLogout,
    children,
    profileLabel = "Staff",
    navigationItems = []
}) {
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("diba-bookings-theme") === "dark");

    useEffect(() => {
        document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
        localStorage.setItem("diba-bookings-theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const initials = String(profileLabel || "Staff")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "ST";

    return (
        <main className="app-shell" id="staff-dashboard-top" data-theme={isDarkMode ? "dark" : "light"}>
            <header className="bg-white border-bottom mb-4" style={{ margin: "-1rem -1rem 1.5rem", padding: "0 1rem" }}>
                <div className="dashboard-topbar d-flex flex-wrap align-items-center gap-3 py-3">
                    <a href="#staff-dashboard-top" className="dashboard-brand d-inline-flex align-items-center flex-shrink-0" aria-label="Nelson Mandela University home">
                        <img src={nmuLogo} alt="Nelson Mandela University" style={{ display: "block", width: "min(210px, 34vw)", maxHeight: 64, objectFit: "contain", objectPosition: "left center" }} />
                    </a>
                    {navigationItems.length > 0 && (
                        <nav className="dashboard-section-nav d-flex flex-wrap align-items-center gap-2" aria-label="Dashboard sections">
                            {navigationItems.map((item) => (
                                <Button
                                    key={item.href || item.label}
                                    {...(item.onClick
                                        ? { onClick: item.onClick }
                                        : { as: "a", href: item.href })}
                                    variant="outline-primary"
                                    size="sm"
                                    className="dashboard-nav-button text-nowrap"
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </nav>
                    )}
                    <div className="dashboard-profile-actions d-flex flex-wrap align-items-center gap-3 ms-auto">
                        <Button
                            variant="outline-dark"
                            size="sm"
                            className="dashboard-theme-toggle"
                            onClick={() => setIsDarkMode((currentMode) => !currentMode)}
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            aria-pressed={isDarkMode}
                        >
                            {isDarkMode ? "☀ Light mode" : "☾ Dark mode"}
                        </Button>
                        <div className="d-flex align-items-center gap-2">
                            <span className="rounded-circle d-inline-flex align-items-center justify-content-center fw-semibold" style={{ width: 36, height: 36, background: "#eaf0f5", color: "#071B2C" }} aria-label={`Profile: ${profileLabel}`}>{initials}</span>
                            <span className="small fw-semibold d-none d-sm-inline">{profileLabel}</span>
                        </div>
                        <Button variant="outline-dark" size="sm" onClick={onLogout}>Sign out</Button>
                    </div>
                </div>
            </header>

            <section className="mb-4">
                <h1 className="mb-0">{title}</h1>
            </section>

            {children}

            <footer id="staff-help" className="border-top mt-5 pt-3 pb-3">
                <a href="/help" className="small text-secondary">Help Centre and support</a>
            </footer>
        </main>
    );
}

export default DashboardShell;
