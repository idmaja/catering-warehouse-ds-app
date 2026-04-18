Never write audit logs synchronously, as this can slow down the main API response.

**Pattern:**

```Go
go func(logData models.AuditLog) {
    auditService.Create(logData) // MongoDB Atlas implementation
}(data)
```