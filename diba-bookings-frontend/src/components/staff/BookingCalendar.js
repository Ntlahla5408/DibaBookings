import { useMemo, useState } from "react";
import { Badge, Button, Form } from "react-bootstrap";

const bookingDate = (booking) => booking.startDateTime || booking.eventDate || booking.date || "";
function parseDate(value) {
    if (!value) return null;
    const match = String(value).match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
    const date = match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
const keyFor = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const statusColor = (status) => ({ approved: "success", pending: "warning", rejected: "danger", cancelled: "secondary" }[String(status || "").toLowerCase()] || "light");

function BookingCalendar({ bookings = [], venues = [], onSelectBooking }) {
    const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
    const [selected, setSelected] = useState(() => new Date());
    const [status, setStatus] = useState("all");
    const [venueId, setVenueId] = useState("all");

    const filtered = useMemo(() => bookings.filter((b) =>
        (status === "all" || String(b.statusName || "").toLowerCase() === status) &&
        (venueId === "all" || String(b.venueId) === venueId) && Boolean(parseDate(bookingDate(b)))
    ), [bookings, status, venueId]);

    const byDay = useMemo(() => {
        const map = new Map();
        filtered.forEach((b) => {
            const date = parseDate(bookingDate(b));
            if (!date) return;
            const key = keyFor(date);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(b);
        });
        map.forEach((items) => items.sort((a, b) => {
            const x = Date.parse(bookingDate(a)); const y = Date.parse(bookingDate(b));
            return (Number.isNaN(x) ? 0 : x) - (Number.isNaN(y) ? 0 : y);
        }));
        return map;
    }, [filtered]);

    const cells = useMemo(() => {
        const first = new Date(month.getFullYear(), month.getMonth(), 1);
        const start = new Date(first);
        start.setDate(1 - ((first.getDay() + 6) % 7));
        return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
    }, [month]);

    const selectedKey = keyFor(selected);
    const dayBookings = byDay.get(selectedKey) || [];
    const todayKey = keyFor(new Date());
    const showToday = () => { const d = new Date(); setSelected(d); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); };
    const moveMonth = (n) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + n, 1));

    return (
        <section id="booking-calendar" className="panel mb-4" aria-label="Booking calendar">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                <div><p className="eyebrow mb-1">SCHEDULE</p><h2 className="mb-0">Booking calendar</h2><p className="text-muted mb-0">Select a day to review its bookings.</p></div>
                <div className="d-flex flex-wrap align-items-center gap-2">
                    <Button variant="outline-secondary" onClick={() => moveMonth(-1)} aria-label="Previous month">‹</Button>
                    <strong className="text-center" style={{ minWidth: 150 }}>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</strong>
                    <Button variant="outline-secondary" onClick={() => moveMonth(1)} aria-label="Next month">›</Button>
                    <Button variant="outline-primary" onClick={showToday}>Today</Button>
                </div>
            </div>
            <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6"><Form.Label htmlFor="calendar-status-filter">Booking status</Form.Label>
                    <Form.Select id="calendar-status-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option>
                    </Form.Select>
                </div>
                <div className="col-12 col-sm-6"><Form.Label htmlFor="calendar-venue-filter">Venue</Form.Label>
                    <Form.Select id="calendar-venue-filter" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
                        <option value="all">All venues</option>{venues.map((v) => <option key={v.venueId} value={String(v.venueId)}>{v.venueName || `Venue ${v.venueId}`}</option>)}
                    </Form.Select>
                </div>
            </div>
            <div className="d-flex flex-wrap gap-3 small mb-3">
                {[["Approved", "success"], ["Pending", "warning"], ["Rejected", "danger"], ["Cancelled", "secondary"]].map(([label, color]) => <span key={label}><Badge bg={color} text={color === "warning" ? "dark" : undefined}>{label}</Badge></span>)}
            </div>
            <div className="table-responsive"><div style={{ minWidth: 650 }}>
                <div className="d-grid" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="text-center fw-semibold py-2 border-bottom">{d}</div>)}
                    {cells.map((date) => {
                        const key = keyFor(date); const items = byDay.get(key) || [];
                        const inMonth = date.getMonth() === month.getMonth(); const isSelected = key === selectedKey;
                        return <button key={key} type="button" onClick={() => setSelected(date)} aria-pressed={isSelected} aria-label={`${date.toLocaleDateString()}, ${items.length} booking(s)`}
                            className={`text-start border rounded-2 p-2 ${isSelected ? "border-primary border-2 bg-primary bg-opacity-10" : "border-light-subtle"} ${inMonth ? "" : "bg-body-secondary"}`}
                            style={{ minHeight: 105, minWidth: 0, opacity: inMonth ? 1 : 0.58 }}>
                            <div className="d-flex justify-content-between align-items-center mb-1"><span className={`small fw-semibold ${key === todayKey ? "text-primary" : ""}`}>{date.getDate()}</span>{items.length > 0 && <span className="badge rounded-pill text-bg-secondary">{items.length}</span>}</div>
                            {items.slice(0, 2).map((b, i) => <div key={b.bookingId || b.id || i} className="mb-1"><Badge bg={statusColor(b.statusName)} text={["pending", "", "unknown"].includes(String(b.statusName || "").toLowerCase()) ? "dark" : undefined} className="d-block text-truncate" title={b.eventName || "Booking"}>{b.eventName || "Booking"}</Badge></div>)}
                            {items.length > 2 && <div className="small text-muted">+{items.length - 2} more</div>}
                        </button>;
                    })}
                </div>
            </div></div>
            <div className="mt-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2"><h3 className="h5 mb-0">{selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3><Badge bg="light" text="dark">{dayBookings.length} booking{dayBookings.length === 1 ? "" : "s"}</Badge></div>
                {dayBookings.length === 0 ? <p className="text-muted mb-0">No bookings for this day with the current filters.</p> : <div className="d-flex flex-column gap-2">
                    {dayBookings.map((b, i) => {
                        const venue = venues.find((v) => String(v.venueId) === String(b.venueId));
                        const parsed = b.startDateTime ? new Date(b.startDateTime) : null;
                        const time = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                        return <div key={b.bookingId || b.id || i} className="border rounded-2 p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div><strong>{b.eventName || "Untitled event"}</strong><div className="small text-muted">{[time, b.venueName || venue?.venueName, b.organiserName].filter(Boolean).join(" · ") || "Booking details unavailable"}</div><Badge className="mt-1" bg={statusColor(b.statusName)} text={String(b.statusName || "").toLowerCase() === "pending" ? "dark" : undefined}>{b.statusName || "Unknown status"}</Badge></div>
                            <Button type="button" size="sm" variant="outline-primary" onClick={() => onSelectBooking?.(b)}>View details</Button>
                        </div>;
                    })}
                </div>}
            </div>
        </section>
    );
}

export default BookingCalendar;
