import { useState } from "react";
import { Link } from "react-router-dom";
import FormIntro from "./EventFormIntro";
import Field from "./EventFormField";
import FormActions from "./EventFormActions";
import BookingCalendar from "../bookings/BookingAvailabilityCalendar";

function EventForm({
    form,
    setForm,
    selectedVenue,
    venues,
    saving,
    editing,
    onSubmit,
    onChangeVenue,
    onCancel
}) {
    const [showCalendar, setShowCalendar] = useState(false);
    const minimumBookingDate = new Date();
    minimumBookingDate.setDate(minimumBookingDate.getDate() + 7);
    minimumBookingDate.setHours(0, 0, 0, 0);
    const [selectedDate, setSelectedDate] = useState(
        form.startDateTime
            ? new Date(form.startDateTime)
            : null
    );

    const handleDateSelect = (date) => {
        setSelectedDate(date);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const startTime = form.startDateTime?.split("T")[1]?.slice(0, 5) || "09:00";
        const endTime = form.endDateTime?.split("T")[1]?.slice(0, 5) || "10:00";

        setForm({
            ...form,
            startDateTime: `${year}-${month}-${day}T${startTime}`,
            endDateTime: `${year}-${month}-${day}T${endTime}`
        });
    };

    return (
        <section className="form-view">
            <button
                type="button"
                className="back-link event-form-back"
                onClick={onCancel}
            >
                <span aria-hidden="true">←</span> Back
            </button>

            <FormIntro
                title={editing ? "Edit event" : "Create booking"}
                text="Your event details and venue request will be submitted together for staff approval."
            />

            <form
                className="workflow-form"
                onSubmit={onSubmit}
            >
                <div className="form-grid">

                    <Field label="Event name" required>
                        <input
                            required
                            value={form.eventName}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    eventName: e.target.value
                                })
                            }
                        />
                    </Field>

                    <Field label="Event type">
                        <input
                            placeholder="Conference, meeting, workshop..."
                            value={form.eventType}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    eventType: e.target.value
                                })
                            }
                        />
                    </Field>

                    <Field label="Venue" required>
                        <select
                            required
                            value={form.venueId || selectedVenue?.venueId || ""}
                            onChange={(e) => {
                                const venue = venues.find(
                                    (item) => item.venueId === e.target.value
                                );

                                setForm({
                                    ...form,
                                    venueId: e.target.value
                                });

                                onChangeVenue(venue || null);
                            }}
                        >
                            <option value="">Choose a venue</option>
                            {venues.map((venue) => (
                                <option
                                    key={venue.venueId}
                                    value={venue.venueId}
                                >
                                    {venue.venueName}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Expected attendees" required>
                        <input
                            type="number"
                            min="1"
                            max={selectedVenue?.capacity ?? undefined}
                            step="1"
                            required
                            value={form.eventAttendance}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    eventAttendance: e.target.value
                                })
                            }
                            placeholder="e.g. 50"
                        />
                        {selectedVenue?.capacity != null && Number(form.eventAttendance) > Number(selectedVenue.capacity) && (
                            <span className="field-error" role="alert">
                                This venue holds a maximum of {selectedVenue.capacity} attendees.
                            </span>
                        )}
                    </Field>
                </div>

                {!editing && selectedVenue && (
                    <div className="calendar-popup-anchor">
                        <button
                            type="button"
                            className="calendar-toggle-button"
                            aria-label={showCalendar ? "Close date and availability picker" : "Choose date and available times"}
                            title={showCalendar ? "Close date and availability picker" : "Choose date and available times"}
                            aria-expanded={showCalendar}
                            onClick={() => setShowCalendar((visible) => !visible)}
                        >
                            <span className="calendar-selected-date">
                                {selectedDate
                                    ? selectedDate.toLocaleDateString([], {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric"
                                      })
                                    : "Select booking date"}
                            </span>
                            <span aria-hidden="true">▦</span>
                        </button>

                        {showCalendar && (
                            <div className="calendar-popup" role="dialog" aria-label="Choose booking date and availability">
                                <div className="calendar-popup-heading">
                                    <strong>Choose a date</strong>
                                    <span className="form-note">Book at least 7 days in advance.</span>
                                    <button
                                        type="button"
                                        className="calendar-popup-close"
                                        aria-label="Close calendar"
                                        onClick={() => setShowCalendar(false)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <BookingCalendar
                                    selectedDate={selectedDate}
                                    minimumDate={minimumBookingDate}
                                    onDateSelect={handleDateSelect}
                                    venueId={form.venueId}
                                    onTimeSelect={(slot) => {
                                        const toLocalInput = (date) => {
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                            const day = String(date.getDate()).padStart(2, "0");
                                            const hours = String(date.getHours()).padStart(2, "0");
                                            const minutes = String(date.getMinutes()).padStart(2, "0");
                                            return `${year}-${month}-${day}T${hours}:${minutes}`;
                                        };

                                        setForm({
                                            ...form,
                                            startDateTime: toLocalInput(slot.start),
                                            endDateTime: toLocalInput(slot.end)
                                        });
                                        setShowCalendar(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="form-grid">

                    <Field label="Start time" required>
                        <input required type="time"
                            value={form.startDateTime?.split("T")[1]?.slice(0, 5) || ""}
                            onChange={(e) => {
                                const datePart = form.startDateTime?.split("T")[0] ||
                                    (selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}` : "");
                                setForm({ ...form, startDateTime: datePart ? `${datePart}T${e.target.value}` : "" });
                            }}
                        />
                    </Field>

                    <Field label="End time" required>
                        <input required type="time"
                            value={form.endDateTime?.split("T")[1]?.slice(0, 5) || ""}
                            onChange={(e) => {
                                const datePart = form.endDateTime?.split("T")[0] || form.startDateTime?.split("T")[0] ||
                                    (selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}` : "");
                                setForm({ ...form, endDateTime: datePart ? `${datePart}T${e.target.value}` : "" });
                            }}
                        />
                    </Field>
                </div>

                <Field label="Description" required>
                    <textarea
                        required
                        rows="4"
                        value={form.eventDescription}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                eventDescription: e.target.value
                            })
                        }
                    />
                </Field>

                {!editing && (
                    <Field label="Special requirements">
                        <textarea
                            rows="3"
                            value={form.specialRequirements || ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    specialRequirements: e.target.value
                                })
                            }
                            placeholder="Accessibility needs, room layout, equipment, catering, or other arrangements..."
                        />
                    </Field>
                )}

                {!editing && (
                    <>
                        <div className="booking-acknowledgement">
                            <label className="acknowledgement-label">
                                <input
                                    type="checkbox"
                                    required
                                    checked={form.acknowledgementAccepted || false}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            acknowledgementAccepted: event.target.checked
                                        })
                                    }
                                />
                                <span>
                                    I confirm that the information provided is complete and accurate, and I have read and agree to the <Link to="/dashboard?view=policies">Terms and Conditions</Link>, including the venue rules and booking requirements.
                                </span>
                            </label>
                        </div>
                        <p className="form-note">
                            This submits the event and venue booking as one action. Status after submission: <strong>Pending approval</strong>
                        </p>
                    </>
                )}

                <FormActions
                    saving={saving}
                    submit={
                        editing
                            ? "Save Changes"
                            : "Submit Event & Booking"
                    }
                    onCancel={onCancel}
                />
            </form>
        </section>
    );
}

export default EventForm;