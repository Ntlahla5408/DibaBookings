BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261014145037_ReconcileCurrentModelChanges', N'8.0.4');
GO

COMMIT;
GO

