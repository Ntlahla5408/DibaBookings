import { useMemo, useState } from "react";

import conferenceCentre from "../../../assets/images/Conference centre.jpg";
import theatreImage from "../../../assets/images/Theatre (2).jpg";
import diningImage from "../../../assets/images/Dining Room.jpg";

import EmptyState from "../../common/EmptyState";
import VenueCard from "../venues/VenueCard";

function OrganizerHome({
    venues,
    query,
    setQuery,
    onOpenVenue,
}) {
    const [minimumCapacity, setMinimumCapacity] = useState("");
    const [maximumPrice, setMaximumPrice] = useState("");

    const filteredVenues = useMemo(() => {
        const search = query.trim().toLowerCase();
        const requestedCapacity = /^\\d+$/.test(search) ? Number(search) : null;

        return venues.filter((venue) => {
            const venueName = venue.venueName?.toLowerCase() || "";
            const description = venue.venueDescription?.toLowerCase() || "";
            const location = venue.location?.toLowerCase() || "";
            const capacity = Number(venue.capacity) || 0;
            const price = venue.price == null ? null : Number(venue.price);
            const matchesSearch = !search || (
                requestedCapacity !== null
                    ? capacity >= requestedCapacity
                    : venueName.includes(search) ||
                      description.includes(search) ||
                      location.includes(search)
            );
            const matchesCapacity = !minimumCapacity || capacity >= Number(minimumCapacity);
            const matchesPrice = !maximumPrice || (
                price !== null &&
                Number.isFinite(price) &&
                price <= Number(maximumPrice)
            );

            return matchesSearch && matchesCapacity && matchesPrice;
        });
    }, [venues, query, minimumCapacity, maximumPrice]);

    return (
        <main className="organizer-home">
            <section className="home-introduction">
                <div className="home-welcome-copy">
                    <h1>Venues</h1>
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
                    <label className="home-filter-control"><span>Price</span><select value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} aria-label="Maximum venue price"><option value="">Any price</option><option value="1000">Up to R1,000</option><option value="2500">Up to R2,500</option><option value="5000">Up to R5,000</option><option value="10000">Up to R10,000</option></select></label>
                    {(minimumCapacity || maximumPrice || query) && <button type="button" className="home-clear-filters" onClick={() => { setQuery(""); setMinimumCapacity(""); setMaximumPrice(""); }}>Clear</button>}
                </div>
            </section>
            <section className="home-venue-section">
                <div className="home-section-heading">
                    <div>
                        <h2>Available venues</h2>
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
