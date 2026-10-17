
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Form, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";

import DashboardShell from "../../components/common/DashboardShell";
import LoadingIndicator from "../../components/common/LoadingIndicator";
import StatCard from "../../components/common/StatCard";
import {
    approveBooking,
    getBookings,
    rejectBooking
} from "../../services/bookingService";
import { getVenues } from "../../services/venueService";
import { shortId } from "../../utils/dashboardUtils";
import { clearSession } from "../../utils/sessionUtils";
import { dateText, timeText } from "../../utils/dateUtils";
import StaffVenueManagement from "../../components/staff/VenueManagement";
import BookingCalendar from "../../components/staff/BookingCalendar";

function getErrorMessage(error, fallback) {
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
        return responseData;
    }

    if (responseData && typeof responseData === "object") {
        if (typeof responseData.message === "string") {
            return responseData.message;
        }

        if (typeof responseData.title === "string") {
            return responseData.title;
        }

        if (responseData.errors && typeof responseData.errors === "object") {
            const messages = Object.values(responseData.errors)
                .flat()
                .filter((message) => typeof message === "string");

            if (messages.length) {
                return messages.join(" ");
            }
        }
    }

    if (!error.response) {
        return "Unable to reach the server. Check your connection and try again.";
    }

    return fallback;
}

function getBookingDate(booking) {
    return booking.startDateTime || booking.bookingDate || booking.date || "";
}

function getEventStartDate(booking) {
    return booking.startDateTime || booking.eventDate || booking.date || "";
}

function getLocalDayStart(value) {
    if (!value) return null;

    // Preserve date-only values as the calendar day supplied by the API.
    const dateOnlyMatch = String(value).match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
    const parsedDate = dateOnlyMatch
        ? new Date(
            Number(dateOnlyMatch[1]),
            Number(dateOnlyMatch[2]) - 1,
            Number(dateOnlyMatch[3])
        )
        : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) return null;

    return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
}

function getDisplayName(value, fallback = "Not provided") {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return String(value);
}

function getStatusVariant(status) {
    switch ((status || "").toLowerCase()) {
        case "pending":
            return "warning";
        case "approved":
            return "success";
        case "rejected":
            return "danger";
        case "cancelled":
            return "secondary";
        default:
            return "light";
    }
}

function formatLabel(key) {
    return key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/^./, (character) => character.toUpperCase());
}

function BookingDetails({ booking, venue }) {
    if (!booking) return null;

    const knownFields = [
        ["Booking reference", booking.bookingId ?? booking.id],
        ["Event name", booking.eventName],
        ["Status", booking.statusName],
        ["Organiser", booking.organiserName],
        ["Organiser user ID", booking.userId],
        ["Venue", booking.venueName || venue?.venueName],
        ["Venue ID", booking.venueId],
        ["Start date", booking.startDateTime ? dateText(booking.startDateTime) : null],
        ["Start time", booking.startDateTime ? timeText(booking.startDateTime) : null],
        ["End date", booking.endDateTime ? dateText(booking.endDateTime) : null],
        ["End time", booking.endDateTime ? timeText(booking.endDateTime) : null],
        ["Booking date", booking.bookingDate ? dateText(booking.bookingDate) : null],
        ["Purpose", booking.purpose || booking.eventDescription || booking.description],
        ["Expected attendees", booking.attendance ?? booking.expectedAttendees ?? booking.numberOfAttendees],
        ["Acknowledgement", booking.acknowledgementStatus ?? booking.bookingAcknowledgement],
        ["Payment status", booking.paymentStatus],
        ["Rejection reason", booking.rejectionReason]
    ];

    const displayedFields = knownFields.filter(
        ([, value]) => value !== null && value !== undefined && value !== ""
    );

    const excludedKeys = new Set([
        "bookingId",
        "id",
        "eventName",
        "statusName",
        "organiserName",
        "userId",
        "venueName",
        "venueId",
        "startDateTime",
        "endDateTime",
        "bookingDate",
        "purpose",
        "eventDescription",
        "description",
        "attendance",
        "expectedAttendees",
        "numberOfAttendees",
        "acknowledgementStatus",
        "bookingAcknowledgement",
        "paymentStatus",
        "rejectionReason"
    ]);

    // Show other scalar fields returned by the API without exposing nested objects.
    const additionalFields = Object.entries(booking).filter(
        ([key, value]) =>
            !excludedKeys.has(key) &&
            value !== null &&
            value !== undefined &&
            value !== "" &&
            ["string", "number", "boolean"].includes(typeof value) &&
            !/password|token|secret/i.test(key)
    );



    return (
        <div>
            <div className="d-flex align-items-center gap-2 mb-3">
                <h5 className="mb-0">
                    {booking.eventName || "Booking details"}
                </h5>
                <Badge bg={getStatusVariant(booking.statusName)} text="dark">
                    {booking.statusName || "Unknown"}
                </Badge>
            </div>

            <h6 className="mt-3">Booking information</h6>
            <Table bordered responsive size="sm">
                <tbody>
                    {displayedFields.map(([label, value]) => (
                        <tr key={label}>
                            <th style={{ width: "40%" }}>{label}</th>
                            <td>{String(value)}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {venue && (
                <>
                    <h6 className="mt-4">Venue information</h6>
                    <Table bordered responsive size="sm">
                        <tbody>
                            {[
                                ["Venue name", venue.venueName],
                                ["Location", venue.location],
                                ["Capacity", venue.capacity],
                                ["Venue status", venue.venueStatus]
                            ]
                                .filter(([, value]) =>
                                    value !== null &&
                                    value !== undefined &&
                                    value !== ""
                                )
                                .map(([label, value]) => (
                                    <tr key={label}>
                                        <th style={{ width: "40%" }}>{label}</th>
                                        <td>{String(value)}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </>
            )}

            {additionalFields.length > 0 && (
                <>
                    <h6 className="mt-4">Additional booking information</h6>
                    <Table bordered responsive size="sm">
                        <tbody>
                            {additionalFields.map(([key, value]) => (
                                <tr key={key}>
                                    <th style={{ width: "40%" }}>
                                        {formatLabel(key)}
                                    </th>
                                    <td>{String(value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}
        </div>
    );
}

function StaffDashboard() {
    const [bookings, setBookings] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingBookingId, setProcessingBookingId] = useState(null);
    const [managedVenue, setManagedVenue] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [venueFilter, setVenueFilter] = useState("all");
    const [sortField, setSortField] = useState("date");
    const [sortDirection, setSortDirection] = useState("asc");

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rejectionBooking, setRejectionBooking] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [submittingRejection, setSubmittingRejection] = useState(false);

    const firstName = localStorage.getItem("firstName") || "Staff member";

    const loadData = async (showLoading = false) => {
        if (showLoading) setLoading(true);

        try {
            const [bookingResponse, venueResponse] = await Promise.all([
                getBookings(),
                getVenues()
            ]);

const bookingList = Array.isArray(bookingResponse.data)
    ? bookingResponse.data
    : [];

const venueList = Array.isArray(venueResponse.data)
    ? venueResponse.data
    : [];

setBookings(bookingList);
setVenues(venueList);

return venueList;
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Could not load the staff workspace.")
            );
        } finally {
            setLoading(false);
        }

        return null;
    };

    useEffect(() => {
        loadData(true);
        // Initial load only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const statuses = useMemo(
        () =>
            [...new Set(
                bookings
                    .map((booking) => booking.statusName)
                    .filter((status) => typeof status === "string" && status.trim())
            )].sort((a, b) => a.localeCompare(b)),
        [bookings]
    );

    const filteredBookings = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return bookings.filter((booking) => {
            const matchesSearch =
                !query ||
                [
                    booking.eventName,
                    booking.organiserName,
                    booking.bookingId,
                    booking.eventId,
                    booking.userId
                ].some((value) =>
                    value !== null &&
                    value !== undefined &&
                    String(value).toLowerCase().includes(query)
                );

            const matchesStatus =
                statusFilter === "all" ||
                booking.statusName === statusFilter;

            const matchesVenue =
                venueFilter === "all" ||
                String(booking.venueId) === venueFilter;

            return matchesSearch && matchesStatus && matchesVenue;
        });
    }, [bookings, searchTerm, statusFilter, venueFilter]);

    const today = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, []);

    const upcomingBookings = useMemo(() => {
        const lastDay = new Date(today);
        lastDay.setDate(lastDay.getDate() + 7);

        return bookings
            .filter((booking) => {
                const status = String(booking.statusName || "").toLowerCase();
                if (status === "rejected" || status === "cancelled") return false;

                const eventDay = getLocalDayStart(getEventStartDate(booking));
                return eventDay && eventDay >= today && eventDay <= lastDay;
            })
            .sort((first, second) => {
                const firstDate = Date.parse(getEventStartDate(first));
                const secondDate = Date.parse(getEventStartDate(second));
                return (Number.isNaN(firstDate) ? 0 : firstDate) -
                    (Number.isNaN(secondDate) ? 0 : secondDate);
            });
    }, [bookings, today]);

    const pendingBookings = useMemo(
        () => bookings
            .filter((booking) => String(booking.statusName || "").toLowerCase() === "pending")
            .sort((first, second) => {
                const firstDate = Date.parse(getBookingDate(first));
                const secondDate = Date.parse(getBookingDate(second));
                return (Number.isNaN(firstDate) ? 0 : firstDate) -
                    (Number.isNaN(secondDate) ? 0 : secondDate);
            })
            .slice(0, 5),
        [bookings]
    );

    const pendingBookingCount = bookings.filter(
        (booking) => String(booking.statusName || "").toLowerCase() === "pending"
    ).length;

    const unavailableVenues = useMemo(
        () => venues.filter(
            (venue) => String(venue.venueStatus || "").toLowerCase() === "unavailable"
        ),
        [venues]
    );

    const sortedBookings = useMemo(() => {
        const getName = (value, fallback = "") =>
            String(value ?? fallback).trim();

        return [...filteredBookings].sort((first, second) => {
            let comparison = 0;

            switch (sortField) {
                case "event":
                    comparison = getName(first.eventName, first.eventId).localeCompare(
                        getName(second.eventName, second.eventId),
                        undefined,
                        { sensitivity: "base", numeric: true }
                    );
                    break;

                case "organiser":
                    comparison = getName(
                        first.organiserName,
                        first.userId
                    ).localeCompare(
                        getName(second.organiserName, second.userId),
                        undefined,
                        { sensitivity: "base", numeric: true }
                    );
                    break;

                case "venue":
                    comparison = getName(
                        first.venueName ||
                            venues.find((venue) =>
                                String(venue.venueId) === String(first.venueId)
                            )?.venueName,
                        first.venueId
                    ).localeCompare(
                        getName(
                            second.venueName ||
                                venues.find((venue) =>
                                    String(venue.venueId) === String(second.venueId)
                                )?.venueName,
                            second.venueId
                        ),
                        undefined,
                        { sensitivity: "base", numeric: true }
                    );
                    break;

                case "status":
                    comparison = getName(first.statusName).localeCompare(
                        getName(second.statusName),
                        undefined,
                        { sensitivity: "base" }
                    );
                    break;

                case "date": {
                    const firstDate = Date.parse(getBookingDate(first));
                    const secondDate = Date.parse(getBookingDate(second));

                    const safeFirstDate = Number.isNaN(firstDate)
                        ? 0
                        : firstDate;
                    const safeSecondDate = Number.isNaN(secondDate)
                        ? 0
                        : secondDate;

                    comparison = safeFirstDate - safeSecondDate;
                    break;
                }

                default:
                    break;
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [filteredBookings, sortField, sortDirection, venues]);

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setVenueFilter("all");
        setSortField("date");
        setSortDirection("asc");
    };

    const reviewBooking = async (booking) => {
        setProcessingBookingId(booking.bookingId);

        try {
            await approveBooking(booking.bookingId);
            toast.success("Booking approved.");
            setSelectedBooking(null);
            await loadData();
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Could not approve the booking.")
            );
        } finally {
            setProcessingBookingId(null);
        }
    };

    const openRejectionDialog = (booking) => {
        setRejectionBooking(booking);
        setRejectionReason("");
    };

    const closeRejectionDialog = () => {
        if (submittingRejection) return;

        setRejectionBooking(null);
        setRejectionReason("");
    };

    const submitRejection = async (event) => {
        event.preventDefault();

        const reason = rejectionReason.trim();

        if (!reason) {
            toast.error("Enter a reason before rejecting this booking.");
            return;
        }

        if (!rejectionBooking) return;

        const booking = rejectionBooking;
        setSubmittingRejection(true);
        setProcessingBookingId(booking.bookingId);

        try {
            await rejectBooking(booking.bookingId, reason);
            toast.success("Booking rejected.");
            setRejectionBooking(null);
            setSelectedBooking(null);
            setRejectionReason("");
            await loadData();
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Could not reject the booking.")
            );
        } finally {
            setSubmittingRejection(false);
            setProcessingBookingId(null);
        }
    };

    const selectedVenue = selectedBooking
        ? venues.find(
            (venue) =>
                String(venue.venueId) === String(selectedBooking.venueId)
        )
        : null;

    return (
        <DashboardShell
            title="Dashboard"
            onLogout={clearSession}
            profileLabel={firstName}
        >
            {loading ? (
                <LoadingIndicator />
            ) : (
                <>
                    <section className="d-flex flex-nowrap gap-3 mb-4 overflow-auto pb-2" aria-label="Staff quick overview">
                        <StatCard
                            label="Pending review"
                            value={bookings.filter(
                                (booking) => booking.statusName === "Pending"
                            ).length}
                            tone="amber"
                        />
                        <StatCard
                            label="Approved"
                            value={bookings.filter(
                                (booking) => booking.statusName === "Approved"
                            ).length}
                            tone="green"
                        />
                        <StatCard label="Venues" value={venues.length} />
                        <StatCard
                            label="Available venues"
                            value={venues.filter(
                                (venue) => venue.venueStatus === "Available"
                            ).length}
                            tone="ink"
                        />
                    </section>

                    <section id="staff-upcoming" className="d-flex flex-nowrap gap-3 mb-4 overflow-auto pb-2" aria-label="Daily operations overview">
                        <div className="flex-shrink-0" style={{ width: "min(420px, 88vw)" }}>
                            <div className="panel h-100">
                                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                                    <div>
                                        
                                        <h2>Upcoming bookings</h2>
                                    </div>
                                    <Badge bg="primary">{upcomingBookings.length}</Badge>
                                </div>
                                {upcomingBookings.length === 0 ? (
                                    <p className="text-muted mb-0">No upcoming bookings found for the next 7 days.</p>
                                ) : (
                                    <div className="d-grid gap-3">
                                        {upcomingBookings.slice(0, 5).map((booking) => (
                                            <div key={booking.bookingId} className="border-bottom pb-2">
                                                <div className="d-flex justify-content-between align-items-start gap-2">
                                                    <strong>{getDisplayName(booking.eventName, "Untitled event")}</strong>
                                                    <Badge bg={getStatusVariant(booking.statusName)} text="dark">
                                                        {booking.statusName || "Unknown"}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted small mb-1">
                                                    {dateText(getEventStartDate(booking))}
                                                    {booking.startDateTime ? ` · ${timeText(booking.startDateTime)}` : ""}
                                                </p>
                                                <p className="small mb-2">
                                                    {getDisplayName(
                                                        booking.venueName ||
                                                            venues.find((item) => String(item.venueId) === String(booking.venueId))?.venueName,
                                                        "Venue not specified"
                                                    )}
                                                </p>
                                                <Button type="button" size="sm" variant="outline-primary"
                                                    onClick={() => setSelectedBooking(booking)}>
                                                    View booking
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="col-12 col-lg-4">
                            <div className="panel h-100" id="staff-pending">
                                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                                    <div>
                                        
                                        <h2>Pending decisions</h2>
                                    </div>
                                    <Badge bg={pendingBookingCount ? "warning" : "success"} text="dark">
                                        {pendingBookingCount}
                                    </Badge>
                                </div>
                                {pendingBookings.length === 0 ? (
                                    <p className="text-muted mb-0">There are no booking requests waiting for review.</p>
                                ) : (
                                    <div className="d-grid gap-3">
                                        {pendingBookings.map((booking) => (
                                            <div key={booking.bookingId} className="border-bottom pb-2">
                                                <strong>{getDisplayName(booking.eventName, "Untitled event")}</strong>
                                                <p className="text-muted small mb-2">
                                                    {getDisplayName(booking.organiserName, "Organiser not specified")}
                                                    {" · "}
                                                    {getDisplayName(
                                                        booking.venueName ||
                                                            venues.find((item) => String(item.venueId) === String(booking.venueId))?.venueName,
                                                        "Venue not specified"
                                                    )}
                                                </p>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <Button type="button" size="sm" variant="outline-primary"
                                                        onClick={() => setSelectedBooking(booking)}>
                                                        Review
                                                    </Button>
                                                    <Button type="button" size="sm" variant="success"
                                                        disabled={processingBookingId !== null}
                                                        onClick={() => reviewBooking(booking)}>
                                                        {processingBookingId === booking.bookingId ? "Processing..." : "Approve"}
                                                    </Button>
                                                    <Button type="button" size="sm" variant="outline-danger"
                                                        disabled={processingBookingId !== null}
                                                        onClick={() => openRejectionDialog(booking)}>
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="col-12 col-lg-4">
                            <div className="panel h-100">
                                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                                    <div>
                                        
                                        <h2>Unavailable venues</h2>
                                    </div>
                                    <Badge bg={unavailableVenues.length ? "secondary" : "success"}>
                                        {unavailableVenues.length}
                                    </Badge>
                                </div>
                                {unavailableVenues.length === 0 ? (
                                    <p className="text-muted mb-0">All venues are currently marked available.</p>
                                ) : (
                                    <div className="d-grid gap-3">
                                        {unavailableVenues.map((venue) => (
                                            <div key={venue.venueId} className="border-bottom pb-2">
                                                <strong>{venue.venueName || "Unnamed venue"}</strong>
                                                <p className="text-muted small mb-2">
                                                    {venue.location || "Location not provided"}
                                                    {venue.capacity ? ` · Capacity ${venue.capacity}` : ""}
                                                </p>
                                                <Button type="button" size="sm" variant="outline-primary"
                                                    onClick={() => setManagedVenue(venue)}>
                                                    Manage venue
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="content-grid" id="all-bookings">
                        <div className="panel table-panel">
                            <div className="panel-heading d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    
                                    <h2>All bookings</h2>

                                </div>
                                <Button
                                    type="button"
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => loadData()}
                                >
                                    Refresh
                                </Button>
                            </div>

                            <Form className="mb-3">
                                <div className="row g-3">
                                    <div className="col-12 col-lg-6">
                                        <Form.Label>Search bookings</Form.Label>
                                        <Form.Control
                                            type="search"
                                            placeholder="Event, organiser, or booking reference"
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(event.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="col-12 col-sm-6 col-lg-3">
                                        <Form.Label>Filter by status</Form.Label>
                                        <Form.Select
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(event.target.value)
                                            }
                                        >
                                            <option value="all">All statuses</option>
                                            {statuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>

                                    <div className="col-12 col-sm-6 col-lg-3">
                                        <Form.Label>Filter by venue</Form.Label>
                                        <Form.Select
                                            value={venueFilter}
                                            onChange={(event) =>
                                                setVenueFilter(event.target.value)
                                            }
                                        >
                                            <option value="all">All venues</option>
                                            {venues.map((venue) => (
                                                <option
                                                    key={venue.venueId}
                                                    value={String(venue.venueId)}
                                                >
                                                    {venue.venueName}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>

                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <Form.Label>Sort by</Form.Label>
                                        <Form.Select
                                            value={sortField}
                                            onChange={(event) =>
                                                setSortField(event.target.value)
                                            }
                                        >
                                            <option value="date">Booking date</option>
                                            <option value="event">Event name</option>
                                            <option value="organiser">Organiser name</option>
                                            <option value="venue">Venue name</option>
                                            <option value="status">Booking status</option>
                                        </Form.Select>
                                    </div>

                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <Form.Label>Sort direction</Form.Label>
                                        <Form.Select
                                            value={sortDirection}
                                            onChange={(event) =>
                                                setSortDirection(event.target.value)
                                            }
                                        >
                                            <option value="asc">Ascending</option>
                                            <option value="desc">Descending</option>
                                        </Form.Select>
                                    </div>

                                    <div className="col-12 col-lg-4 d-flex align-items-end">
                                        <Button
                                            type="button"
                                            variant="outline-secondary"
                                            onClick={clearFilters}
                                        >
                                            Clear filters
                                        </Button>
                                    </div>
                                </div>
                            </Form>

                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Event</th>
                                        <th>Organiser</th>
                                        <th>Venue</th>
                                        <th>Booking date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedBookings.map((booking) => {
                                        const isProcessing =
                                            processingBookingId === booking.bookingId;

                                        const venue = venues.find(
                                            (item) =>
                                                String(item.venueId) ===
                                                String(booking.venueId)
                                        );

                                        return (
                                            <tr key={booking.bookingId}>
                                                <td>
                                                    {getDisplayName(
                                                        booking.eventName,
                                                        shortId(booking.eventId)
                                                    )}
                                                </td>
                                                <td>
                                                    {getDisplayName(
                                                        booking.organiserName,
                                                        shortId(booking.userId)
                                                    )}
                                                </td>
                                                <td>
                                                    {getDisplayName(
                                                        booking.venueName || venue?.venueName,
                                                        shortId(booking.venueId)
                                                    )}
                                                </td>
                                                <td>
                                                    {dateText(getBookingDate(booking))}
                                                </td>
                                                <td>
                                                    <Badge
                                                        bg={getStatusVariant(booking.statusName)}
                                                        text="dark"
                                                    >
                                                        {booking.statusName || "Unknown"}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() =>
                                                                setSelectedBooking(booking)
                                                            }
                                                        >
                                                            View details
                                                        </Button>

                                                        {booking.statusName === "Pending" && (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="success"
                                                                    disabled={processingBookingId !== null}
                                                                    onClick={() => reviewBooking(booking)}
                                                                >
                                                                    {isProcessing ? "Processing..." : "Approve"}
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline-danger"
                                                                    disabled={processingBookingId !== null}
                                                                    onClick={() =>
                                                                        openRejectionDialog(booking)
                                                                    }
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {sortedBookings.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4">
                                                No bookings match your search or filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        <div className="panel" id="staff-venues">
                            
                            <h2>Venues</h2>

                            {venues.length === 0 && (
                                <p className="text-muted">
                                    No venues are available to display.
                                </p>
                            )}

                            {venues.map((venue) => (
                                <div className="compact-row" key={venue.venueId}>
                                    <div>
                                        <strong>{venue.venueName}</strong>
                                        <p>
                                            {venue.location} / capacity {venue.capacity}
                                        </p>
                                    </div>
                                    <Badge
                                        bg={
                                            venue.venueStatus === "Available"
                                                ? "success"
                                                : "secondary"
                                        }
                                    >
                                        {venue.venueStatus || "Unknown"}
                                    </Badge>

                                    <Button
    type="button"
    size="sm"
    variant="outline-primary"
    className="mt-2"
    onClick={() => setManagedVenue(venue)}
>
    Manage
</Button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <BookingCalendar
                        bookings={bookings}
                        venues={venues}
                        onSelectBooking={setSelectedBooking}
                    />
                </>
            )}

            <Modal
                show={Boolean(selectedBooking)}
                onHide={() => setSelectedBooking(null)}
                centered
                size="lg"
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title>Booking details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <BookingDetails
                        booking={selectedBooking}
                        venue={selectedVenue}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSelectedBooking(null)}
                    >
                        Close
                    </Button>

                    {selectedBooking?.statusName === "Pending" && (
                        <>
                            <Button
                                type="button"
                                variant="success"
                                disabled={processingBookingId !== null}
                                onClick={() => reviewBooking(selectedBooking)}
                            >
                                Approve booking
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                disabled={processingBookingId !== null}
                                onClick={() => openRejectionDialog(selectedBooking)}
                            >
                                Reject booking
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            <Modal
                show={Boolean(rejectionBooking)}
                onHide={closeRejectionDialog}
                centered
                backdrop={submittingRejection ? "static" : true}
                keyboard={!submittingRejection}
            >
                <Form onSubmit={submitRejection}>
                    <Modal.Header closeButton={!submittingRejection}>
                        <Modal.Title>Reject booking</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Please provide a reason for rejecting{" "}
                            <strong>
                                {rejectionBooking?.eventName || "this booking"}
                            </strong>.
                        </p>

                        <Form.Group controlId="rejectionReason">
                            <Form.Label>Reason for rejection</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                maxLength={1000}
                                value={rejectionReason}
                                onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                }
                                placeholder="Explain why this booking cannot be approved..."
                                required
                                autoFocus
                                disabled={submittingRejection}
                            />
                            <Form.Text muted>
                                {rejectionReason.trim().length}/1000 characters
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={submittingRejection}
                            onClick={closeRejectionDialog}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            disabled={
                                submittingRejection ||
                                !rejectionReason.trim() ||
                                rejectionReason.trim().length > 1000
                            }
                        >
                            {submittingRejection ? "Rejecting..." : "Confirm rejection"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <StaffVenueManagement
    venue={managedVenue}
    onClose={() => setManagedVenue(null)}
    onSaved={async () => {
        const refreshedVenues = await loadData();

        if (Array.isArray(refreshedVenues)) {
            const refreshedVenue = refreshedVenues.find(
                (item) =>
                    String(item.venueId) === String(managedVenue?.venueId)
            );

            if (refreshedVenue) {
                setManagedVenue(refreshedVenue);
            }
        }
    }}
/>
        </DashboardShell>
    );
}

export default StaffDashboard;
