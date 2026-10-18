import conferenceCentre from "../../assets/images/Conference centre.jpg";
import theatreImage from "../../assets/images/Theatre (2).jpg";
import diningImage from "../../assets/images/Dining Room.jpg";

import LoadingIndicator from "../../components/common/LoadingIndicator";
import OrganizerHome from "../../components/organizer/home/OrganizerHome";
import VenueDetails from "../../components/organizer/venues/VenueDetails";
import EventForm from "../../components/organizer/events/EventForm";
import BookingForm from "../../components/organizer/bookings/BookingForm";
import BookingDetails from "../../components/organizer/bookings/BookingDetails";
import EventBookingWorkspace from "../../components/organizer/workspace/EventBookingWorkspace";
import NotificationsView from "../../components/organizer/notifications/NotificationsView";
import HelpCentre from "../HelpCentre";
import PolicyDocumentsPanel from "../../components/common/PolicyDocumentsPanel";
import SupportTicketsPanel from "../../components/common/SupportTicketsPanel";
import ProfilePage from "../../components/common/ProfilePage";
import OrganizerSidebar from "../../components/organizer/navigation/OrganizerSidebar";
import OrganizerTopNav from "../../components/organizer/navigation/OrganizerTopNav";
import useOrganizerDashboard from "../../hooks/useOrganizerDashboard";

function getVenueFallbackImage(venue) {
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

function OrganizerDashboard() {
    const {
        view,
        drawerOpen,
        setDrawerOpen,
        bookings,
        firstName,
        fullName,
        unread,
        loading,
        title,
        goTo,
        openBooking,
        openVenue,
        startEvent,
        startBooking,
        returnFromForm,
        saveEvent,
        submitEventAndBooking,
        saveBooking,
        cancelBooking,
        editBooking,
        markRead,
        payForBooking,
        venues,
        events,
        notifications,
        query,
        setQuery,
        activeVenue,
        activeBooking,
        availableVenues,
        eventForm,
        setEventForm,
        bookingForm,
        setBookingForm,
        editingEvent,
        editingBooking,
        saving,
        setActiveVenue
    } = useOrganizerDashboard();

    if (loading) {
        return (
            <div className="organizer-loading">
                <LoadingIndicator label="Preparing your workspace" />
            </div>
        );
    }

        return (
            <div className="organizer-app">

            <OrganizerSidebar
                view={view}
                unread={unread}
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
                goTo={goTo}
            />

            <main className="organizer-main compact-main">

                <OrganizerTopNav
                    title={title}
                    firstName={firstName}
                    fullName={fullName}
                    unread={unread}
                    setDrawerOpen={setDrawerOpen}
                    goTo={goTo}
                />

{view === "dashboard" && (
    <OrganizerHome
        firstName={firstName}
        venues={venues}
        bookings={bookings}
        query={query}
        setQuery={setQuery}
        onOpenVenue={openVenue}
    />
)}

                {view === "venue-detail" &&
                    activeVenue && (
                        <VenueDetails
                            venue={activeVenue}
                            image={
                                activeVenue.venueImageData ||
                                getVenueFallbackImage(activeVenue)
                            }
                            onBack={() => goTo("dashboard")}
                            onBook={() => startEvent(activeVenue)}
                        />
                    )}

                {view === "event-form" && (
                    <EventForm
                        form={eventForm}
                        setForm={setEventForm}
                        selectedVenue={activeVenue}
                        venues={availableVenues}
                        saving={saving}
                        editing={editingEvent}
                        onSubmit={
                            editingEvent
                                ? saveEvent
                                : submitEventAndBooking
                        }
                        onChangeVenue={(venue) => {
                            setActiveVenue(venue);

                            if (!venue) {
                                setEventForm(
                                    (current) => ({
                                        ...current,
                                        venueId: ""
                                    })
                                );
                            }
                        }}
                        onCancel={returnFromForm}
                    />
                )}

                {view === "booking-form" && (
                    <BookingForm
                        form={bookingForm}
                        setForm={setBookingForm}
                        selectedVenue={activeVenue}
                        events={events}
                        venues={availableVenues}
                        saving={saving}
                        editing={editingBooking}
                        onSubmit={saveBooking}
                        onCancel={returnFromForm}
                    />
                )}

                {(view === "bookings" || view === "events") && (
                    <EventBookingWorkspace
                        perspective={view}
                        onChangePerspective={goTo}
                        events={events}
                        bookings={bookings}
                        venues={venues}
                        onOpenBooking={openBooking}
                        onEditEvent={startEvent}
                        onBookEvent={(event) =>
                            startBooking(
                                event,
                                venues.find(
                                    (venue) =>
                                        venue.venueId === event.venueId
                                )
                            )
                        }
                        onEditBooking={editBooking}
                        onCancelBooking={cancelBooking}
                        saving={saving}
                    />
                )}

                {view === "booking-detail" && activeBooking && (
                    <BookingDetails
                        booking={activeBooking}
                        event={events.find((item) => item.eventId === activeBooking.eventId)}
                        venue={venues.find((item) => item.venueId === activeBooking.venueId)}
                        onBack={() => goTo("bookings")}
                        onEdit={editBooking}
                        onCancel={cancelBooking}
                        saving={saving}
                    />
                )}

                {view === "notifications" && (
                    <NotificationsView
                        notifications={notifications}
                        onRead={markRead}
                        onOpenBooking={(id) => {
                            const booking =
                                bookings.find(
                                    (item) =>
                                        item.bookingId ===
                                        id
                                );

                            if (booking) {
                                openBooking(booking);
                            }
                        }}
                        onPay={payForBooking}
                    />
                )}

                {view === "profile" && <ProfilePage />}
                {view === "help" && <HelpCentre />}
                {view === "policies" && <PolicyDocumentsPanel />}
                {view === "support" && <SupportTicketsPanel />}

            </main>
        </div>
        );
}

export default OrganizerDashboard;
