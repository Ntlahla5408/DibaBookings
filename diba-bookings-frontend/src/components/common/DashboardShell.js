import { Button } from "react-bootstrap";
import nmuLogo from "../../assets/images/Nelson mandela uniLogo.png";

function DashboardShell({
    title,
    title,
    onLogout,
    children,
    profileLabel = "Staff"
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
                    <a href="#staff-dashboard-top" className="d-inline-flex align-items-center" aria-label="Nelson Mandela University home">
                        <img src={nmuLogo} alt="Nelson Mandela University" style={{ display: "block", width: "min(250px, 48vw)", maxHeight: 64, objectFit: "contain", objectPosition: "left center" }} />
                    </a>
                    <div className="d-flex flex-wrap align-items-center gap-3">
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
                <a href="#staff-pending" className="small text-secondary">Help and support</a>
            </footer>
        </main>
    );
}

export default DashboardShell;
