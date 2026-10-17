import { useMemo, useState } from "react";

import conferenceCentre from "../../../assets/images/Conference centre.jpg";
import theatreImage from "../../../assets/images/Theatre (2).jpg";
import diningImage from "../../../assets/images/Dining Room.jpg";

import EmptyState from "../../common/EmptyState";
import BookingCard from "../bookings/BookingCard";
import VenueCard from "../venues/VenueCard";

const images = [conferenceCentre, theatreImage, diningImage];

function OrganizerHome({
    firstName,
    venues,
    upcoming,
    query,
    setQuery,
    onOpenVenue,
    onOpenBooking,
    onFindVenue,
    onViewBookings
}) {
    const [minimumCapacity, setMinimumCapacity] = useState("");
    const [availability, setAvailability] = useState("");

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    const filteredVenues = useMemo(() => {
        const search = query.trim().toLowerCase();
        const requestedCapacity = /^\d+$/.test(search) ? Number(search) : null;

        return venues.filter((venue) => {
            const venueName = venue.venueName?.toLowerCase() || "";
            const description = venue.venueDescription?.toLowerCase() || "";
            const location = venue.location?.toLowerCase() || "";
            const capacity = Number(venue.capacity) || 0;
            const status = venue.venueStatus?.toLowerCase() || "";

            const matchesSearch = !search || (
                requestedCapacity !== null
                    ? capacity >= requestedCapacity
                    : venueName.includes(search) ||
                      description.includes(search) ||
                      location.includes(search)
            );
            const matchesCapacity = !minimumCapacity || capacity >= Number(minimumCapacity);
            const matchesAvailability = !availability || status === availability.toLowerCase();

            return matchesSearch && matchesCapacity && matchesAvailability;
        });
    }, [venues, query, minimumCapacity, availability]);

    return (
        <main className="organizer-home">
            <section className="home-introduction">
                <div className="home-welcome-copy">
                    <p className="home-section-label">YOUR WORKSPACE</p>
                    <h1>{greeting}, <em>{firstName}</em></h1>
                </div>
            </section>

            <section className="home-discovery" aria-label="Venue search">
                <div className="home-search-heading">
                    <h2>Find a venue</h2>
                    <p>Search by venue name, location or attendee capacity.</p>
                </div>
                <div className="home-discovery-form">
                    <div className="home-search-field">
                        <span className="home-search-icon" aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search for a venue that fits your event"
                            aria-label="Search by venue name, location or capacity"
                        />
                        {query && (
                            <button
                                type="button"
                                className="home-search-clear"
                                onClick={() => setQuery("")}
                                aria-label="Clear venue search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <button type="button" className="home-advanced-link" onClick={onFindVenue}>
                        Advanced search <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </section>

            <section className="home-upcoming-section">
                <div className="home-upcoming-heading">
                    <div>
                        <h2>My upcoming events</h2>
                        <p>Your next bookings at a glance.</p>
                    </div>
                    <button type="button" className="home-view-all" onClick={onViewBookings}>
                        View all bookings <span aria-hidden="true">→</span>
                    </button>
                </div>

                {upcoming.length > 0 ? (
                    <div className="home-upcoming-grid">
                        {upcoming.slice(0, 3).map((booking) => (
                            <BookingCard
                                key={booking.bookingId}
                                booking={booking}
                                onOpen={onOpenBooking}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="home-upcoming-empty">
                        <span className="home-empty-icon" aria-hidden="true">▣</span>
                        <p>You have no upcoming events.</p>
                        <button type="button" className="home-inline-action" onClick={onFindVenue}>
                            Browse venues <span aria-hidden="true">→</span>
                        </button>
                    </div>
                )}
            </section>

            <section className="home-venue-section">
                <div className="home-section-heading">
                    <div>
                        <h2>Explore venues</h2>
                        <p>Find a space for your next conference, meeting or event.</p>
                    </div>
                    <span className="home-result-count">{filteredVenues.length} {filteredVenues.length === 1 ? "venue" : "venues"}</span>
                </div>

                <div className="home-venue-filters">
                    <label>
                        <span>Minimum capacity</span>
                        <input
                            type="number"
                            min="1"
                            inputMode="numeric"
                            placeholder="Any size"
                            value={minimumCapacity}
                            onChange={(event) => setMinimumCapacity(event.target.value)}
                        />
                    </label>
                    <label>
                        <span>Availability</span>
                        <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
                            <option value="">All venues</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </label>
                    {(minimumCapacity || availability) && (
                        <button
                            type="button"
                            className="home-clear-filters"
                            onClick={() => {
                                setMinimumCapacity("");
                                setAvailability("");
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                <div className="home-venue-grid">
                    {filteredVenues.length > 0 ? (
                        filteredVenues.map((venue) => {
                            const originalIndex = venues.findIndex((item) => item.venueId === venue.venueId);
                            const image = images[(originalIndex >= 0 ? originalIndex : 0) % images.length];

                            return (
                                <VenueCard
                                    key={venue.venueId}
                                    venue={venue}
                                    image={venue.venueImageData || image}
                                    onOpen={onOpenVenue}
                                />
                            );
                        })
                    ) : (
                        <div className="home-empty">
                            <EmptyState
                                title="No venues found"
                                text="Try another search or adjust your filters."
                            />
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default OrganizerHome;
