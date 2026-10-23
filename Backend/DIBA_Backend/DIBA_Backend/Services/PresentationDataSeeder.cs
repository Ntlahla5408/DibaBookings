using DIBA_Backend.Data;
using DIBA_Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DIBA_Backend.Services;

/// <summary>
/// Adds clearly fictional, presentation-only records to a local DIBA database.
/// This is deliberately invoked only with --seed-presentation-data; it is not
/// called during normal application startup and never deletes existing data.
/// </summary>
public static class PresentationDataSeeder
{
    private static readonly Guid AdministratorRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid StaffRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid OrganiserRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    private static readonly Guid PendingStatusId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid ApprovedStatusId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static readonly Guid RejectedStatusId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static readonly Guid CancelledStatusId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");
    private static readonly Guid CompletedStatusId = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");

    private static readonly Guid AdminId = Guid.Parse("10000000-0000-0000-0000-000000000001");
    private static readonly Guid StaffId = Guid.Parse("10000000-0000-0000-0000-000000000002");
    private static readonly Guid OrganiserId = Guid.Parse("10000000-0000-0000-0000-000000000003");

    private static readonly Guid AuditoriumId = Guid.Parse("20000000-0000-0000-0000-000000000001");
    private static readonly Guid SeminarRoomId = Guid.Parse("20000000-0000-0000-0000-000000000002");
    private static readonly Guid BoardroomId = Guid.Parse("20000000-0000-0000-0000-000000000003");
    private static readonly Guid TrainingRoomId = Guid.Parse("20000000-0000-0000-0000-000000000004");

    private static readonly Guid CompletedBookingId = Guid.Parse("30000000-0000-0000-0000-000000000001");
    private static readonly Guid ApprovedBookingId = Guid.Parse("30000000-0000-0000-0000-000000000002");
    private static readonly Guid PendingBookingId = Guid.Parse("30000000-0000-0000-0000-000000000003");
    private static readonly Guid RejectedBookingId = Guid.Parse("30000000-0000-0000-0000-000000000004");
    private static readonly Guid CancelledBookingId = Guid.Parse("30000000-0000-0000-0000-000000000005");

    public static async Task SeedAsync(DIBABookingsDbContext db)
    {
        string[] demoEmails =
        [
            "admin.demo@diba.local",
            "staff.demo@diba.local",
            "organiser.demo@diba.local"
        ];

        string[] samplePolicyTypes = ["VenueRules", "Cancellation", "Privacy", "Terms"];
        bool alreadySeeded =
            await db.Users.AnyAsync(user => demoEmails.Contains(user.Email)) ||
            await db.Venues.AnyAsync(venue => venue.VenueId == AuditoriumId) ||
            await db.SupportTickets.AnyAsync(ticket => ticket.TicketNumber == "DEMO-1001") ||
            await db.PolicyDocuments.AnyAsync(policy =>
                policy.Version == 1 && samplePolicyTypes.Contains(policy.PolicyType));

        if (alreadySeeded)
        {
            throw new InvalidOperationException(
                "Presentation demo data appears to exist already. No records were changed. " +
                "Use the existing demo accounts rather than running the seeder again.");
        }

        var roleNames = await db.Roles
            .Where(role => role.RoleId == AdministratorRoleId ||
                           role.RoleId == StaffRoleId ||
                           role.RoleId == OrganiserRoleId)
            .Select(role => role.RoleName)
            .ToListAsync();

        if (!roleNames.Contains("Administrator") ||
            !roleNames.Contains("Staff") ||
            !roleNames.Contains("Event Organiser"))
        {
            throw new InvalidOperationException(
                "The expected DIBA roles are missing. Apply the existing migrations before seeding; " +
                "this seeder does not create or modify schema or role definitions.");
        }

        var statusNames = await db.BookingStatuses
            .Where(status => status.BookingStatusId == PendingStatusId ||
                             status.BookingStatusId == ApprovedStatusId ||
                             status.BookingStatusId == RejectedStatusId ||
                             status.BookingStatusId == CancelledStatusId ||
                             status.BookingStatusId == CompletedStatusId)
            .Select(status => status.StatusName)
            .ToListAsync();

        if (!statusNames.Contains("Pending") ||
            !statusNames.Contains("Approved") ||
            !statusNames.Contains("Rejected") ||
            !statusNames.Contains("Cancelled") ||
            !statusNames.Contains("Completed"))
        {
            throw new InvalidOperationException(
                "The expected booking statuses are missing. Apply the existing migrations before seeding.");
        }

        await using var transaction = await db.Database.BeginTransactionAsync();

        DateTime today = DateTime.Today;
        DateTime nowUtc = DateTime.UtcNow;
        const string demoPassword = "DibaDemo2026!";

        var admin = new User
        {
            UserId = AdminId, FirstName = "Avery", LastName = "Admin",
            Email = demoEmails[0], PasswordHash = BCrypt.Net.BCrypt.HashPassword(demoPassword),
            RoleId = AdministratorRoleId, IsActive = true
        };
        var staff = new User
        {
            UserId = StaffId, FirstName = "Sam", LastName = "Staff",
            Email = demoEmails[1], PasswordHash = BCrypt.Net.BCrypt.HashPassword(demoPassword),
            RoleId = StaffRoleId, IsActive = true
        };
        var organiser = new User
        {
            UserId = OrganiserId, FirstName = "Taylor", LastName = "Organiser",
            Email = demoEmails[2], PasswordHash = BCrypt.Net.BCrypt.HashPassword(demoPassword),
            RoleId = OrganiserRoleId, IsActive = true
        };
        db.Users.AddRange(admin, staff, organiser);

        var auditorium = new Venue
        {
            VenueId = AuditoriumId, VenueName = "Main Conference Auditorium",
            VenueDescription = "Large presentation space for conferences, launches and formal gatherings.",
            Capacity = 220, Price = 6500m, Location = "NMU Conference Centre, Gqeberha",
            Latitude = -33.9321, Longitude = 25.5708, VenueStatus = "Available"
        };
        var seminarRoom = new Venue
        {
            VenueId = SeminarRoomId, VenueName = "Seminar Room 1",
            VenueDescription = "Flexible room for workshops, training sessions and small seminars.",
            Capacity = 45, Price = 1800m, Location = "NMU Conference Centre, Gqeberha",
            Latitude = -33.9324, Longitude = 25.5705, VenueStatus = "Available"
        };
        var boardroom = new Venue
        {
            VenueId = BoardroomId, VenueName = "Executive Boardroom",
            VenueDescription = "Boardroom layout for committee meetings and planning sessions.",
            Capacity = 18, Price = 950m, Location = "NMU Conference Centre, Gqeberha",
            Latitude = -33.9319, Longitude = 25.5711, VenueStatus = "Available"
        };
        var trainingRoom = new Venue
        {
            VenueId = TrainingRoomId, VenueName = "Digital Training Suite",
            VenueDescription = "Computer-enabled training room for demonstrations and practical sessions.",
            Capacity = 32, Price = 1500m, Location = "NMU Conference Centre, Gqeberha",
            Latitude = -33.9327, Longitude = 25.5709, VenueStatus = "Available"
        };
        db.Venues.AddRange(auditorium, seminarRoom, boardroom, trainingRoom);

        db.VenueFeatures.AddRange(
            Feature(auditorium, "Projector", "Presentation projection"),
            Feature(auditorium, "Sound system", "Room audio"),
            Feature(auditorium, "Step-free access", "Illustrative accessibility feature for demo"),
            Feature(auditorium, "Accessible seating", "Illustrative accessibility feature for demo"),
            Feature(auditorium, "Wi-Fi", "Wireless internet"),
            Feature(seminarRoom, "Whiteboard", "Workshop collaboration"),
            Feature(seminarRoom, "Projector", "Presentation projection"),
            Feature(seminarRoom, "Step-free access", "Illustrative accessibility feature for demo"),
            Feature(seminarRoom, "Wi-Fi", "Wireless internet"),
            Feature(boardroom, "Video conferencing", "Remote meeting support"),
            Feature(boardroom, "Display screen", "Meeting presentation"),
            Feature(boardroom, "Accessible seating", "Illustrative accessibility feature for demo"),
            Feature(trainingRoom, "Desktop computers", "Practical computer training"),
            Feature(trainingRoom, "Projector", "Trainer presentation"),
            Feature(trainingRoom, "Wi-Fi", "Wireless internet"),
            Feature(trainingRoom, "Step-free access", "Illustrative accessibility feature for demo"));

        var completedEvent = MakeEvent("Research Showcase", "Completed demo event used to illustrate booking history and reports.",
            "Conference", "In-person", today.AddDays(-24).AddHours(9), today.AddDays(-24).AddHours(15), AuditoriumId);
        var approvedEvent = MakeEvent("Faculty Planning Forum", "Upcoming planning forum with an approved venue request.",
            "Meeting", "Hybrid", today.AddDays(5).AddHours(10), today.AddDays(5).AddHours(13), BoardroomId);
        var pendingEvent = MakeEvent("Student Innovation Workshop", "A request waiting for conference centre staff to review.",
            "Workshop", "In-person", today.AddDays(8).AddHours(9), today.AddDays(8).AddHours(16), SeminarRoomId);
        var rejectedEvent = MakeEvent("Community Partner Briefing", "A fictional rejected request for demonstrating status history.",
            "Briefing", "In-person", today.AddDays(12).AddHours(11), today.AddDays(12).AddHours(14), TrainingRoomId);
        var cancelledEvent = MakeEvent("Project Review Session", "A fictional cancelled booking for reporting examples.",
            "Meeting", "Hybrid", today.AddDays(-8).AddHours(13), today.AddDays(-8).AddHours(15), BoardroomId);
        db.Events.AddRange(completedEvent, approvedEvent, pendingEvent, rejectedEvent, cancelledEvent);

        var completedBooking = MakeBooking(CompletedBookingId, completedEvent, auditorium, CompletedStatusId,
            today.AddDays(-30), "Demo booking marked complete.");
        var approvedBooking = MakeBooking(ApprovedBookingId, approvedEvent, boardroom, ApprovedStatusId,
            today.AddDays(-3), "Approved demo booking; confirm real-world arrangements with staff.");
        var pendingBooking = MakeBooking(PendingBookingId, pendingEvent, seminarRoom, PendingStatusId,
            today.AddDays(-1), "Please confirm projector availability and seating arrangement.");
        var rejectedBooking = MakeBooking(RejectedBookingId, rejectedEvent, trainingRoom, RejectedStatusId,
            today.AddDays(-2), "Demo-only example: requested room configuration was not available.");
        var cancelledBooking = MakeBooking(CancelledBookingId, cancelledEvent, boardroom, CancelledStatusId,
            today.AddDays(-12), "Demo-only cancelled request.");
        db.Bookings.AddRange(completedBooking, approvedBooking, pendingBooking, rejectedBooking, cancelledBooking);

        db.Notifications.AddRange(
            Notice(organiser, completedBooking, "Booking update", "Your Research Showcase booking is marked completed in this demo."),
            Notice(organiser, approvedBooking, "Booking approved", "Your Faculty Planning Forum booking has been approved in this demo."),
            Notice(organiser, pendingBooking, "Booking received", "Your Student Innovation Workshop request is awaiting staff review."),
            Notice(staff, pendingBooking, "Review required", "A demo booking is waiting for review: Student Innovation Workshop."),
            Notice(organiser, rejectedBooking, "Booking update", "The Community Partner Briefing request is marked rejected in this demo."));

        db.Payments.Add(new Payment
        {
            PaymentId = Guid.Parse("40000000-0000-0000-0000-000000000001"),
            BookingId = ApprovedBookingId, Amount = boardroom.Price, PaymentDate = nowUtc,
            ReferenceNumber = "DEMO-ONLY-NOT-A-YOCO-TRANSACTION",
            PaymentStatus = "Pending", YocoCheckoutId = null
        });

        db.AuditLogs.AddRange(
            Audit(admin, "Demo data prepared", "Presentation-only data set created for a local walkthrough.", nowUtc.AddMinutes(-10)),
            Audit(staff, "Booking reviewed", "Illustrative activity entry associated with the approved Faculty Planning Forum booking.", nowUtc.AddMinutes(-5)),
            Audit(admin, "Report viewed", "Illustrative activity entry for the administrator reporting walkthrough.", nowUtc.AddMinutes(-2)));

        db.SupportTickets.Add(new SupportTicket
        {
            SupportTicketId = Guid.Parse("50000000-0000-0000-0000-000000000001"),
            TicketNumber = "DEMO-1001", Subject = "Accessibility arrangements for a venue",
            Description = "Demo enquiry: please confirm the accessible route, seating arrangements and any additional support needed before the event.",
            Category = "Accessibility", Status = "Open",
            CreatedAt = nowUtc.AddHours(-2), UpdatedAt = nowUtc.AddHours(-2), UserId = OrganiserId
        });

        AddFaq(db, "How do I request a venue booking?",
            "Sign in as an Event Organiser, review the available venues and their listed capacity and features, then submit the event details and booking request. The request status shown in DIBA Bookings is the current workflow status. This answer describes the demo workflow; ask Conference Centre staff if you need help.", "Bookings", nowUtc);
        AddFaq(db, "Does submitting a booking mean it is approved?",
            "No. A submitted request can remain Pending until authorised staff review it. Check the status displayed in your account. Do not treat a pending request as confirmation of a venue booking.", "Bookings", nowUtc);
        AddFaq(db, "Where can I see the status of my request?",
            "Sign in with the account used to submit the request and open your bookings or dashboard. The status may show Pending, Approved, Rejected, Cancelled or Completed, depending on the record.", "Bookings", nowUtc);
        AddFaq(db, "How do I choose a venue for my expected attendance?",
            "Compare your expected attendance with the capacity displayed for each venue. Also check the listed features and venue status. Venue details in this presentation database are illustrative; confirm actual capacity, availability and facilities with Conference Centre staff.", "Venues", nowUtc);
        AddFaq(db, "Can I request accessibility arrangements?",
            "The demo venue records include example features such as step-free access and accessible seating. These entries are illustrative and do not confirm the current accessibility of a real venue. Contact Conference Centre staff to confirm routes, seating, equipment and any individual arrangements before relying on them.", "Accessibility", nowUtc);
        AddFaq(db, "How much does a venue cost?",
            "DIBA displays an example price for each demo venue. The prices in this presentation database are fictional and must not be treated as official Nelson Mandela University rates. Ask Conference Centre staff for a confirmed quotation.", "Payments", nowUtc);
        AddFaq(db, "Can the DIBA assistant approve my booking?",
            "No. The assistant answers questions using published FAQ information. It cannot approve, reject, cancel or modify bookings. Booking decisions must be made through the authorised booking workflow.", "Help Centre", nowUtc);
        AddFaq(db, "What if the FAQ does not answer my question?",
            "The assistant should tell you when it cannot confirm an answer. Contact Conference Centre staff for confirmation rather than relying on an assumption about policy, availability, payment or venue arrangements.", "Help Centre", nowUtc);

        AddSamplePolicy(db, "VenueRules", "Sample Venue Rules (Demo Only)",
            "DEMO CONTENT — NOT AN APPROVED UNIVERSITY POLICY. Before an event, organisers should confirm room capacity, setup, equipment, access arrangements and any venue-specific requirements with Conference Centre staff. Do not rely on this sample document as an official rule.", nowUtc);
        AddSamplePolicy(db, "Cancellation", "Sample Cancellation Guidance (Demo Only)",
            "DEMO CONTENT — NOT AN APPROVED UNIVERSITY POLICY. This sample does not define a real cancellation deadline, refund entitlement or fee. Contact Conference Centre staff to confirm the applicable cancellation process and any financial implications before cancelling.", nowUtc);
        AddSamplePolicy(db, "Privacy", "Sample Privacy Notice (Demo Only)",
            "DEMO CONTENT — NOT AN APPROVED UNIVERSITY PRIVACY NOTICE. Use personal information only for authorised booking administration, restrict access to appropriate staff, and contact the University for its approved privacy notice and data-subject request process.", nowUtc);
        AddSamplePolicy(db, "Terms", "Sample Booking Terms (Demo Only)",
            "DEMO CONTENT — NOT APPROVED TERMS. This document is illustrative only and does not establish a binding agreement, official price, payment deadline or venue entitlement. Request the current approved terms from Conference Centre staff.", nowUtc);

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        Console.WriteLine("DIBA presentation data inserted successfully.");
        Console.WriteLine("Demo accounts (same password for all):");
        Console.WriteLine("  admin.demo@diba.local");
        Console.WriteLine("  staff.demo@diba.local");
        Console.WriteLine("  organiser.demo@diba.local");
        Console.WriteLine("  Password: DibaDemo2026!");
        Console.WriteLine("All venue prices, accessibility features, policies and records are illustrative demo data.");
    }

    private static VenueFeature Feature(Venue venue, string name, string description) => new()
    {
        VenueFeatureId = Guid.NewGuid(), VenueId = venue.VenueId, Venue = venue,
        FeatureName = name, FeatureDescription = description, FeatureStatus = "Available"
    };

    private static Event MakeEvent(
        string name, string description, string type, string attendance,
        DateTime start, DateTime end, Guid venueId) => new()
    {
        EventId = Guid.NewGuid(), EventName = name, EventDescription = description,
        EventType = type, EventAttendance = attendance, StartDateTime = start,
        EndDateTime = end, VenueId = venueId, UserId = OrganiserId
    };

    private static Booking MakeBooking(
        Guid id, Event demoEvent, Venue venue, Guid statusId,
        DateTime bookingDate, string notes) => new()
    {
        BookingId = id, BookingDate = bookingDate,
        StartDateTime = demoEvent.StartDateTime, EndDateTime = demoEvent.EndDateTime,
        SpecialRequirements = notes,
        AdminNotes = statusId == ApprovedStatusId ? "Illustrative staff review note." : null,
        AcknowledgementAccepted = true, AcknowledgementAcceptedAt = bookingDate,
        AcknowledgementPolicyType = "VenueRules", AcknowledgementPolicyVersion = 1,
        UserId = OrganiserId, EventId = demoEvent.EventId, VenueId = venue.VenueId,
        BookingStatusId = statusId
    };

    private static Notification Notice(User user, Booking booking, string type, string message) => new()
    {
        NotificationId = Guid.NewGuid(), UserId = user.UserId, BookingId = booking.BookingId,
        NotificationType = type, Message = message, DateCreated = DateTime.UtcNow, IsRead = false
    };

    private static AuditLog Audit(User user, string action, string description, DateTime timestamp) => new()
    {
        AuditLogId = Guid.NewGuid(), UserId = user.UserId, Action = action,
        LogDescription = description, Timestamp = timestamp
    };

    private static void AddFaq(
        DIBABookingsDbContext db, string question, string answer, string category, DateTime timestamp)
    {
        db.FAQs.Add(new FAQ
        {
            FAQId = Guid.NewGuid(), Question = question, Answer = answer, Category = category,
            IsPublished = true, CreatedAt = timestamp, UpdatedAt = timestamp
        });
    }

    private static void AddSamplePolicy(
        DIBABookingsDbContext db, string policyType, string title, string content, DateTime timestamp)
    {
        db.PolicyDocuments.Add(new PolicyDocument
        {
            PolicyDocumentId = Guid.NewGuid(), PolicyType = policyType, Title = title, Content = content,
            Version = 1, IsActive = true, IsSamplePolicy = true, CreatedAt = timestamp, UpdatedAt = timestamp
        });
    }
}
