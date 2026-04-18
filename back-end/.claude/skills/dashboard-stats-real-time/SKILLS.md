Every `settlement` transaction must update the counter in Redis for fast dashboard consumption.

**Pattern:**

```go
// Increment daily sales
RedisClient.IncrBy(ctx, “stats:daily_sales:”+today, amount)
```