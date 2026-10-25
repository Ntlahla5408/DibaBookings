using DIBA_Backend.Data;
using DIBA_Backend.Dto.Booking;
using DIBA_Backend.Dto.Event;
using DIBA_Backend.Models.Entities;
using DIBA_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DIBA_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    // Reference: Microsoft Learn, "Role-based authorization in ASP.NET Core".
    // Similar logic: requiring authentication before accessing protected
    // controller actions.
    // DIBA adaptation: all event operations require an authenticated user.
    [Authorize]
    public class EventsController : ControllerBase
    {
        private readonly DIBABookingsDbContext _dbContext;
        private readonly NotificationEmailService _notificationEmailService;

        public EventsController(
            DIBABookingsDbContext dbContext,
            NotificationEmailService notificationEmailService)
        {
            _dbContext = dbContext;
            _notificationEmailService = notificationEmailService;
        }

        // GET: api/Events
        [HttpGet]
        public async Task<IActionResult> GetEvents()
        {
            IQueryable<Event> eventsQuery = _dbContext.Events;

            // Reference: Microsoft Learn, "Role-based authorization in ASP.NET Core".
            // Similar logic: using ClaimsPrincipal.IsInRole to determine
            // what data or operations a user is allowed to access.
            // DIBA adaptation: Staff and Administrators can view all events,
            // while Event Organisers are restricted to their own events.
            if (!User.IsInRole("Staff") && !User.IsInRole("Administrator"))
            {
                // Reference: Microsoft Learn, "Claim-based authorization
                // in ASP.NET Core".
                // Similar logic: obtaining information about the authenticated
                // user from a claim.
                // DIBA adaptation: the NameIdentifier claim stores the
                // UserId used by the DIBA database.
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim == null)
                {
                    return Unauthorized("User ID could not be determined.");
                }

                if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    return Unauthorized("Invalid user ID.");
                }

                // DIBA-specific access-control rule:
                // Event Organisers can only retrieve events that belong
                // to their own UserId.
                eventsQuery = eventsQuery
                    .Where(eventEntity => eventEntity.UserId == userId);
            }

            // Similar logic: projecting database entities into a response
            // object rather than returning the entity directly.
            // DIBA adaptation: EventResponseDto defines the event data
            // exposed to the frontend.
            var events = await eventsQuery
                .Select(eventEntity => new EventResponseDto
                {
                    EventId = eventEntity.EventId,
                    EventName = eventEntity.EventName,
                    EventDescription = eventEntity.EventDescription,
                    EventType = eventEntity.EventType,
                    EventAttendance = eventEntity.EventAttendance,
                    StartDateTime = eventEntity.StartDateTime,
                    EndDateTime = eventEntity.EndDateTime,
                    VenueId = eventEntity.VenueId,
                    UserId = eventEntity.UserId
                })
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/Events/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetEvent(Guid id)
        {
            var eventEntity = await _dbContext.Events
                .FirstOrDefaultAsync(
                    eventEntity => eventEntity.EventId == id);

            if (eventEntity == null)
            {
                return NotFound("Event not found.");
            }

            // Reference: Microsoft Learn, "Role-based authorization in
            // ASP.NET Core".
            // Similar logic: checking the authenticated user's role before
            // allowing access to protected information.
            // DIBA adaptation: Staff and Administrators can view any event,
            // while Event Organisers are restricted to their own events.
            if (!User.IsInRole("Staff") && !User.IsInRole("Administrator"))
            {
                var userIdClaim =
                    User.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim == null)
                {
                    return Unauthorized(
                        "User ID could not be determined.");
                }

                if (!Guid.TryParse(
                        userIdClaim.Value,
                        out Guid userId))
                {
                    return Unauthorized("Invalid user ID.");
                }

                // DIBA-specific ownership check:
                // prevents an Event Organiser from accessing another
                // organiser's event by changing the event ID.
                if (eventEntity.UserId != userId)
                {
                    return Forbid();
                }
            }

            var response = new EventResponseDto
            {
                EventId = eventEntity.EventId,
                EventName = eventEntity.EventName,
                EventDescription = eventEntity.EventDescription,
                EventType = eventEntity.EventType,
                EventAttendance = eventEntity.EventAttendance,
                StartDateTime = eventEntity.StartDateTime,
                EndDateTime = eventEntity.EndDateTime,
                VenueId = eventEntity.VenueId,
                UserId = eventEntity.UserId
            };

            return Ok(response);
        }

        // POST: api/Events
        [HttpPost]
        [Authorize(Roles = "Event Organiser")]
        public async Task<IActionResult> CreateEvent(
            CreateEventDto createEventDto)
        {
            // Reference: Microsoft Learn, "Claim-based authorization
            // in ASP.NET Core".
            // Similar logic: obtaining the identity of the current user
            // from an authentication claim.
            // DIBA adaptation: the UserId identifies the organiser who
            // created the event.
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(
                    "User ID could not be determined.");
            }

            if (!Guid.TryParse(
                    userIdClaim.Value,
                    out Guid userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            // Reference: ErmaoCyber, "meeting-room-reservation-api".
            // Similar logic: validating reservation start and end times
            // before allowing a booking-related operation.
            // DIBA adaptation: an event cannot end at or before its
            // start time.
            if (createEventDto.EndDateTime <=
                createEventDto.StartDateTime)
            {
                return BadRequest(
                    "End date and time must be after the start date and time.");
            }

            // DIBA-specific venue validation.
            // The event cannot be created if the selected venue does
            // not exist.
            var venue = await _dbContext.Venues
                .FirstOrDefaultAsync(
                    venue => venue.VenueId == createEventDto.VenueId);

            if (venue == null)
            {
                return NotFound("Venue not found.");
            }

            if (!int.TryParse(createEventDto.EventAttendance, out var expectedAttendees) ||
                expectedAttendees < 1)
            {
                return BadRequest("Expected attendees must be a whole number greater than zero.");
            }

            if (expectedAttendees > venue.Capacity)
            {
                return BadRequest($"Expected attendees cannot exceed the venue capacity of {venue.Capacity}.");
            }

            // DIBA-specific business rule:
            // events may only be created using an available venue.
            if (!venue.VenueStatus.Equals(
                    "Available",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "The selected venue is not currently available.");
            }

            var eventEntity = new Event
            {
                EventId = Guid.NewGuid(),
                EventName = createEventDto.EventName,
                EventDescription = createEventDto.EventDescription,
                EventType = createEventDto.EventType,
                EventAttendance = createEventDto.EventAttendance,
                StartDateTime = createEventDto.StartDateTime,
                EndDateTime = createEventDto.EndDateTime,
                VenueId = createEventDto.VenueId,
                UserId = userId
            };

            _dbContext.Events.Add(eventEntity);
            _dbContext.AuditLogs.Add(new AuditLog
            {
                AuditLogId = Guid.NewGuid(),
                Action = "Event Created",
                LogDescription = $"Event '{eventEntity.EventName}' was created by its organiser.",
                Timestamp = DateTime.UtcNow,
                UserId = userId
            });

            await _dbContext.SaveChangesAsync();

            var response = new EventResponseDto
            {
                EventId = eventEntity.EventId,
                EventName = eventEntity.EventName,
                EventDescription = eventEntity.EventDescription,
                EventType = eventEntity.EventType,
                EventAttendance = eventEntity.EventAttendance,
                StartDateTime = eventEntity.StartDateTime,
                EndDateTime = eventEntity.EndDateTime,
                VenueId = eventEntity.VenueId,
                UserId = eventEntity.UserId
            };

            return Ok(response);
        }

        // POST: api/Events/with-booking
        // Creates the event and its booking together.
        [HttpPost("with-booking")]
        [Authorize(Roles = "Event Organiser")]
        public async Task<IActionResult> CreateEventWithBooking(
            CreateEventWithBookingDto request)
        {
            // Reference: Microsoft Learn, "Claim-based authorization
            // in ASP.NET Core".
            // Similar logic: retrieving the authenticated user's identity
            // from a claim.
            // DIBA adaptation: the organiser's UserId is assigned to both
            // the event and booking.
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(
                    "User ID could not be determined.");
            }

            if (!Guid.TryParse(
                    userIdClaim.Value,
                    out Guid userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            if (!request.AcknowledgementAccepted)
            {
                return BadRequest(
                    "You must acknowledge the booking requirements before submitting the booking.");
            }

            if (string.IsNullOrWhiteSpace(request.EventAttendance) ||
                !int.TryParse(request.EventAttendance, out var expectedAttendees) ||
                expectedAttendees < 1)
            {
                return BadRequest(
                    "Expected attendees is required and must be a whole number greater than zero.");
            }

            // Reference: ErmaoCyber, "meeting-room-reservation-api".
            // Similar logic: validating that the requested time period
            // is logically valid before checking availability.
            if (request.EndDateTime <= request.StartDateTime)
            {
                return BadRequest(
                    "End date and time must be after the start date and time.");
            }

            // DIBA booking policy: the event start date must be at least
            // seven calendar days after today's date in South Africa.
            var southAfricanToday = DateTime.UtcNow.AddHours(2).Date;
            if (request.StartDateTime.Date < southAfricanToday.AddDays(7))
            {
                return BadRequest(
                    "Bookings must be made at least 7 days before the event start date.");
            }

            // DIBA-specific venue existence validation.
            var venue = await _dbContext.Venues
                .FirstOrDefaultAsync(
                    venue => venue.VenueId == request.VenueId);

            if (venue == null)
            {
                return NotFound("Venue not found.");
            }

            if (expectedAttendees > venue.Capacity)
            {
                return BadRequest($"Expected attendees cannot exceed the venue capacity of {venue.Capacity}.");
            }

            // DIBA-specific venue availability rule.
            if (!venue.VenueStatus.Equals(
                    "Available",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "The selected venue is not currently available.");
            }

            // Reference: ErmaoCyber, "meeting-room-reservation-api".
            // Reference: JedAngelo, "ConferenceBookingApi".
            // Similar logic: checking whether another reservation overlaps
            // the requested reservation period and preventing conflicting
            // bookings.
            //
            // DIBA adaptation: only Pending and Approved bookings are
            // considered active conflicts.
            var hasConflict =
                await _dbContext.Bookings.AnyAsync(booking =>
                    booking.VenueId == request.VenueId &&
                    booking.StartDateTime < request.EndDateTime &&
                    booking.EndDateTime > request.StartDateTime &&
                    booking.BookingStatus != null &&
                    (booking.BookingStatus.StatusName == "Pending" ||
                     booking.BookingStatus.StatusName == "Approved"));

            if (hasConflict)
            {
                return Conflict(
                    "The selected venue is already booked or awaiting approval for the requested time.");
            }

            // Reference: JedAngelo, "ConferenceBookingApi".
            // Similar logic: bookings have explicit states/statuses that
            // control the booking workflow.
            // DIBA adaptation: every newly created booking starts with
            // the Pending status.
            var pendingStatus =
                await _dbContext.BookingStatuses
                    .FirstOrDefaultAsync(
                        bookingStatus =>
                            bookingStatus.StatusName == "Pending");

            if (pendingStatus == null)
            {
                return StatusCode(
                    500,
                    "Pending booking status could not be found.");
            }

            // Store the exact active venue-rules version acknowledged by
            // the organiser, matching the standalone booking workflow.
            var activeVenueRules = await _dbContext.PolicyDocuments
                .Where(policy =>
                    policy.PolicyType == "VenueRules" &&
                    policy.IsActive)
                .OrderByDescending(policy => policy.Version)
                .FirstOrDefaultAsync();

            // Similar transaction logic: treating the creation of related
            // database records as one unit of work.
            //
            // DIBA adaptation: an Event and its Booking are created
            // together. If one part fails, the transaction is rolled back
            // so that the system does not keep an incomplete event/booking.
            await using var transaction =
                await _dbContext.Database.BeginTransactionAsync();

            try
            {
                var eventEntity = new Event
                {
                    EventId = Guid.NewGuid(),
                    EventName = request.EventName,
                    EventDescription = request.EventDescription,
                    EventType = request.EventType,
                    EventAttendance = request.EventAttendance,
                    StartDateTime = request.StartDateTime,
                    EndDateTime = request.EndDateTime,
                    VenueId = request.VenueId,
                    UserId = userId
                };

                var booking = new Booking
                {
                    BookingId = Guid.NewGuid(),
                    BookingDate = DateTime.UtcNow,
                    StartDateTime = request.StartDateTime,
                    EndDateTime = request.EndDateTime,
                    SpecialRequirements = request.SpecialRequirements,

                    AcknowledgementAccepted =
                        request.AcknowledgementAccepted,

                    AcknowledgementAcceptedAt =
                        DateTime.UtcNow,

                    AcknowledgementPolicyType =
                        activeVenueRules?.PolicyType,

                    AcknowledgementPolicyVersion =
                        activeVenueRules?.Version,

                    UserId = userId,
                    EventId = eventEntity.EventId,
                    VenueId = request.VenueId,
                    BookingStatusId =
                        pendingStatus.BookingStatusId
                };

                _dbContext.Events.Add(eventEntity);
                _dbContext.Bookings.Add(booking);

                var bookingReference = booking.BookingId.ToString("N").ToUpperInvariant();
                var startText = booking.StartDateTime.ToString("dd MMM yyyy, HH:mm");
                var endText = booking.EndDateTime.ToString("dd MMM yyyy, HH:mm");
                var organiserMessage =
                    $"Your booking request has been submitted and is awaiting review.\n\n" +
                    $"Booking reference: {bookingReference}\n" +
                    $"Event: {eventEntity.EventName}\n" +
                    $"Venue: {venue.VenueName}\n" +
                    $"Start: {startText}\n" +
                    $"End: {endText}\n" +
                    "DIBA Bookings will notify you when staff make a decision.";

                var organiserNotification = new Notification
                {
                    NotificationId = Guid.NewGuid(),
                    NotificationType = "Booking Submitted",
                    Message = organiserMessage,
                    DateCreated = DateTime.UtcNow,
                    IsRead = false,
                    UserId = userId,
                    BookingId = booking.BookingId
                };
                _dbContext.Notifications.Add(organiserNotification);

                _dbContext.AuditLogs.AddRange(
                    new AuditLog
                    {
                        AuditLogId = Guid.NewGuid(),
                        Action = "Event Created",
                        LogDescription = $"Event '{eventEntity.EventName}' was created as part of booking {bookingReference}.",
                        Timestamp = DateTime.UtcNow,
                        UserId = userId
                    },
                    new AuditLog
                    {
                        AuditLogId = Guid.NewGuid(),
                        Action = "Booking Submitted",
                        LogDescription = $"Booking {bookingReference} was submitted for event '{eventEntity.EventName}' at venue '{venue.VenueName}'.",
                        Timestamp = DateTime.UtcNow,
                        UserId = userId
                    });

                var staffRecipients = await _dbContext.Users
                    .Include(user => user.Role)
                    .Where(user =>
                        user.IsActive &&
                        user.Role != null &&
                        (user.Role.RoleName == "Staff" ||
                         user.Role.RoleName == "Administrator"))
                    .ToListAsync();

                var organiserName = await _dbContext.Users
                    .Where(user => user.UserId == userId)
                    .Select(user => user.FirstName + " " + user.LastName)
                    .FirstOrDefaultAsync() ?? "Event Organiser";

                var staffMessage =
                    $"A new venue booking requires review.\n\n" +
                    $"Booking reference: {bookingReference}\n" +
                    $"Organiser: {organiserName}\n" +
                    $"Event: {eventEntity.EventName}\n" +
                    $"Venue: {venue.VenueName}\n" +
                    $"Start: {startText}\n" +
                    $"End: {endText}\n" +
                    "Open the DIBA Bookings Staff Dashboard to review this request.";

                var staffNotifications = staffRecipients.Select(staff => new Notification
                {
                    NotificationId = Guid.NewGuid(),
                    NotificationType = "New Booking Request",
                    Message = staffMessage,
                    DateCreated = DateTime.UtcNow,
                    IsRead = false,
                    UserId = staff.UserId,
                    BookingId = booking.BookingId
                }).ToList();

                _dbContext.Notifications.AddRange(staffNotifications);

                await _dbContext.SaveChangesAsync();

                await transaction.CommitAsync();

                await _notificationEmailService.TrySendAsync(
                    userId,
                    organiserNotification.NotificationId,
                    $"Booking request received - {bookingReference[..8]}",
                    organiserMessage);

                foreach (var staffNotification in staffNotifications)
                {
                    await _notificationEmailService.TrySendAsync(
                        staffNotification.UserId,
                        staffNotification.NotificationId,
                        $"New booking request - {bookingReference[..8]}",
                        staffMessage);
                }

                return Ok(new
                {
                    Event = new EventResponseDto
                    {
                        EventId = eventEntity.EventId,
                        EventName = eventEntity.EventName,
                        EventDescription =
                            eventEntity.EventDescription,
                        EventType = eventEntity.EventType,
                        EventAttendance =
                            eventEntity.EventAttendance,
                        StartDateTime =
                            eventEntity.StartDateTime,
                        EndDateTime =
                            eventEntity.EndDateTime,
                        VenueId = eventEntity.VenueId,
                        UserId = eventEntity.UserId
                    },

                    Booking = new BookingResponseDto
                    {
                        BookingId = booking.BookingId,
                        BookingDate = booking.BookingDate,
                        StartDateTime = booking.StartDateTime,
                        EndDateTime = booking.EndDateTime,
                        SpecialRequirements =
        booking.SpecialRequirements,

                        AcknowledgementAccepted =
        booking.AcknowledgementAccepted,

                        AcknowledgementAcceptedAt =
        booking.AcknowledgementAcceptedAt,

                        AcknowledgementPolicyType =
                            booking.AcknowledgementPolicyType,

                        AcknowledgementPolicyVersion =
                            booking.AcknowledgementPolicyVersion,

                        UserId = booking.UserId,
                        EventId = eventEntity.EventId,
                        VenueId = venue.VenueId,
                        BookingStatusId = pendingStatus.BookingStatusId,
                        StatusName =
                            pendingStatus.StatusName,
                        EventName =
                            eventEntity.EventName,
                        VenueName =
                            venue.VenueName
                    }
                });
            }
            catch
            {
                // DIBA-specific transaction recovery:
                // if either the event or booking cannot be saved,
                // undo the database changes made during this operation.
                await transaction.RollbackAsync();
                throw;
            }
        }

        // PUT: api/Events/{id}
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Event Organiser")]
        public async Task<IActionResult> UpdateEvent(
            Guid id,
            UpdateEventDto updateEventDto)
        {
            // Reference: Microsoft Learn, "Claim-based authorization
            // in ASP.NET Core".
            // Similar logic: identifying the authenticated user through
            // a claim.
            // DIBA adaptation: used to determine which organiser owns
            // the event being updated.
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(
                    "User ID could not be determined.");
            }

            if (!Guid.TryParse(
                    userIdClaim.Value,
                    out Guid userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            var eventEntity = await _dbContext.Events
                .FirstOrDefaultAsync(
                    eventEntity => eventEntity.EventId == id);

            if (eventEntity == null)
            {
                return NotFound("Event not found.");
            }

            // DIBA-specific ownership rule:
            // only the organiser who created the event can modify it.
            if (eventEntity.UserId != userId)
            {
                return Forbid();
            }

            // Reference: ErmaoCyber, "meeting-room-reservation-api".
            // Similar logic: validating the requested reservation period.
            if (updateEventDto.EndDateTime <=
                updateEventDto.StartDateTime)
            {
                return BadRequest(
                    "End date and time must be after the start date and time.");
            }

            var venue = await _dbContext.Venues
                .FirstOrDefaultAsync(
                    venue => venue.VenueId ==
                             updateEventDto.VenueId);

            if (venue == null)
            {
                return NotFound("Venue not found.");
            }

            if (!int.TryParse(updateEventDto.EventAttendance, out var expectedAttendees) ||
                expectedAttendees < 1)
            {
                return BadRequest("Expected attendees must be a whole number greater than zero.");
            }

            if (expectedAttendees > venue.Capacity)
            {
                return BadRequest($"Expected attendees cannot exceed the venue capacity of {venue.Capacity}.");
            }

            // DIBA-specific venue availability rule.
            if (!venue.VenueStatus.Equals(
                    "Available",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "The selected venue is not currently available.");
            }

            // Reference: ErmaoCyber, "meeting-room-reservation-api".
            // Reference: JedAngelo, "ConferenceBookingApi".
            // Similar logic: checking for another booking whose time
            // overlaps the requested time.
            //
            // DIBA adaptation: the current event's own booking is excluded
            // using EventId != eventEntity.EventId.
            var hasConflict =
                await _dbContext.Bookings.AnyAsync(booking =>
                    booking.VenueId == updateEventDto.VenueId &&
                    booking.StartDateTime <
                        updateEventDto.EndDateTime &&
                    booking.EndDateTime >
                        updateEventDto.StartDateTime &&
                    booking.EventId != eventEntity.EventId &&
                    booking.BookingStatus != null &&
                    (booking.BookingStatus.StatusName == "Pending" ||
                     booking.BookingStatus.StatusName == "Approved"));

            if (hasConflict)
            {
                return Conflict(
                    "The selected venue is already booked or awaiting approval for the requested time.");
            }

            // Keep event schedule and its linked booking in sync. Approved
            // reservations require a staff-managed change instead of being
            // silently moved by editing the event details.
            var linkedBookings = await _dbContext.Bookings
                .Include(booking => booking.BookingStatus)
                .Where(booking => booking.EventId == eventEntity.EventId)
                .ToListAsync();

            var scheduleOrVenueChanged =
                eventEntity.StartDateTime != updateEventDto.StartDateTime ||
                eventEntity.EndDateTime != updateEventDto.EndDateTime ||
                eventEntity.VenueId != updateEventDto.VenueId;

            if (scheduleOrVenueChanged &&
                linkedBookings.Any(booking =>
                    booking.BookingStatus != null &&
                    booking.BookingStatus.StatusName == "Approved"))
            {
                return Conflict(
                    "This event has an approved venue booking. Contact Conference Centre Staff to change its date, time, or venue.");
            }

            eventEntity.EventName =
                updateEventDto.EventName;

            eventEntity.EventDescription =
                updateEventDto.EventDescription;

            eventEntity.EventType =
                updateEventDto.EventType;

            eventEntity.EventAttendance =
                updateEventDto.EventAttendance;

            eventEntity.StartDateTime =
                updateEventDto.StartDateTime;

            eventEntity.EndDateTime =
                updateEventDto.EndDateTime;

            eventEntity.VenueId =
                updateEventDto.VenueId;

            _dbContext.AuditLogs.Add(new AuditLog
            {
                AuditLogId = Guid.NewGuid(),
                Action = "Event Updated",
                LogDescription = $"Event '{eventEntity.EventName}' ({eventEntity.EventId}) was updated. Schedule or venue changed: {scheduleOrVenueChanged}.",
                Timestamp = DateTime.UtcNow,
                UserId = userId
            });

            // Pending requests follow the updated event schedule and venue,
            // so the event list and booking list cannot show conflicting data.
            foreach (var linkedBooking in linkedBookings)
            {
                if (linkedBooking.BookingStatus != null &&
                    linkedBooking.BookingStatus.StatusName == "Pending")
                {
                    linkedBooking.StartDateTime = updateEventDto.StartDateTime;
                    linkedBooking.EndDateTime = updateEventDto.EndDateTime;
                    linkedBooking.VenueId = updateEventDto.VenueId;
                }
            }

            await _dbContext.SaveChangesAsync();

            var response = new EventResponseDto
            {
                EventId = eventEntity.EventId,
                EventName = eventEntity.EventName,
                EventDescription =
                    eventEntity.EventDescription,
                EventType = eventEntity.EventType,
                EventAttendance =
                    eventEntity.EventAttendance,
                StartDateTime =
                    eventEntity.StartDateTime,
                EndDateTime =
                    eventEntity.EndDateTime,
                VenueId = eventEntity.VenueId,
                UserId = eventEntity.UserId
            };

            return Ok(response);
        }
    }
}
