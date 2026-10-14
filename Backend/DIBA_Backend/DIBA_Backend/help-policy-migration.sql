BEGIN TRANSACTION;
GO

ALTER TABLE [Bookings] ADD [AcknowledgementPolicyType] nvarchar(max) NULL;
GO

ALTER TABLE [Bookings] ADD [AcknowledgementPolicyVersion] int NULL;
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

CREATE UNIQUE INDEX [IX_PolicyDocuments_PolicyType_Version] ON [PolicyDocuments] ([PolicyType], [Version]);
GO

CREATE UNIQUE INDEX [IX_SupportTickets_TicketNumber] ON [SupportTickets] ([TicketNumber]);
GO

CREATE INDEX [IX_SupportTickets_UserId] ON [SupportTickets] ([UserId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261013222916_AddHelpPolicySupportFeatures', N'8.0.4');
GO

COMMIT;
GO

