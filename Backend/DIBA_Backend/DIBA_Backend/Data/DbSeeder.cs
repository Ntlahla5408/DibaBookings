using DIBA_Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DIBA_Backend.Data
{
    public static class DbSeeder
    {
        // Fixed IDs make relationships predictable and prevent duplicate seed records.
        private static readonly Guid AdminRoleId =
            new("11111111-1111-1111-1111-111111111111");

        private static readonly Guid StaffRoleId =
            new("22222222-2222-2222-2222-222222222222");

        private static readonly Guid OrganiserRoleId =
            new("33333333-3333-3333-3333-333333333333");

        private static readonly Guid PendingStatusId =
            new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

        private static readonly Guid ApprovedStatusId =
            new("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

        private static readonly Guid RejectedStatusId =
            new("cccccccc-cccc-cccc-cccc-cccccccccccc");

        private static readonly Guid CancelledStatusId =
            new("dddddddd-dddd-dddd-dddd-dddddddddddd");

        private static readonly Guid CompletedStatusId =
            new("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");

        public static async Task SeedAsync(DIBABookingsDbContext db)
        {
            // Make sure the database is up to date before inserting seed data.
            await db.Database.MigrateAsync();

            await SeedUsersAsync(db);
            await SeedVenuesAsync(db);
            await SeedEventsAndBookingsAsync(db);
            await SeedHelpContentAsync(db);
        }

        // Seed published help content without replacing policies that staff have edited.
        private static async Task SeedHelpContentAsync(DIBABookingsDbContext db)
        {
            if (!await db.FAQs.AnyAsync())
            {
                db.FAQs.AddRange(
                    new FAQ
                    {
                        FAQId = Guid.NewGuid(),
                        Question = "How do I submit a venue booking?",
                        Answer = "Sign in as an Event Organiser, create your event, select a venue and time, review the details, and submit the booking request. The request remains pending until it is reviewed.",
                        Category = "Bookings",
                        IsPublished = true
                    },
                    new FAQ
                    {
                        FAQId = Guid.NewGuid(),
                        Question = "Why is my booking still pending?",
                        Answer = "A pending booking means it has been submitted but has not yet been approved or rejected by authorised staff. Check your notifications for updates.",
                        Category = "Bookings",
                        IsPublished = true
                    },
                    new FAQ
                    {
                        FAQId = Guid.NewGuid(),
                        Question = "Can I cancel or change my booking?",
                        Answer = "Use the booking options available in the application or contact staff for assistance. Any cancellation or change is subject to the current policy shown by the application.",
                        Category = "Changes and cancellations",
                        IsPublished = true
                    },
                    new FAQ
                    {
                        FAQId = Guid.NewGuid(),
                        Question = "How long does a refund take?",
                        Answer = "Refund requests must be reviewed by authorised staff. This demonstration system does not define an official refund timeframe. Please contact staff for confirmation before relying on a timeframe.",
                        Category = "Payments and refunds",
                        IsPublished = true
                    },
                    new FAQ
                    {
                        FAQId = Guid.NewGuid(),
                        Question = "What if venue equipment or property is damaged?",
                        Answer = "Report any damage or incident to Conference Centre staff as soon as possible. Responsibility should be assessed under the applicable booking terms and university rules.",
                        Category = "Venue rules",
                        IsPublished = true
                    });
            }

            var policies = new[]
            {
                new
                {
                    Type = "TermsOfUse",
                    Title = "DIBA Bookings Terms and Conditions",
                    Content = @"1. USING DIBA BOOKINGS

DIBA Bookings is used to submit and manage requests to use Nelson Mandela University Conference Centre venues. Users must provide complete, accurate and up-to-date information and use the system only for legitimate booking purposes.

2. SUBMITTING A BOOKING

A booking request must be submitted at least seven calendar days before the requested event date. Requests are subject to venue availability and review by authorised Conference Centre staff. Submitting a request does not mean the venue has been reserved or that the request has been approved. A booking is confirmed only when its status is approved through the system or confirmation is provided by authorised staff.

Organisers must provide the event name, purpose, date and times, expected attendance, selected venue, contact details and any relevant requirements. The expected attendance must not exceed the venue's stated capacity. Organisers must promptly notify staff if information changes.

3. CHANGES AND CANCELLATIONS

Organisers should submit booking changes or cancellation requests through the available booking process as soon as possible. A request to change or cancel is not complete until it has been acknowledged by authorised staff or reflected in the booking status. Venue availability and any applicable cancellation or refund conditions will be considered.

4. USE OF THE VENUE

Organisers are responsible for ensuring that their attendees follow the Venue Use and Safety Rules, respect the venue and equipment, observe capacity limits, and follow reasonable instructions from Conference Centre staff. The venue may only be used for the purpose described in the approved booking unless a change has been agreed with staff.

5. PAYMENTS AND CHARGES

Any venue fee, payment deadline, deposit, cancellation charge or refund condition applicable to a booking must be communicated through the relevant booking information or by authorised Conference Centre staff. This document does not establish an unlisted fee or a fixed refund timeframe.

6. PERSONAL INFORMATION

Personal information submitted through DIBA Bookings is handled as described in the DIBA Bookings Privacy Notice and applicable data-protection law.

7. SYSTEM USE AND COMMUNICATION

Users must keep their account credentials secure, provide truthful information, and promptly report suspected unauthorised access or incorrect booking records. System messages and booking-status updates should be checked regularly.

8. APPLICABLE REQUIREMENTS

Bookings and use of facilities remain subject to applicable Nelson Mandela University requirements, venue-specific instructions and South African law. If a provision of these terms conflicts with a mandatory legal requirement, the legal requirement takes precedence."
                },
                new
                {
                    Type = "VenueRules",
                    Title = "Venue Use and Safety Rules",
                    Content = @"1. APPROVED USE

Use the venue only for the activity and time period stated in the approved booking. Obtain staff approval before changing the event purpose, room arrangement, schedule or expected attendance.

2. ATTENDANCE AND ACCESS

The number of attendees must remain within the venue's stated capacity. Organisers are responsible for coordinating attendee arrival, access and departure and for following any access instructions provided by Conference Centre staff.

3. FURNITURE, EQUIPMENT AND FACILITIES

Use furniture, presentation equipment, audio-visual systems and other facilities carefully and only for their intended purpose. Do not move, install, attach or modify equipment or fixtures without permission. Report equipment faults, damage or missing items to Conference Centre staff promptly.

4. CLEANLINESS AND SET-UP

Keep the venue and surrounding areas orderly. Follow staff instructions about room layout, decorations, catering, waste disposal, set-up and clearing the venue after the event. Do not leave personal belongings, materials or equipment behind.

5. SAFETY AND CONDUCT

Attendees must behave respectfully and follow reasonable instructions from Conference Centre staff. Do not block entrances, exits, corridors or emergency equipment. Do not bring prohibited, dangerous or unlawful items into the venue or engage in activities that create an unreasonable safety risk.

6. INCIDENTS AND EMERGENCIES

Notify Conference Centre staff promptly about accidents, injuries, hazards, damage, lost property or other incidents. In an emergency, follow the venue's emergency procedures and instructions from authorised personnel.

7. ACCESSIBILITY AND SPECIAL ARRANGEMENTS

Raise accessibility, layout, equipment or other special requirements when submitting the booking so that arrangements can be discussed before the event. Any arrangement requiring staff, equipment or additional facilities is subject to confirmation.

8. COMPLIANCE

Organisers are responsible for communicating these rules to attendees and ensuring that the approved booking conditions are followed. Additional venue-specific instructions provided by authorised staff must also be observed."
                },
                new
                {
                    Type = "PrivacyNotice",
                    Title = "DIBA Bookings Privacy Notice",
                    Content = @"1. PURPOSE OF THIS NOTICE

This notice explains how personal information is handled when you use DIBA Bookings to request, administer or support a venue booking.

2. INFORMATION THAT MAY BE COLLECTED

Depending on how you use the service, information may include your name, contact details, account information, event details, booking dates and times, expected attendance, selected venue, special requirements, communications about a booking and records of actions taken in the system.

3. WHY INFORMATION IS USED

Information is used to create and manage user accounts, assess and administer booking requests, communicate booking decisions and changes, coordinate venue arrangements, respond to support requests, maintain security, prevent misuse, keep appropriate operational records and meet applicable legal or university obligations.

4. ACCESS AND SHARING

Access to booking information is limited to authorised personnel who need it for booking administration, venue operations, support, security or related responsibilities. Information may be shared with relevant service providers where needed to operate the service, subject to appropriate safeguards, or where disclosure is required or permitted by law.

5. SECURITY AND RETENTION

Reasonable technical and organisational measures are used to protect personal information against loss, unauthorised access, use, alteration or disclosure. Information is retained for as long as needed for the purposes for which it was collected and for applicable recordkeeping, legal and university requirements.

6. YOUR RIGHTS

Subject to applicable law, you may request access to personal information held about you, ask for inaccurate information to be corrected, raise concerns about how it is handled, or exercise other rights available under the Protection of Personal Information Act (POPIA). Identity verification may be required before a request is processed.

7. QUESTIONS OR REQUESTS

For questions about personal information connected with a booking, contact the Conference Centre through its usual official contact channels and ask for the appropriate privacy contact. Requests will be directed to the responsible university office where necessary.

8. LEGAL FRAMEWORK

Personal information is handled in accordance with applicable South African data-protection requirements, including POPIA."
                },
                new
                {
                    Type = "CancellationAndRefund",
                    Title = "Booking Changes, Cancellations and Refunds",
                    Content = @"1. CHANGING A BOOKING

Submit requests to change the event date, time, venue, attendance or other material booking details through the available booking process as soon as the change is known. Changes depend on availability and must be confirmed by authorised Conference Centre staff.

2. CANCELLING A BOOKING

Submit a cancellation request through the available booking process or contact Conference Centre staff. Check the booking status or obtain confirmation from staff to ensure that the cancellation has been recorded.

3. FEES AND REFUNDS

Any cancellation charges, deposits, payment deadlines and refund conditions applicable to a booking must be communicated in the relevant booking information or by authorised Conference Centre staff. Refund eligibility and any amount due depend on the terms applicable to that booking and relevant legal requirements. No refund should be assumed until the request has been reviewed and the outcome communicated.

4. UNIVERSITY OR VENUE CHANGES

If the Conference Centre needs to change or cancel an approved booking, staff will communicate the available information and next steps to the organiser.

5. TIMELY COMMUNICATION

Organisers should notify the Conference Centre as early as possible about changes or cancellations so that availability can be managed and any applicable conditions can be explained.

6. QUESTIONS

For a question about a particular cancellation, payment or refund, contact the Conference Centre through its usual official contact channels and include the booking reference where available."
                }
            };

            foreach (var policyContent in policies)
            {
                var versions = await db.PolicyDocuments
                    .Where(policy => policy.PolicyType == policyContent.Type)
                    .OrderByDescending(policy => policy.Version)
                    .ToListAsync();

                var currentPolicy = versions.FirstOrDefault(policy => policy.IsActive);

                if (currentPolicy != null && !currentPolicy.IsSamplePolicy)
                {
                    continue;
                }

                if (currentPolicy != null)
                {
                    currentPolicy.IsActive = false;
                    currentPolicy.UpdatedAt = DateTime.UtcNow;
                }

                db.PolicyDocuments.Add(new PolicyDocument
                {
                    PolicyDocumentId = Guid.NewGuid(),
                    PolicyType = policyContent.Type,
                    Title = policyContent.Title,
                    Content = policyContent.Content,
                    Version = versions.Count == 0 ? 1 : versions.Max(policy => policy.Version) + 1,
                    IsActive = true,
                    IsSamplePolicy = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            await db.SaveChangesAsync();
        }

        private static async Task SeedUsersAsync(DIBABookingsDbContext db)
        {
            // Roles are already seeded by DIBABookingsDbContext.OnModelCreating().
            var admin = await GetOrCreateUserAsync(
                db,
                "admin@diba.local",
                "DIBA",
                "Administrator",
                AdminRoleId,
                "Admin@123");

            var staff = await GetOrCreateUserAsync(
                db,
                "staff@diba.local",
                "Conference Centre",
                "Staff",
                StaffRoleId,
                "Staff@123");

            await GetOrCreateUserAsync(
                db,
                "organiser@diba.local",
                "Test",
                "Organiser",
                OrganiserRoleId,
                "Organiser@123");

            await db.SaveChangesAsync();
        }

        private static async Task<User> GetOrCreateUserAsync(
            DIBABookingsDbContext db,
            string email,
            string firstName,
            string lastName,
            Guid roleId,
            string password)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user != null)
                return user;

            user = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                RoleId = roleId
            };

            db.Users.Add(user);
            return user;
        }

        private static async Task SeedVenuesAsync(DIBABookingsDbContext db)
        {
            const string location =
                "North Campus Conference Centre, Nelson Mandela University, Gqeberha";

            const double latitude = -34.001278;
            const double longitude = 25.673250;

            var theatre = await GetOrCreateVenueAsync(
                db,
                "Theatre",
                "Prestigious main conference theatre. Standard seating for 120 delegates and a maximum of 150 delegates with additional loose seating.",
                150,
                12500.00m,
                location,
                "Available",
                latitude,
                longitude);

            var venue2 = await GetOrCreateVenueAsync(
                db,
                "Venue 2",
                "Smaller breakaway room suitable for training, seminars and meetings.",
                40,
                8500.00m,
                location,
                "Available",
                latitude,
                longitude);

            var venue3 = await GetOrCreateVenueAsync(
                db,
                "Venue 3",
                "Smaller breakaway room suitable for training, seminars and meetings.",
                40,
                8500.00m,
                location,
                "Available",
                latitude,
                longitude);

            var restaurant = await GetOrCreateVenueAsync(
                db,
                "Restaurant",
                "On-site restaurant suitable for business breakfasts, lunches and evening functions. Seats up to 150 diners.",
                150,
                12500.00m,
                location,
                "Available",
                latitude,
                longitude);

            var foyer = await GetOrCreateVenueAsync(
                db,
                "Exhibition Foyer",
                "Multi-purpose foyer suitable for cocktail functions, small exhibitions, product launches and displays. Capacity is flexible and should be confirmed with Conference Centre staff.",
                0,
                6000.00m,
                location,
                "Available",
                latitude,
                longitude); ;

            await db.SaveChangesAsync();

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "Rear Projection Data Projector",
                "Rear projection data projector available in the Theatre.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "Remote Controlled Audio and Lighting",
                "Remote controlled audio and lighting system.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "Flipchart",
                "Flipchart available for presentations and meetings.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "Whiteboard",
                "Whiteboard available.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "OHP",
                "Overhead projector.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "PA System",
                "Public address system.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "TV/Video",
                "TV and video equipment.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "Individual Delegate Microphones",
                "Individual delegate microphones available in the Theatre.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "Podium",
                "Presentation podium.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "Motorised Screens",
                "Two motorised presentation screens.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "Lapel Microphones",
                "Lapel microphones for presenters.");

            await AddFeatureIfMissingAsync(db, theatre.VenueId,
                "DVD",
                "DVD playback equipment.");

            foreach (var venue in new[] { theatre, venue2, venue3, restaurant, foyer })
            {
                await AddFeatureIfMissingAsync(db, venue.VenueId,
                    "Air Conditioning",
                    "All venues are air-conditioned.");

                await AddFeatureIfMissingAsync(db, venue.VenueId,
                    "Wheelchair Friendly",
                    "The Conference Centre is wheelchair friendly.");

                await AddFeatureIfMissingAsync(db, venue.VenueId,
                    "Free Secure Parking",
                    "Free secure parking is available on site.");

                await AddFeatureIfMissingAsync(db, venue.VenueId,
                    "On-site Catering",
                    "On-site catering is available.");

                await AddFeatureIfMissingAsync(db, venue.VenueId,
                    "Bar Facilities",
                    "Full bar facilities are available.");
            }

            await AddFeatureIfMissingAsync(db, foyer.VenueId,
                "Exhibition Space",
                "The foyer can be used for small exhibitions, displays and product launches.");

            await AddFeatureIfMissingAsync(db, venue2.VenueId,
                "Breakaway Room",
                "Suitable as a breakaway room for training, seminars and meetings.");

            await AddFeatureIfMissingAsync(db, venue3.VenueId,
                "Breakaway Room",
                "Suitable as a breakaway room for training, seminars and meetings.");

            await db.SaveChangesAsync();
        }

        private static async Task<Venue> GetOrCreateVenueAsync(
            DIBABookingsDbContext db,
            string name,
            string description,
            int capacity,
            decimal price,
            string location,
            string status,
            double latitude,
            double longitude)
        {
            var venue = await db.Venues
                .FirstOrDefaultAsync(v => v.VenueName == name);

            if (venue != null)
            {
                venue.Latitude = latitude;
                venue.Longitude = longitude;
                venue.Price = price;

                return venue;
            }

            venue = new Venue
            {
                VenueId = Guid.NewGuid(),
                VenueName = name,
                VenueDescription = description,
                Capacity = capacity,
                Price = price,
                Location = location,
                VenueStatus = status,
                Latitude = latitude,
                Longitude = longitude
            };

            db.Venues.Add(venue);

            return venue;
        }

        private static async Task AddFeatureIfMissingAsync(
            DIBABookingsDbContext db,
            Guid venueId,
            string featureName,
            string description)
        {
            var exists = await db.VenueFeatures.AnyAsync(vf =>
                vf.VenueId == venueId &&
                vf.FeatureName == featureName);

            if (exists)
                return;

            db.VenueFeatures.Add(new VenueFeature
            {
                VenueFeatureId = Guid.NewGuid(),
                FeatureName = featureName,
                FeatureDescription = description,
                FeatureStatus = "Available",
                VenueId = venueId
            });
        }

        private static async Task SeedEventsAndBookingsAsync(DIBABookingsDbContext db)
        {
            var organiser = await db.Users
                .FirstAsync(u => u.Email == "organiser@diba.local");

            var staff = await db.Users
                .FirstAsync(u => u.Email == "staff@diba.local");

            var theatre = await db.Venues
                .FirstAsync(v => v.VenueName == "Theatre");

            var venue2 = await db.Venues
                .FirstAsync(v => v.VenueName == "Venue 2");

            var venue3 = await db.Venues
                .FirstAsync(v => v.VenueName == "Venue 3");

            var restaurant = await db.Venues
                .FirstAsync(v => v.VenueName == "Restaurant");

            var foyer = await db.Venues
                .FirstAsync(v => v.VenueName == "Exhibition Foyer");

            var now = DateTime.UtcNow;

            // Event 1 - pending booking
            var pendingEvent = await GetOrCreateEventAsync(
                db,
                "NMU Technology and Innovation Seminar",
                "A seminar showcasing student technology and innovation projects.",
                "Seminar",
                "80 delegates",
                now.AddDays(7).Date.AddHours(9),
                now.AddDays(7).Date.AddHours(15),
                theatre.VenueId,
                organiser.UserId);

            var pendingBooking = await GetOrCreateBookingAsync(
                db,
                pendingEvent,
                theatre,
                organiser,
                PendingStatusId,
                now.AddDays(7).Date.AddHours(9),
                now.AddDays(7).Date.AddHours(15),
                "Projector, PA system and microphones required.",
                null);

            // Event 2 - approved booking
            var approvedEvent = await GetOrCreateEventAsync(
                db,
                "Business Leadership Workshop",
                "A professional development workshop for business leaders.",
                "Workshop",
                "35 delegates",
                now.AddDays(12).Date.AddHours(9),
                now.AddDays(12).Date.AddHours(16),
                venue2.VenueId,
                organiser.UserId);

            var approvedBooking = await GetOrCreateBookingAsync(
                db,
                approvedEvent,
                venue2,
                organiser,
                ApprovedStatusId,
                now.AddDays(12).Date.AddHours(9),
                now.AddDays(12).Date.AddHours(16),
                "Room should be arranged in a classroom layout.",
                "Approved by Conference Centre Staff.");

            // Event 3 - rejected booking
            var rejectedEvent = await GetOrCreateEventAsync(
                db,
                "Large Community Conference",
                "A community conference requiring a large venue.",
                "Conference",
                "180 delegates",
                now.AddDays(18).Date.AddHours(9),
                now.AddDays(18).Date.AddHours(17),
                theatre.VenueId,
                organiser.UserId);

            var rejectedBooking = await GetOrCreateBookingAsync(
                db,
                rejectedEvent,
                theatre,
                organiser,
                RejectedStatusId,
                now.AddDays(18).Date.AddHours(9),
                now.AddDays(18).Date.AddHours(17),
                "Additional seating requested.",
                "Rejected because the requested attendance exceeds the venue's maximum capacity.");

            // Event 4 - cancelled booking
            var cancelledEvent = await GetOrCreateEventAsync(
                db,
                "Staff Training Session",
                "Internal staff training and development session.",
                "Training",
                "30 delegates",
                now.AddDays(25).Date.AddHours(10),
                now.AddDays(25).Date.AddHours(14),
                venue3.VenueId,
                organiser.UserId);

            var cancelledBooking = await GetOrCreateBookingAsync(
                db,
                cancelledEvent,
                venue3,
                organiser,
                CancelledStatusId,
                now.AddDays(25).Date.AddHours(10),
                now.AddDays(25).Date.AddHours(14),
                "Whiteboard and flipchart required.",
                "Cancelled by the event organiser.");

            // Event 5 - completed booking
            var completedStart = now.AddDays(-14).Date.AddHours(9);

            var completedEvent = await GetOrCreateEventAsync(
                db,
                "NMU Alumni Networking Breakfast",
                "A networking breakfast for Nelson Mandela University alumni.",
                "Networking",
                "100 delegates",
                completedStart,
                completedStart.AddHours(4),
                restaurant.VenueId,
                organiser.UserId);

            var completedBooking = await GetOrCreateBookingAsync(
                db,
                completedEvent,
                restaurant,
                organiser,
                CompletedStatusId,
                completedStart,
                completedStart.AddHours(4),
                "Breakfast catering required.",
                "Event completed successfully.");

            await db.SaveChangesAsync();

            // Payment for the completed booking.
            if (!await db.Payments.AnyAsync(p => p.BookingId == completedBooking.BookingId))
            {
                db.Payments.Add(new Payment
                {
                    PaymentId = Guid.NewGuid(),
                    Amount = 12500.00m,
                    PaymentDate = completedStart.AddDays(-5),
                    ReferenceNumber = "DIBA-PAY-0001",
                    BookingId = completedBooking.BookingId
                });
            }

            // Payment for the approved booking.
            if (!await db.Payments.AnyAsync(p => p.BookingId == approvedBooking.BookingId))
            {
                db.Payments.Add(new Payment
                {
                    PaymentId = Guid.NewGuid(),
                    Amount = 8500.00m,
                    PaymentDate = now.AddDays(-1),
                    ReferenceNumber = "DIBA-PAY-0002",
                    BookingId = approvedBooking.BookingId
                });
            }

            // Notifications for the organiser.
            await AddNotificationIfMissingAsync(
                db,
                organiser.UserId,
                pendingBooking.BookingId,
                "Booking",
                "Your booking request for the NMU Technology and Innovation Seminar is pending approval.",
                false);

            await AddNotificationIfMissingAsync(
                db,
                organiser.UserId,
                approvedBooking.BookingId,
                "Booking Approved",
                "Your Business Leadership Workshop booking has been approved.",
                false);

            await AddNotificationIfMissingAsync(
                db,
                organiser.UserId,
                rejectedBooking.BookingId,
                "Booking Rejected",
                "Your Large Community Conference booking was rejected because the requested attendance exceeds the venue capacity.",
                false);

            await AddNotificationIfMissingAsync(
                db,
                organiser.UserId,
                cancelledBooking.BookingId,
                "Booking Cancelled",
                "Your Staff Training Session booking has been cancelled.",
                true);

            await AddNotificationIfMissingAsync(
                db,
                organiser.UserId,
                completedBooking.BookingId,
                "Booking Completed",
                "Your NMU Alumni Networking Breakfast booking has been completed.",
                true);

            // Audit records.
            await AddAuditLogIfMissingAsync(
                db,
                organiser.UserId,
                "Created Booking",
                "Created a booking request for the NMU Technology and Innovation Seminar.");

            await AddAuditLogIfMissingAsync(
                db,
                staff.UserId,
                "Approved Booking",
                "Approved the Business Leadership Workshop booking.");

            await AddAuditLogIfMissingAsync(
                db,
                staff.UserId,
                "Rejected Booking",
                "Rejected the Large Community Conference booking because requested attendance exceeded venue capacity.");

            await db.SaveChangesAsync();
        }

        private static async Task<Event> GetOrCreateEventAsync(
            DIBABookingsDbContext db,
            string name,
            string description,
            string type,
            string attendance,
            DateTime start,
            DateTime end,
            Guid venueId,
            Guid userId)
        {
            var existing = await db.Events.FirstOrDefaultAsync(e => e.EventName == name);

            if (existing != null)
                return existing;

            var eventEntity = new Event
            {
                EventId = Guid.NewGuid(),
                EventName = name,
                EventDescription = description,
                EventType = type,
                EventAttendance = attendance,
                StartDateTime = start,
                EndDateTime = end,
                VenueId = venueId,
                UserId = userId
            };

            db.Events.Add(eventEntity);
            return eventEntity;
        }

        private static async Task<Booking> GetOrCreateBookingAsync(
            DIBABookingsDbContext db,
            Event eventEntity,
            Venue venue,
            User user,
            Guid statusId,
            DateTime start,
            DateTime end,
            string specialRequirements,
            string? adminNotes)
        {
            var existing = await db.Bookings.FirstOrDefaultAsync(b =>
                b.EventId == eventEntity.EventId &&
                b.VenueId == venue.VenueId);

            if (existing != null)
                return existing;

            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                BookingDate = DateTime.UtcNow,
                StartDateTime = start,
                EndDateTime = end,
                SpecialRequirements = specialRequirements,
                AdminNotes = adminNotes,
                UserId = user.UserId,
                EventId = eventEntity.EventId,
                VenueId = venue.VenueId,
                BookingStatusId = statusId
            };

            db.Bookings.Add(booking);
            return booking;
        }

        private static async Task AddNotificationIfMissingAsync(
            DIBABookingsDbContext db,
            Guid userId,
            Guid bookingId,
            string type,
            string message,
            bool isRead)
        {
            var exists = await db.Notifications.AnyAsync(n =>
                n.UserId == userId &&
                n.BookingId == bookingId &&
                n.Message == message);

            if (exists)
                return;

            db.Notifications.Add(new Notification
            {
                NotificationId = Guid.NewGuid(),
                NotificationType = type,
                Message = message,
                DateCreated = DateTime.UtcNow,
                IsRead = isRead,
                UserId = userId,
                BookingId = bookingId
            });
        }

        private static async Task AddAuditLogIfMissingAsync(
            DIBABookingsDbContext db,
            Guid userId,
            string action,
            string description)
        {
            var exists = await db.AuditLogs.AnyAsync(a =>
                a.UserId == userId &&
                a.Action == action &&
                a.LogDescription == description);

            if (exists)
                return;

            db.AuditLogs.Add(new AuditLog
            {
                AuditLogId = Guid.NewGuid(),
                Action = action,
                LogDescription = description,
                Timestamp = DateTime.UtcNow,
                UserId = userId
            });
        }
    }
}
