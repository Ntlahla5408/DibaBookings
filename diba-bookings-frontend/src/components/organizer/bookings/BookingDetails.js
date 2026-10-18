import Status from "../../common/StatusBadge";
import Detail from "./BookingDetailField";
import { dateText, formatDate, timeText } from "../../../utils/dateUtils";
import { shortId } from "../../../utils/dashboardUtils";

function BookingDetails({ booking, event, venue, onBack, onEdit, onCancel, saving }) {
    const status = booking.statusName || "Pending";

    return (
        <section className="detail-view">
            <button className="back-link" onClick={onBack}>← Back to workspace</button>

            <div className="booking-detail-panel">
                <div className="detail-panel-heading">
                    <div>
                        <p className="section-kicker">BOOKING REFERENCE</p>
                        <h2>{shortId(booking.bookingId)}</h2>
                    </div>
                    <Status status={status} />
                </div>

                <h3 className="booking-detail-section-title">Event details</h3>
                <div className="booking-detail-grid">
                    <Detail label="Event name" value={event?.eventName || booking.eventName} />
                    <Detail label="Event type" value={event?.eventType || "Not provided"} />
                    <Detail label="Venue" value={venue?.venueName || booking.venueName} />
                    <Detail label="Expected attendees" value={event?.eventAttendance || "Not provided"} />
                    <Detail label="Date" value={dateText(event?.startDateTime || booking.startDateTime)} />
                    <Detail label="Start time" value={timeText(event?.startDateTime || booking.startDateTime)} />
                    <Detail label="End date" value={dateText(event?.endDateTime || booking.endDateTime)} />
                    <Detail label="End time" value={timeText(event?.endDateTime || booking.endDateTime)} />
                    <Detail label="Event description" value={event?.eventDescription || "No description provided."} />
                    <Detail label="Special requirements" value={booking.specialRequirements || "None provided."} />
                </div>

                <h3 className="booking-detail-section-title">Booking status</h3>
                <div className="booking-detail-grid">
                    <Detail label="Status" value={status} />
                    <Detail label="Submitted" value={formatDate(booking.bookingDate)} />
                    <Detail label="Booking reference" value={shortId(booking.bookingId)} />
                    <Detail label="Requirements acknowledged" value={booking.acknowledgementAccepted ? "Yes" : "Not recorded"} />
                    {booking.acknowledgementAcceptedAt && (
                        <Detail label="Acknowledged on" value={formatDate(booking.acknowledgementAcceptedAt)} />
                    )}
                    {booking.acknowledgementPolicyType && (
                        <Detail
                            label="Policy acknowledged"
                            value={`${booking.acknowledgementPolicyType}${booking.acknowledgementPolicyVersion ? ` · v${booking.acknowledgementPolicyVersion}` : ""}`}
                        />
                    )}
                </div>

                {booking.adminNotes && (
                    <div className={`notice ${status === "Rejected" ? "rejected-notice" : ""}`}>
                        <strong>{status === "Rejected" ? "Reason from Conference Centre Staff" : "Staff feedback"}</strong>
                        <p>{booking.adminNotes}</p>
                    </div>
                )}

                <div className="booking-timeline">
                    <h3>Booking timeline</h3>
                    <p>✓ Booking submitted <small>{formatDate(booking.bookingDate)}</small></p>
                    <p>{status === "Pending" ? "• Booking waiting for review" : status === "Rejected" ? "• Booking was rejected" : status === "Cancelled" ? "• Booking was cancelled" : "✓ Booking reviewed"}</p>
                </div>

                <div className="detail-actions">
                    {status === "Pending" && (
                        <button className="outline-action" onClick={() => onEdit(booking)}>Edit booking</button>
                    )}
                    {![ "Cancelled", "Rejected", "Completed" ].includes(status) && (
                        <button className="danger-button" disabled={saving} onClick={() => onCancel(booking)}>Cancel booking</button>
                    )}
                </div>
            </div>
        </section>
    );
}

export default BookingDetails;
