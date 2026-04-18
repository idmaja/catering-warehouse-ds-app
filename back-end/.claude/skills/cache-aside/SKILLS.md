Use this pattern for retrieving the menu list to reduce I/O on the STB.

**Pattern:**

1. Check the Redis key.
2. If found: Return.
3. If not: Retrieve from the DB -> Store in Redis (TTL 1 hour) -> Return.