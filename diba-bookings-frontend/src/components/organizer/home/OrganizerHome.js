import { useMemo, useState } from "react";

import conferenceCentre from "../../../assets/images/Conference centre.jpg";
import theatreImage from "../../../assets/images/Theatre (2).jpg";
import diningImage from "../../../assets/images/Dining Room.jpg";

import EmptyState from "../../common/EmptyState";
import VenueCard from "../venues/VenueCard";

function getVenueType(venue) {
    const explicitType = venue.venueType || venue.type || venue.category;
    if (explicitType) return String(explicitType).trim();

    const details = `${venue.venueName || ""} ${venue.venueDescription || ""}`.toLowerCase();
    if (details.includes("theatre") || details.includes("auditorium")) return "Theatre";
    if (details.includes("dining") || details.includes("restaurant")) return "Dining";
    if (details.includes("exhibition")) return "Exhibition";
    if (details.includes("conference") || details.includes("meeting") || details.includes("hall")) return "Conference & meeting";
    return "Other";
}

function OrganizerHome({
    firstName,
    venues,
    query,
    setQuery,
    onOpenVenue,
}) {
    const [minimumCapacity, setMinimumCapacity] = useState("");
    const [venueType, setVenueType] = useState("");

    const venueTypes = useMemo(() => [...new Set(venues.map(getVenueType))].sort((a, b) => a.localeCompare(b)), [venues]);

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
            const type = getVenueType(venue).toLowerCase();
            const matchesSearch = !search || (
                requestedCapacity !== null
                    ? capacity >= requestedCapacity
                    : venueName.includes(search) ||
                      description.includes(search) ||
                      location.includes(search)
            );
            const matchesCapacity = !minimumCapacity || capacity >= Number(minimumCapacity);
            const matchesType = !venueType || type === venueType.toLowerCase();
            return matchesSearch && matchesCapacity && matchesType;
        });
    }, [venues, query, minimumCapacity, venueType]);

    return (
        <main className="organizer-home">
            <section className="home-introduction">
                <div className="home-welcome-copy">
                    <h1>{greeting}, <em>{firstName}</em></h1>
                    <p>Browse our venue collection and find the perfect space for your next event.</p>
                </div>
            </section>
            <section className="home-discovery" aria-label="Venue search and filters">
                <div className="home-discovery-form">
                    <div className="home-search-field">
                        <span className="home-search-icon" aria-hidden="true">⌕</span>
                        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by venue name or location..." aria-label="Search by venue name or location" />
                        {query && <button type="button" className="home-search-clear" onClick={() => setQuery("")} aria-label="Clear venue search">×</button>}
                    </div>
                    <label className="home-filter-control"><span>Capacity</span><select value={minimumCapacity} onChange={(event) => setMinimumCapacity(event.target.value)} aria-label="Minimum capacity"><option value="">Any</option><option value="50">50+</option><option value="100">100+</option><option value="250">250+</option><option value="500">500+</option></select></label>
                    <label className="home-filter-control"><span>Venue type</span><select value={venueType} onChange={(event) => setVenueType(event.target.value)} aria-label="Venue type"><option value="">All types</option>{venueTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                    {(minimumCapacity || venueType || query) && <button type="button" className="home-clear-filters" onClick={() => {setQuery("");setMinimumCapacity("");setVenueType("");}}>Clear</button>}
                </div>
            </section>
            <section className="home-venue-section">
                <div className="home-section-heading">
                    <div>
                        <h2>Explore venues</h2>
                    </div>
                </div>

                <div className="home-venue-grid">
                    {filteredVenues.length > 0 ? (
                        filteredVenues.map((venue) => {
                            const name = venue.venueName?.toLowerCase() || "";
                            const image = name.includes("theatre") ? theatreImage : name.includes("dining") || name.includes("restaurant") ? diningImage : conferenceCentre;

                            return (
                                <VenueCard
                                    key={venue.venueId}
                                    venue={venue}
                                    image={venue.venueImageData || image}
                                    fallbackImage={image}
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
