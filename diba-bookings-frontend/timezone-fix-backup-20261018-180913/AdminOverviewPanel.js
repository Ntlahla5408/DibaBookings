import { useState } from "react";
import Button from "react-bootstrap/Button";
import StatCard from "../common/StatCard";
import { formatDate } from "../../utils/dateUtils";

function AdminOverviewPanel({ overview, onShowAudit }) {
    const [showAllActivity, setShowAllActivity] = useState(false);
    const recentActivity = Array.isArray(overview.recentActivity)
        ? overview.recentActivity
        : [];
    const displayedActivity = showAllActivity
        ? recentActivity
        : recentActivity.slice(0, 3);

    return (
        <>
            <section id="admin-overview" className="d-flex flex-wrap gap-3 mb-4" aria-label="Administrator quick overview">
                <StatCard label="Total users" value={overview.totalUsers} />
                <StatCard
                    label="Active users"
                    value={overview.activeUsers}
                    tone="green"
                />
                <StatCard
                    label="Total bookings"
                    value={overview.totalBookings}
                    tone="ink"
                />
                <StatCard
                    label="Pending bookings"
                    value={overview.pendingBookings}
                    tone="amber"
                />
            </section>

            <section className="mb-4" aria-label="Recent system activity">
                <div className="panel">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <h2 className="mb-0">Recent system activity</h2>
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge text-bg-primary">
                                {recentActivity.length}
                            </span>
                            {recentActivity.length > 3 && (
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="p-0 text-decoration-none"
                                    onClick={() => setShowAllActivity((current) => !current)}
                                >
                                    {showAllActivity ? "Show less" : "See all"}
                                </Button>
                            )}
                            {recentActivity.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={onShowAudit}
                                >
                                    Audit logs
                                </Button>
                            )}
                        </div>
                    </div>

                    {recentActivity.length === 0 ? (
                        <p className="text-muted mb-0">No recent system activity is available.</p>
                    ) : (
                        <div className="d-grid gap-3">
                            {displayedActivity.map((item) => (
                                <div
                                    className="activity-row border-bottom pb-3"
                                    key={item.auditLogId}
                                >
                                    <span className="activity-dot" />
                                    <div>
                                        <strong>{item.action || "System activity"}</strong>
                                        <p className="mb-1">
                                            {item.logDescription || `Action by ${item.userName || "a user"}`}
                                        </p>
                                        <span className="text-muted small">
                                            {item.userName || "Unknown user"}
                                        </span>
                                    </div>
                                    <time>{formatDate(item.timestamp)}</time>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default AdminOverviewPanel;
