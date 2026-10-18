import { useMemo, useState } from "react";
import Status from "../../common/StatusBadge";
import Empty from "../../common/EmptyState";
import { dateText, formatDate, timeText } from "../../../utils/dateUtils";
import { shortId } from "../../../utils/dashboardUtils";
import "./event-booking-workspace.css";

function EventBookingWorkspace({
    perspective,
    onChangePerspective,
    events,
    bookings,
    venues,
    onOpenBooking,
    onEditEvent,
    onBookEvent,
    onEditBooking,
    onCancelBooking,
    saving
}) {
    const [query, setQuery] = useState("");
    const isEvents = perspective === "events";

    const records = useMemo(() => {
        const search = query.trim().toLowerCase();

        if (isEvents) {
            return events
                .map((event) => ({
                    event,
                    booking: bookings.find((item) => item.eventId === event.eventId),
                    venue: venues.find((item) => item.venueId === event.venueId)
                }))
                .filter(({ event, booking, venue }) => {
                    const searchable = [
                        event.eventName,
                        event.eventDescription,
                        event.eventType,
                        event.eventAttendance,
                        venue?.venueName,
                        booking?.statusName,
                        booking?.specialRequirements
                    ].filter(Boolean).join(" ").toLowerCase();
                    return !search || searchable.includes(search);
                })
                .sort((a, b) => new Date(a.event.startDateTime) - new Date(b.event.startDateTime));
        }

        return bookings
            .map((booking) => ({
                booking,
                event: events.find((item) => item.eventId === booking.eventId),
                venue: venues.find((item) => item.venueId === booking.venueId)
            }))
            .filter(({ booking, event, venue }) => {
                const searchable = [
                    booking.eventName,
                    event?.eventName,
                    event?.eventDescription,
                    event?.eventType,
                    event?.eventAttendance,
                    booking.venueName,
                    venue?.venueName,
                    booking.statusName,
                    booking.specialRequirements,
                    booking.adminNotes
                ].filter(Boolean).join(" ").toLowerCase();
                return !search || searchable.includes(search);
            })
            .sort((a, b) => new Date(b.booking.bookingDate || b.booking.startDateTime) - new Date(a.booking.bookingDate || a.booking.startDateTime));
    }, [isEvents, events, bookings, venues, query]);

    const venueName = (record) =>
        record.venue?.venueName || record.booking?.venueName || "Venue not set";

    const eventName = (record) =>
        record.event?.eventName || record.booking?.eventName || "Untitled event";

    const renderDetails = (record) => {
        const event = record.event;
        const booking = record.booking;

        return (
            <div className="shared-record-details">
                <div className="shared-detail">
                    <span>Event type</span>
                    <strong>{event?.eventType || "Not provided"}</strong>
                </div>
                <div className="shared-detail">
                    <span>Expected attendees</span>
                    <strong>{event?.eventAttendance || "Not provided"}</strong>
                </div>
                <div className="shared-detail">
                    <span>Venue location</span>
                    <strong>{record.venue?.location || "Not provided"}</strong>
                </div>
                <div className="shared-detail">
                    <span>Venue capacity</span>
                    <strong>{record.venue?.capacity ?? "Not provided"}</strong>
                </div>
                <div className="shared-detail shared-detail-wide">
                    <span>Description</span>
                    <p>{event?.eventDescription || "No description provided."}</p>
                </div>
                {booking && (
                    <>
                        <div className="shared-detail">
                            <span>Booking reference</span>
                            <strong>{shortId(booking.bookingId)}</strong>
                        </div>
                        <div className="shared-detail">
                            <span>Submitted</span>
                            <strong>{formatDate(booking.bookingDate)}</strong>
                        </div>
                        <div className="shared-detail">
                            <span>Payment status</span>
                            <strong>{booking.paymentStatus || "Not started"}</strong>
                        </div>
                        <div className="shared-detail shared-detail-wide">
                            <span>Special requirements</span>
                            <p>{booking.specialRequirements || "None provided."}</p>
                        </div>
                        {booking.adminNotes && (
                            <div className="shared-detail shared-detail-wide shared-staff-note">
                                <span>Staff feedback</span>
                                <p>{booking.adminNotes}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <section className="workspace-view event-booking-workspace">
            <div className="workspace-toolbar shared-workspace-heading">
                <div>
                    <p className="section-kicker">YOUR WORKSPACE</p>
                    <h2>Events &amp; bookings</h2>
                    <p className="shared-workspace-subtitle">
                        One place for your event details and venue requests.
                    </p>
                </div>
                <label className="shared-workspace-search">
                    <span className="visually-hidden">Search events and bookings</span>
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by event, venue or status"
                    />
                </label>
            </div>

            <div className="shared-perspectives" role="tablist" aria-label="Workspace perspective">
                <button
                    type="button"
                    role="tab"
                    aria-selected={isEvents}
                    className={isEvents ? "active" : ""}
                    onClick={() => onChangePerspective("events")}
                >
                    <strong>My Events</strong>
                    <span>Plan and manage event details</span>
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={!isEvents}
                    className={!isEvents ? "active" : ""}
                    onClick={() => onChangePerspective("bookings")}
                >
                    <strong>My Bookings</strong>
                    <span>Track requests and approvals</span>
                </button>
            </div>

            <div className="shared-list-heading">
                <div>
                    <h3>{isEvents ? "Your events" : "Your venue requests"}</h3>
                    <p>{records.length} {records.length === 1 ? "record" : "records"}</p>
                </div>
            </div>

            {records.length === 0 ? (
                <Empty
                    title={query ? "No matching records" : isEvents ? "No events yet" : "No bookings yet"}
                    text={query ? "Try a different search." : isEvents ? "Create an event and submit its venue request to get started." : "Submit an event with a venue request to see it here."}
                />
            ) : (
                <div className="shared-record-list">
                    {records.map((record) => {
                        const event = record.event;
                        const booking = record.booking;
                        const status = booking?.statusName || "No booking";
                        const start = isEvents
                            ? event?.startDateTime || booking?.startDateTime
                            : booking?.startDateTime || event?.startDateTime;
                        const end = isEvents
                            ? event?.endDateTime || booking?.endDateTime
                            : booking?.endDateTime || event?.endDateTime;

                        return (
                            <article className="shared-record-card" key={isEvents ? event.eventId : booking.bookingId}>
                                <div className="shared-record-topline">
                                    <div className="shared-record-title">
                                        <p className="section-kicker">{isEvents ? "EVENT" : `BOOKING ${shortId(booking.bookingId)}`}</p>
                                        <h4>{eventName(record)}</h4>
                                        <p className="shared-record-meta">
                                            {venueName(record)} <span aria-hidden="true">·</span> {dateText(start)} <span aria-hidden="true">·</span> {timeText(start)}–{timeText(end)}
                                        </p>
                                    </div>
                                    <Status status={status} />
                                </div>

                                {renderDetails(record)}

                                <div className="shared-record-footer">
                                    <span className="shared-record-state">
                                        {booking
                                            ? status === "Rejected" && booking.adminNotes
                                                ? "Review the staff feedback above."
                                                : `Booking status: ${status}`
                                            : "This event does not have a venue booking yet."}
                                    </span>
                                    <div className="record-actions">
                                        {isEvents ? (
                                            <>
                                                <button type="button" onClick={() => onEditEvent(record.venue, event)}>Edit event</button>
                                                {booking ? (
                                                    <button type="button" onClick={() => onOpenBooking(booking)}>View booking</button>
                                                ) : (
                                                    <button type="button" onClick={() => onBookEvent(event)}>Book venue</button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" onClick={() => onOpenBooking(booking)}>Booking details</button>
                                                {status === "Pending" && <button type="button" onClick={() => onEditBooking(booking)}>Edit request</button>}
                                                {!["Cancelled", "Rejected", "Completed"].includes(status) && (
                                                    <button type="button" className="danger-link" disabled={saving} onClick={() => onCancelBooking(booking)}>Cancel</button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default EventBookingWorkspace;
