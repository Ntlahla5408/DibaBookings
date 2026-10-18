IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [BookingStatuses] (
    [BookingStatusId] uniqueidentifier NOT NULL,
    [StatusName] nvarchar(max) NOT NULL,
    [StatusDescription] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_BookingStatuses] PRIMARY KEY ([BookingStatusId])
);
GO

CREATE TABLE [EmailDeliveryLogs] (
    [EmailDeliveryLogId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NULL,
    [NotificationId] uniqueidentifier NULL,
    [RecipientEmail] nvarchar(320) NOT NULL,
    [Subject] nvarchar(200) NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [ErrorMessage] nvarchar(1000) NULL,
    [AttemptedAtUtc] datetime2 NOT NULL,
    [SentAtUtc] datetime2 NULL,
    CONSTRAINT [PK_EmailDeliveryLogs] PRIMARY KEY ([EmailDeliveryLogId])
);
GO

CREATE TABLE [FAQs] (
    [FAQId] uniqueidentifier NOT NULL,
    [Question] nvarchar(200) NOT NULL,
    [Answer] nvarchar(max) NOT NULL,
    [Category] nvarchar(80) NOT NULL,
    [IsPublished] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_FAQs] PRIMARY KEY ([FAQId])
);
GO

CREATE TABLE [PolicyDocuments] (
    [PolicyDocumentId] uniqueidentifier NOT NULL,
    [PolicyType] nvarchar(60) NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [Version] int NOT NULL,
    [IsActive] bit NOT NULL,
    [IsSamplePolicy] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_PolicyDocuments] PRIMARY KEY ([PolicyDocumentId])
);
GO

CREATE TABLE [Roles] (
    [RoleId] uniqueidentifier NOT NULL,
    [RoleName] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([RoleId])
);
GO

CREATE TABLE [Venues] (
    [VenueId] uniqueidentifier NOT NULL,
    [VenueName] nvarchar(max) NOT NULL,
    [VenueDescription] nvarchar(max) NOT NULL,
    [Capacity] int NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [Location] nvarchar(max) NOT NULL,
    [Latitude] float NOT NULL,
    [Longitude] float NOT NULL,
    [VenueStatus] nvarchar(max) NOT NULL,
    [VenueImageData] nvarchar(max) NULL,
    CONSTRAINT [PK_Venues] PRIMARY KEY ([VenueId])
);
GO

CREATE TABLE [Users] (
    [UserId] uniqueidentifier NOT NULL,
    [FirstName] nvarchar(max) NOT NULL,
    [LastName] nvarchar(max) NOT NULL,
    [Email] nvarchar(320) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [RoleId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserId]),
    CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([RoleId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [VenueFeatures] (
    [VenueFeatureId] uniqueidentifier NOT NULL,
    [FeatureName] nvarchar(max) NOT NULL,
    [FeatureDescription] nvarchar(max) NOT NULL,
    [FeatureStatus] nvarchar(max) NOT NULL,
    [VenueId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_VenueFeatures] PRIMARY KEY ([VenueFeatureId]),
    CONSTRAINT [FK_VenueFeatures_Venues_VenueId] FOREIGN KEY ([VenueId]) REFERENCES [Venues] ([VenueId]) ON DELETE CASCADE
);
GO

CREATE TABLE [AuditLogs] (
    [AuditLogId] uniqueidentifier NOT NULL,
    [Action] nvarchar(max) NOT NULL,
    [LogDescription] nvarchar(max) NULL,
    [Timestamp] datetime2 NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([AuditLogId]),
    CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Events] (
    [EventId] uniqueidentifier NOT NULL,
    [EventName] nvarchar(max) NOT NULL,
    [EventDescription] nvarchar(max) NOT NULL,
    [EventType] nvarchar(max) NULL,
    [EventAttendance] nvarchar(max) NULL,
    [StartDateTime] datetime2 NOT NULL,
    [EndDateTime] datetime2 NOT NULL,
    [VenueId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Events] PRIMARY KEY ([EventId]),
    CONSTRAINT [FK_Events_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Events_Venues_VenueId] FOREIGN KEY ([VenueId]) REFERENCES [Venues] ([VenueId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [SupportTickets] (
    [SupportTicketId] uniqueidentifier NOT NULL,
    [TicketNumber] nvarchar(30) NOT NULL,
    [Subject] nvarchar(200) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [Category] nvarchar(80) NOT NULL,
    [Status] nvarchar(40) NOT NULL,
    [StaffResponse] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [RespondedAt] datetime2 NULL,
    [UserId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_SupportTickets] PRIMARY KEY ([SupportTicketId]),
    CONSTRAINT [FK_SupportTickets_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Bookings] (
    [BookingId] uniqueidentifier NOT NULL,
    [BookingDate] datetime2 NOT NULL,
    [StartDateTime] datetime2 NOT NULL,
    [EndDateTime] datetime2 NOT NULL,
    [SpecialRequirements] nvarchar(max) NULL,
    [AdminNotes] nvarchar(max) NULL,
    [AcknowledgementAccepted] bit NOT NULL,
    [AcknowledgementAcceptedAt] datetime2 NULL,
    [AcknowledgementPolicyType] nvarchar(max) NULL,
    [AcknowledgementPolicyVersion] int NULL,
    [UserId] uniqueidentifier NOT NULL,
    [EventId] uniqueidentifier NOT NULL,
    [VenueId] uniqueidentifier NOT NULL,
    [BookingStatusId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Bookings] PRIMARY KEY ([BookingId]),
    CONSTRAINT [FK_Bookings_BookingStatuses_BookingStatusId] FOREIGN KEY ([BookingStatusId]) REFERENCES [BookingStatuses] ([BookingStatusId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Bookings_Events_EventId] FOREIGN KEY ([EventId]) REFERENCES [Events] ([EventId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Bookings_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Bookings_Venues_VenueId] FOREIGN KEY ([VenueId]) REFERENCES [Venues] ([VenueId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Notifications] (
    [NotificationId] uniqueidentifier NOT NULL,
    [NotificationType] nvarchar(max) NOT NULL,
    [Message] nvarchar(max) NOT NULL,
    [DateCreated] datetime2 NOT NULL,
    [IsRead] bit NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [BookingId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([NotificationId]),
    CONSTRAINT [FK_Notifications_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([BookingId]) ON DELETE CASCADE,
    CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);
GO

CREATE TABLE [Payments] (
    [PaymentId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [PaymentDate] datetime2 NOT NULL,
    [ReferenceNumber] nvarchar(max) NULL,
    [YocoCheckoutId] nvarchar(max) NULL,
    [PaymentStatus] nvarchar(max) NOT NULL,
    [BookingId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY ([PaymentId]),
    CONSTRAINT [FK_Payments_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([BookingId]) ON DELETE CASCADE
);
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'BookingStatusId', N'StatusDescription', N'StatusName') AND [object_id] = OBJECT_ID(N'[BookingStatuses]'))
    SET IDENTITY_INSERT [BookingStatuses] ON;
INSERT INTO [BookingStatuses] ([BookingStatusId], [StatusDescription], [StatusName])
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', N'Booking request is awaiting approval.', N'Pending'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', N'Booking has been approved.', N'Approved'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', N'Booking request has been rejected.', N'Rejected'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', N'Booking has been cancelled.', N'Cancelled'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', N'Booking has been completed.', N'Completed');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'BookingStatusId', N'StatusDescription', N'StatusName') AND [object_id] = OBJECT_ID(N'[BookingStatuses]'))
    SET IDENTITY_INSERT [BookingStatuses] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'RoleId', N'RoleName') AND [object_id] = OBJECT_ID(N'[Roles]'))
    SET IDENTITY_INSERT [Roles] ON;
INSERT INTO [Roles] ([RoleId], [RoleName])
VALUES ('11111111-1111-1111-1111-111111111111', N'Administrator'),
('22222222-2222-2222-2222-222222222222', N'Staff'),
('33333333-3333-3333-3333-333333333333', N'Event Organiser');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'RoleId', N'RoleName') AND [object_id] = OBJECT_ID(N'[Roles]'))
    SET IDENTITY_INSERT [Roles] OFF;
GO

CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs] ([UserId]);
GO

CREATE INDEX [IX_Bookings_BookingStatusId] ON [Bookings] ([BookingStatusId]);
GO

CREATE INDEX [IX_Bookings_EventId] ON [Bookings] ([EventId]);
GO

CREATE INDEX [IX_Bookings_UserId] ON [Bookings] ([UserId]);
GO

CREATE INDEX [IX_Bookings_VenueId] ON [Bookings] ([VenueId]);
GO

CREATE INDEX [IX_EmailDeliveryLogs_AttemptedAtUtc] ON [EmailDeliveryLogs] ([AttemptedAtUtc]);
GO

CREATE INDEX [IX_Events_UserId] ON [Events] ([UserId]);
GO

CREATE INDEX [IX_Events_VenueId] ON [Events] ([VenueId]);
GO

CREATE INDEX [IX_Notifications_BookingId] ON [Notifications] ([BookingId]);
GO

CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
GO

CREATE INDEX [IX_Payments_BookingId] ON [Payments] ([BookingId]);
GO

CREATE UNIQUE INDEX [IX_PolicyDocuments_PolicyType_Version] ON [PolicyDocuments] ([PolicyType], [Version]);
GO

CREATE UNIQUE INDEX [IX_SupportTickets_TicketNumber] ON [SupportTickets] ([TicketNumber]);
GO

CREATE INDEX [IX_SupportTickets_UserId] ON [SupportTickets] ([UserId]);
GO

CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
GO

CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);
GO

CREATE INDEX [IX_VenueFeatures_VenueId] ON [VenueFeatures] ([VenueId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261018145531_InitialCreate', N'8.0.4');
GO

COMMIT;
GO

