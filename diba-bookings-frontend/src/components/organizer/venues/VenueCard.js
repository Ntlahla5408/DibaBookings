import Status from "../../common/StatusBadge";

function VenueCard({ venue, image, fallbackImage, onOpen }) {
    const openVenue = () => onOpen(venue);

    const handleCardKeyDown = (event) => {
        if (event.target !== event.currentTarget) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openVenue();
        }
    };

    return (
        <article
            className="browse-venue-card"
            role="button"
            tabIndex={0}
            aria-label={`View details for ${venue.venueName}`}
            onClick={openVenue}
            onKeyDown={handleCardKeyDown}
        >
            <div className="venue-card-image">
                <img
                    src={image}
                    alt={venue.venueName}
                    onError={(event) => {
                        if (fallbackImage && event.currentTarget.src !== fallbackImage) {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = fallbackImage;
                        }
                    }}
                />
            </div>

            <div className="browse-venue-body">
                <div className="venue-card-title">
                    <h3>{venue.venueName}</h3>
                    <Status status={venue.venueStatus} />
                </div>

                <p className="venue-card-description">
                    {venue.venueDescription ||
                        "A flexible venue for meetings, conferences and events."}
                </p>

                <div className="venue-facts">
                    <span>
                        ⌖{" "}
                        {venue.location || "Location available on request"}
                    </span>

                    <span>
                        ♙ Capacity {venue.capacity}
                    </span>

                    <span>
                        R{" "}
                        {venue.price != null
                            ? Number(venue.price).toLocaleString("en-ZA", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                              })
                            : "Price on request"}
                    </span>
                </div>

                <button
                    className="outline-action"
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        openVenue();
                    }}
                >
                    Show More <span aria-hidden="true">→</span>
                </button>
            </div>
        </article>
    );
}

export default VenueCard;