using DIBA_Backend.Data;
using DIBA_Backend.Dto.Event;
using DIBA_Backend.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DIBA_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EventsController : ControllerBase
    {
        private readonly DIBABookingsDbContext dbContext;

        public EventsController(DIBABookingsDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        // GET: api/Events
        [HttpGet]
        public async Task<IActionResult> GetEvents()
        {
            var events = await dbContext.Events
                .Select(e => new EventResponseDto
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    EventDescription = e.EventDescription,
                    EventType = e.EventType,
                    EventAttendance = e.EventAttendance,
                    StartDateTime = e.StartDateTime,
                    EndDateTime = e.EndDateTime,
                    VenueId = e.VenueId,
                    UserId = e.UserId
                })
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/Events/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetEvent(Guid id)
        {
            var eventEntity = await dbContext.Events
                .FirstOrDefaultAsync(e => e.EventId == id);

            if (eventEntity == null)
            {
                return NotFound("Event not found.");
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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized("User ID could not be determined.");
            }

            if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            var venueExists = await dbContext.Venues
                .AnyAsync(v => v.VenueId == createEventDto.VenueId);

            if (!venueExists)
            {
                return NotFound("Venue not found.");
            }

            if (createEventDto.EndDateTime <= createEventDto.StartDateTime)
            {
                return BadRequest("End date and time must be after the start date and time.");
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

            dbContext.Events.Add(eventEntity);
            await dbContext.SaveChangesAsync();

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

        // PUT: api/Events/{id}
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Event Organiser")]
        public async Task<IActionResult> UpdateEvent(
            Guid id,
            UpdateEventDto updateEventDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized("User ID could not be determined.");
            }

            if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            var eventEntity = await dbContext.Events
                .FirstOrDefaultAsync(e => e.EventId == id);

            if (eventEntity == null)
            {
                return NotFound("Event not found.");
            }

            if (eventEntity.UserId != userId)
            {
                return Forbid();
            }

            var venueExists = await dbContext.Venues
                .AnyAsync(v => v.VenueId == updateEventDto.VenueId);

            if (!venueExists)
            {
                return NotFound("Venue not found.");
            }

            if (updateEventDto.EndDateTime <= updateEventDto.StartDateTime)
            {
                return BadRequest("End date and time must be after the start date and time.");
            }

            eventEntity.EventName = updateEventDto.EventName;
            eventEntity.EventDescription = updateEventDto.EventDescription;
            eventEntity.EventType = updateEventDto.EventType;
            eventEntity.EventAttendance = updateEventDto.EventAttendance;
            eventEntity.StartDateTime = updateEventDto.StartDateTime;
            eventEntity.EndDateTime = updateEventDto.EndDateTime;
            eventEntity.VenueId = updateEventDto.VenueId;

            await dbContext.SaveChangesAsync();

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
    }
}
