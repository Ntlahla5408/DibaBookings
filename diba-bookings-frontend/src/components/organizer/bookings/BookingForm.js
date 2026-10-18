import FormIntro from "../events/EventFormIntro";
import Field from "../events/EventFormField";
import FormActions from "../events/EventFormActions";

const dateText = (value) =>
    value
        ? new Date(value).toLocaleDateString([], {
              day: "2-digit",
              month: "short",
              year: "numeric"
          })
        : "Not selected";

const timeText = (value) =>
    value
        ? new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
          })
        : "Not selected";

function BookingForm({
    form,
    setForm,
    selectedVenue,
    events,
    venues,
    saving,
    editing,
    onSubmit,
    onCancel
}) {
    const event = events.find((item) => item.eventId === form.eventId);
    const venue =
        selectedVenue ||
        venues.find((item) => item.venueId === form.venueId);

    return (
        <section className="form-view">
            <FormIntro
                title={editing ? "Edit booking" : "Book an event"}
                text="Review the event details, confirm the venue and schedule, and provide any special requirements in one place."
            />

            <form className="workflow-form" onSubmit={onSubmit}>
                <h3>Event details</h3>

                <div className="form-grid">
                    <Field label="Event" required>
                        <select
                            required
                            value={form.eventId || ""}
                            onChange={(e) =>
                                setForm({ ...form, eventId: e.target.value })
                            }
                            disabled={editing}
                        >
                            <option value="">Choose an event</option>
                            {events.map((item) => (
                                <option key={item.eventId} value={item.eventId}>
                                    {item.eventName}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Event type">
                        <input value={event?.eventType || "Not provided"} readOnly />
                    </Field>

                    <Field label="Expected attendees">
                        <input value={event?.eventAttendance || "Not provided"} readOnly />
                    </Field>

                    <Field label="Venue" required>
                        <div className="selected-venue">
                            <strong>{venue?.venueName || "Selected venue"}</strong>
                            <span>
                                {venue?.location || "Location not provided"}
                                {venue?.capacity != null
                                    ? ` · Capacity ${venue.capacity}`
                                    : ""}
                            </span>
                        </div>
                    </Field>
                </div>

                <Field label="Event description">
                    <textarea
                        rows="3"
                        value={event?.eventDescription || ""}
                        readOnly
                        placeholder="No event description has been provided."
                    />
                </Field>

                <h3>Booking details</h3>

                <div className="form-grid">
                    <Field label="Start date and time" required>
                        <input
                            required
                            type="datetime-local"
                            value={form.startDateTime || ""}
                            onChange={(e) =>
                                setForm({ ...form, startDateTime: e.target.value })
                            }
                        />
                    </Field>

                    <Field label="End date and time" required>
                        <input
                            required
                            type="datetime-local"
                            value={form.endDateTime || ""}
                            onChange={(e) =>
                                setForm({ ...form, endDateTime: e.target.value })
                            }
                        />
                    </Field>
                </div>

                <div className="booking-summary">
                    <strong>Schedule summary</strong>
                    <span>
                        {form.startDateTime
                            ? `${dateText(form.startDateTime)} · ${timeText(form.startDateTime)} – ${timeText(form.endDateTime)}`
                            : "Choose the booking start and end time above."}
                    </span>
                    {venue?.price != null && (
                        <span>
                            Venue price: R {Number(venue.price).toLocaleString("en-ZA", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </span>
                    )}
                </div>

                <Field label="Special requirements">
                    <textarea
                        rows="3"
                        value={form.specialRequirements || ""}
                        onChange={(e) =>
                            setForm({ ...form, specialRequirements: e.target.value })
                        }
                        placeholder="Accessibility needs, room layout, equipment, catering, or other arrangements..."
                    />
                </Field>

                {!editing && (
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
                                I confirm that the information provided is complete and accurate. I understand that I am responsible for checking the event, venue, equipment, and facility requirements for this booking.
                            </span>
                        </label>
                    </div>
                )}

                <p className="form-note">
                    {editing
                        ? "Only pending bookings can be edited."
                        : "The booking will be checked for availability and submitted for staff approval."}
                </p>

                <FormActions
                    saving={saving}
                    submit={editing ? "Save Changes" : "Submit Booking"}
                    onCancel={onCancel}
                />
            </form>
        </section>
    );
}

export default BookingForm;
