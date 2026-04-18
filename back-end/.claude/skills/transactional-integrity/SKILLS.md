Any operation that involves changes to balances or inventory must use a GORM transaction to ensure ACID compliance.

**Pattern:**

```Go
tx := db.Begin()
defer func() {
    if r := recover(); r != nil { tx.Rollback() }
}()
// Business logic...
if err := tx.Commit().Error; err != nil { return err }
```