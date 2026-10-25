import { Badge, Button } from "react-bootstrap";
import EmptyState from "../common/EmptyState";
import { formatSouthAfricanDateTime } from "../../utils/dateUtils";

function StaffNotificationsView({ notifications, onMarkRead, onOpenBooking }) {
    return (
        <section className="panel">
            <div className="panel-heading">
                <div>
                    <h2>Notifications</h2>
                    <p className="text-muted mb-0">
                        Booking requests and changes that may require staff attention.
                    </p>
                </div>
            </div>

            {notifications.length === 0 ? (
                <EmptyState
                    title="No notifications"
                    text="New booking requests and organiser changes will appear here."
                />
            ) : (
                <div className="list-group list-group-flush">
                    {notifications.map((notification) => (
                        <article
                            key={notification.notificationId}
                            className="list-group-item px-0 py-3"
                        >
                            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                                <div className="d-flex align-items-start gap-2 flex-grow-1">
                                    <span aria-hidden="true" className="pt-1">
                                        {notification.isRead ? "✓" : "•"}
                                    </span>
                                    <div className="flex-grow-1">
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                            <strong>{notification.notificationType}</strong>
                                            {!notification.isRead && <Badge bg="primary">New</Badge>}
                                        </div>
                                        <p className="mb-1" style={{ whiteSpace: "pre-line" }}>
                                            {notification.message}
                                        </p>
                                        <small className="text-muted">
                                            {formatSouthAfricanDateTime(notification.dateCreated)}
                                        </small>
                                    </div>
                                </div>

                                <div className="d-flex flex-wrap gap-2">
                                    {notification.bookingId && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => onOpenBooking(notification.bookingId)}
                                        >
                                            Open booking
                                        </Button>
                                    )}
                                    {!notification.isRead && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline-secondary"
                                            onClick={() => onMarkRead(notification)}
                                        >
                                            Mark read
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default StaffNotificationsView;
