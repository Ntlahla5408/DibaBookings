
import api from "./api";

// Retrieve all venues.
export const getVenues = () => api.get("/Venues");

// Retrieve one venue by its ID.
export const getVenue = (venueId) =>
    api.get(`/Venues/${venueId}`);

// Update an existing venue.
export const updateVenue = (venueId, venue) =>
    api.put(`/Venues/${venueId}`, venue);

// Retrieve facilities belonging to a venue.
export const getVenueFeatures = (venueId) =>
    api.get(`/Venues/${venueId}/features`);

// Add a facility to a venue.
export const createVenueFeature = (venueId, feature) =>
    api.post(`/Venues/${venueId}/features`, feature);

// Update an existing facility.
export const updateVenueFeature = (venueId, featureId, feature) =>
    api.put(`/Venues/${venueId}/features/${featureId}`, feature);

// Delete a facility from a venue.
export const deleteVenueFeature = (venueId, featureId) =>
    api.delete(`/Venues/${venueId}/features/${featureId}`);
