
import { useEffect, useState } from "react";
import { Badge, Button, Form, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";

import {
    createVenue,
    createVenueFeature,
    deleteVenueFeature,
    getVenueFeatures,
    updateVenue,
    updateVenueFeature
} from "../../services/venueService";

function getErrorMessage(error, fallback) {
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
        return responseData;
    }

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (typeof responseData?.title === "string") {
        return responseData.title;
    }

    if (!error.response) {
        return "Unable to reach the server. Check your connection and try again.";
    }

    return fallback;
}


function compressVenueImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => {
            reject(new Error("Could not read the selected image."));
        };

        reader.onload = () => {
            const image = new Image();

            image.onerror = () => {
                reject(new Error("Could not open the selected image."));
            };

            image.onload = () => {
                const maximumWidth = 1200;
                const maximumHeight = 900;

                const scale = Math.min(
                    maximumWidth / image.width,
                    maximumHeight / image.height,
                    1
                );

                const canvas = document.createElement("canvas");

                canvas.width = Math.max(
                    1,
                    Math.round(image.width * scale)
                );

                canvas.height = Math.max(
                    1,
                    Math.round(image.height * scale)
                );

                const context = canvas.getContext("2d");

                if (!context) {
                    reject(new Error("Image processing is unavailable."));
                    return;
                }

                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                resolve(canvas.toDataURL("image/jpeg", 0.8));
            };

            image.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
}


function toOptionalNumber(value) {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
}

function createVenueForm(venue) {
    return {
        venueName: venue?.venueName ?? "",
        venueDescription: venue?.venueDescription ?? "",
        capacity: venue?.capacity ?? "",
        price: venue?.price ?? "",
        location: venue?.location ?? "",
        latitude: venue?.latitude ?? "",
        longitude: venue?.longitude ?? "",
        venueStatus: venue?.venueStatus ?? "Available"
    };
}

const emptyFeatureForm = {
    featureName: "",
    featureDescription: "",
    featureStatus: "Available"
};

function StaffVenueManagement({ venue, onClose, onSaved }) {
    const isCreating = !venue?.venueId;
    const [venueForm, setVenueForm] = useState(() => createVenueForm(venue));
    const [newVenueImageData, setNewVenueImageData] = useState(null);
const [processingImage, setProcessingImage] = useState(false);
    const [features, setFeatures] = useState([]);
    const [featureForm, setFeatureForm] = useState(emptyFeatureForm);
    const [editingFeatureId, setEditingFeatureId] = useState(null);

    const [loadingFeatures, setLoadingFeatures] = useState(true);
    const [savingVenue, setSavingVenue] = useState(false);
    const [savingFeature, setSavingFeature] = useState(false);
    const [deletingFeatureId, setDeletingFeatureId] = useState(null);

    useEffect(() => {
        setVenueForm(createVenueForm(venue));
        setFeatureForm(emptyFeatureForm);
        setEditingFeatureId(null);
        setNewVenueImageData(null);
setProcessingImage(false);
    }, [venue]);

    useEffect(() => {
        let active = true;

        async function loadFeatures() {
            setLoadingFeatures(true);

            try {
                const response = await getVenueFeatures(venue.venueId);

                if (active) {
                    setFeatures(
                        Array.isArray(response.data) ? response.data : []
                    );
                }
            } catch (error) {
                if (active) {
                    toast.error(
                        getErrorMessage(error, "Could not load venue facilities.")
                    );
                }
            } finally {
                if (active) {
                    setLoadingFeatures(false);
                }
            }
        }

        if (venue?.venueId) {
            loadFeatures();
        }

        return () => {
            active = false;
        };
    }, [venue?.venueId]);

    const handleVenueChange = (event) => {
        const { name, value } = event.target;

        setVenueForm((current) => ({
            ...current,
            [name]: value
        }));
    };
    
const handleVenueImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    // Allow common image formats and reject other file types.
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        toast.error("Choose a JPG, PNG, or WebP image.");
        event.target.value = "";
        return;
    }

    // Limit the original upload to 5 MB before compression.
    if (file.size > 5 * 1024 * 1024) {
        toast.error("Choose an image smaller than 5 MB.");
        event.target.value = "";
        return;
    }

    setProcessingImage(true);

    try {
        const compressedImage = await compressVenueImage(file);

        setNewVenueImageData(compressedImage);
        toast.success("Image ready to save.");
    } catch (error) {
        toast.error(
            error.message || "Could not process the selected image."
        );
    } finally {
        setProcessingImage(false);
        event.target.value = "";
    }
};


    const handleFeatureChange = (event) => {
        const { name, value } = event.target;

        setFeatureForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const saveVenue = async (event) => {
        event.preventDefault();

        if (!venueForm.venueName.trim()) {
            toast.error("Enter a venue name.");
            return;
        }

        const capacity = Number(venueForm.capacity);
        const price = Number(venueForm.price);

        if (
            venueForm.capacity === "" ||
            !Number.isInteger(capacity) ||
            capacity <= 0
        ) {
            toast.error("Capacity must be a whole number greater than zero.");
            return;
        }

        if (
            venueForm.price === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            toast.error("Enter a valid, non-negative venue price.");
            return;
        }

        const latitude = toOptionalNumber(venueForm.latitude);
        const longitude = toOptionalNumber(venueForm.longitude);

        if (venueForm.latitude !== "" && latitude === null) {
            toast.error("Enter a valid latitude.");
            return;
        }

        if (venueForm.longitude !== "" && longitude === null) {
            toast.error("Enter a valid longitude.");
            return;
        }

        if (latitude !== null && (latitude < -90 || latitude > 90)) {
            toast.error("Latitude must be between -90 and 90.");
            return;
        }

        if (longitude !== null && (longitude < -180 || longitude > 180)) {
            toast.error("Longitude must be between -180 and 180.");
            return;
        }

const payload = {
    venueName: venueForm.venueName.trim(),
    venueDescription: venueForm.venueDescription.trim(),
    capacity,
    price,
    location: venueForm.location.trim(),
    latitude,
    longitude,
    venueStatus: venueForm.venueStatus,
    venueImageData:
        newVenueImageData ?? venue?.venueImageData ?? null
};

        setSavingVenue(true);

        try {
            if (isCreating) {
                await createVenue(payload);
                toast.success("Venue created successfully.");
                await onSaved();
                onClose();
            } else {
                await updateVenue(venue.venueId, payload);
                toast.success("Venue information saved.");
                await onSaved();
            }
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    isCreating
                        ? "Could not create the venue."
                        : "Could not save venue information."
                )
            );
        } finally {
            setSavingVenue(false);
        }
    };

    const startEditingFeature = (feature) => {
        setEditingFeatureId(feature.venueFeatureId);
        setFeatureForm({
            featureName: feature.featureName ?? "",
            featureDescription: feature.featureDescription ?? "",
            featureStatus: feature.featureStatus ?? "Available"
        });
    };

    const resetFeatureForm = () => {
        setEditingFeatureId(null);
        setFeatureForm(emptyFeatureForm);
    };

    const saveFeature = async (event) => {
        event.preventDefault();

        if (!featureForm.featureName.trim()) {
            toast.error("Enter a facility name.");
            return;
        }

        const payload = {
            featureName: featureForm.featureName.trim(),
            featureDescription: featureForm.featureDescription.trim(),
            featureStatus: featureForm.featureStatus
        };

        setSavingFeature(true);

        try {
            if (editingFeatureId) {
                await updateVenueFeature(
                    venue.venueId,
                    editingFeatureId,
                    payload
                );
                toast.success("Facility updated.");
            } else {
                const response = await createVenueFeature(
                    venue.venueId,
                    payload
                );

                // Use the API response to include the newly created record.
                if (response.data) {
                    setFeatures((current) => [
                        ...current,
                        response.data
                    ]);
                }

                toast.success("Facility added.");
            }

            if (editingFeatureId) {
                const response = await getVenueFeatures(venue.venueId);
                setFeatures(Array.isArray(response.data) ? response.data : []);
            }

            resetFeatureForm();
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Could not save the facility.")
            );
        } finally {
            setSavingFeature(false);
        }
    };

    const removeFeature = async (feature) => {
        const confirmed = window.confirm(
            `Remove "${feature.featureName}" from this venue? This cannot be undone.`
        );

        if (!confirmed) return;

        setDeletingFeatureId(feature.venueFeatureId);

        try {
            await deleteVenueFeature(
                venue.venueId,
                feature.venueFeatureId
            );

            setFeatures((current) =>
                current.filter(
                    (item) =>
                        item.venueFeatureId !== feature.venueFeatureId
                )
            );

            if (editingFeatureId === feature.venueFeatureId) {
                resetFeatureForm();
            }

            toast.success("Facility removed.");
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Could not remove the facility.")
            );
        } finally {
            setDeletingFeatureId(null);
        }
    };

    return (
        <Modal
            show={Boolean(venue)}
            onHide={onClose}
            centered
            size="xl"
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {isCreating ? "Add venue" : `Manage venue: ${venue.venueName}`}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <section className="mb-4">
                    <h5>Venue information</h5>
                    <p className="text-muted">
                        Update the existing venue's details and availability.
                    </p>

                    <Form onSubmit={saveVenue}>
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <Form.Group controlId="staffVenueName">
                                    <Form.Label>Venue name</Form.Label>
                                    <Form.Control
                                        name="venueName"
                                        value={venueForm.venueName}
                                        onChange={handleVenueChange}
                                        maxLength={150}
                                        required
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-12 col-md-6">
                                <Form.Group controlId="staffVenueLocation">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        name="location"
                                        value={venueForm.location}
                                        onChange={handleVenueChange}
                                        maxLength={250}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-12">
                                <Form.Group controlId="staffVenueDescription">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="venueDescription"
                                        value={venueForm.venueDescription}
                                        onChange={handleVenueChange}
                                        maxLength={2000}
                                    />
                                </Form.Group>
                            </div>


<div className="col-12">
    <Form.Group controlId="staffVenueImage">
        <Form.Label>Venue image</Form.Label>

        <Form.Control
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleVenueImageChange}
            disabled={processingImage || savingVenue}
        />

        <Form.Text className="text-muted">
            Choose a JPG, PNG, or WebP image up to 5 MB.
            The image will be resized before saving.
        </Form.Text>
    </Form.Group>

    {(newVenueImageData || venue?.venueImageData) && (
        <div className="mt-3">
            <img
                src={newVenueImageData || venue.venueImageData}
                alt={`Preview of ${venue?.venueName || "venue"}`}
                style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "420px",
                    maxHeight: "260px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6"
                }}
            />

            <p className="text-muted small mt-2">
                {newVenueImageData
                    ? "New image selected. Save the venue to apply it."
                    : "Current saved image"}
            </p>
        </div>
    )}
</div>


                            <div className="col-12 col-md-4">
                                <Form.Group controlId="staffVenueCapacity">
                                    <Form.Label>Capacity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="capacity"
                                        min="1"
                                        step="1"
                                        value={venueForm.capacity}
                                        onChange={handleVenueChange}
                                        required
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-12 col-md-4">
                                <Form.Group controlId="staffVenuePrice">
                                    <Form.Label>Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        min="0"
                                        step="0.01"
                                        value={venueForm.price}
                                        onChange={handleVenueChange}
                                        required
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-12 col-md-4">
                                <Form.Group controlId="staffVenueStatus">
                                    <Form.Label>Availability status</Form.Label>
                                    <Form.Select
                                        name="venueStatus"
                                        value={venueForm.venueStatus}
                                        onChange={handleVenueChange}
                                        required
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Unavailable">Unavailable</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-12 col-md-6">
                                <Form.Group controlId="staffVenueLatitude">
                                    <Form.Label>Latitude (optional)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="latitude"
                                        min="-90"
                                        max="90"
                                        step="any"
                                        value={venueForm.latitude}
                                        onChange={handleVenueChange}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-12 col-md-6">
                                <Form.Group controlId="staffVenueLongitude">
                                    <Form.Label>Longitude (optional)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="longitude"
                                        min="-180"
                                        max="180"
                                        step="any"
                                        value={venueForm.longitude}
                                        onChange={handleVenueChange}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-3">
                            <Button type="submit" disabled={savingVenue || processingImage}>
                                {processingImage
    ? "Processing image..."
    : savingVenue
        ? "Saving..."
        : "Save venue"}
                            </Button>
                        </div>
                    </Form>
                </section>

                {venue?.venueId && (
                    <>
                        <hr />

                        <section className="mt-4">
                    <h5>Venue facilities</h5>
                    <p className="text-muted">
                        Manage facilities such as projectors, seating, Wi-Fi,
                        and sound equipment.
                    </p>

                    {loadingFeatures ? (
                        <p>Loading facilities...</p>
                    ) : (
                        <Table responsive bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Facility</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((feature) => (
                                    <tr key={feature.venueFeatureId}>
                                        <td>{feature.featureName}</td>
                                        <td>
                                            {feature.featureDescription || "—"}
                                        </td>
                                        <td>
                                            <Badge
                                                bg={
                                                    feature.featureStatus === "Available"
                                                        ? "success"
                                                        : "secondary"
                                                }
                                            >
                                                {feature.featureStatus || "Unknown"}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() =>
                                                        startEditingFeature(feature)
                                                    }
                                                    disabled={
                                                        savingFeature ||
                                                        deletingFeatureId !== null
                                                    }
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() =>
                                                        removeFeature(feature)
                                                    }
                                                    disabled={
                                                        savingFeature ||
                                                        deletingFeatureId !== null
                                                    }
                                                >
                                                    {deletingFeatureId ===
                                                    feature.venueFeatureId
                                                        ? "Removing..."
                                                        : "Remove"}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {features.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            No facilities have been added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}

                    <div className="border rounded p-3 mt-3">
                        <h6>
                            {editingFeatureId ? "Edit facility" : "Add a facility"}
                        </h6>

                        <Form onSubmit={saveFeature}>
                            <div className="row g-3">
                                <div className="col-12 col-md-4">
                                    <Form.Group controlId="staffFeatureName">
                                        <Form.Label>Facility name</Form.Label>
                                        <Form.Control
                                            name="featureName"
                                            value={featureForm.featureName}
                                            onChange={handleFeatureChange}
                                            maxLength={150}
                                            required
                                        />
                                    </Form.Group>
                                </div>

                                <div className="col-12 col-md-5">
                                    <Form.Group controlId="staffFeatureDescription">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            name="featureDescription"
                                            value={featureForm.featureDescription}
                                            onChange={handleFeatureChange}
                                            maxLength={1000}
                                        />
                                    </Form.Group>
                                </div>

                                <div className="col-12 col-md-3">
                                    <Form.Group controlId="staffFeatureStatus">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select
                                            name="featureStatus"
                                            value={featureForm.featureStatus}
                                            onChange={handleFeatureChange}
                                            required
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Unavailable">Unavailable</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-2 justify-content-end mt-3">
                                {editingFeatureId && (
                                    <Button
                                        type="button"
                                        variant="outline-secondary"
                                        onClick={resetFeatureForm}
                                        disabled={savingFeature}
                                    >
                                        Cancel edit
                                    </Button>
                                )}

                                <Button type="submit" disabled={savingFeature}>
                                    {savingFeature
                                        ? "Saving..."
                                        : editingFeatureId
                                            ? "Save facility changes"
                                            : "Add facility"}
                                </Button>
                            </div>
                        </Form>
                    </div>
                        </section>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default StaffVenueManagement;
