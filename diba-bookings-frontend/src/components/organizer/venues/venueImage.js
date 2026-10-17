import conferenceCentre from "../../../assets/images/Conference centre.jpg";
import theatreImage from "../../../assets/images/Theatre (2).jpg";
import diningImage from "../../../assets/images/Dining Room.jpg";

export function getVenueFallbackImage(venue) {
    const name = venue?.venueName?.toLowerCase() || "";

    if (name.includes("theatre")) {
        return theatreImage;
    }

    if (
        name.includes("restaurant") ||
        name.includes("dining")
    ) {
        return diningImage;
    }

    return conferenceCentre;
}