# SnapShare Scaling Plan

## 1. Assumptions

- Registered users: 10,000,000
- 10% of users are active daily
- Each active user uploads 1 photo per day
- Each active user views 50 feed pages per day
- Average photo size: 2 MB
- Thumbnail size: 50 KB
- 1 day = 100,000 seconds (approximation)

### Daily Active Users (DAU)

10,000,000 × 10% = 1,000,000 daily active users

---

## 2. Traffic and Storage Estimates

### Uploads Per Day

1,000,000 users × 1 photo/day

= 1,000,000 uploads/day

### Uploads Per Second

1,000,000 ÷ 100,000

= 10 uploads/second

### Feed Views Per Day

1,000,000 users × 50 views/day

= 50,000,000 feed views/day

### Average Feed Views Per Second

50,000,000 ÷ 100,000

= 500 feed views/second

### Peak Feed Views Per Second

500 × 5

= 2,500 feed views/second

### Storage Per Photo

Photo = 2 MB

Thumbnail = 50 KB = 0.05 MB

Total = 2.05 MB

### Photos Per Year

1,000,000 × 365

= 365,000,000 photos/year

### Storage Per Year

365,000,000 × 2.05 MB

= 748,250,000 MB

≈ 748 TB per year

---

## 3. Read-Heavy or Write-Heavy?

SnapShare is a read-heavy system.

Users generate:

- 1,000,000 uploads/day

But they generate:

- 50,000,000 feed views/day

Reads greatly outnumber writes, so the design should focus on fast feed delivery using caches, CDNs, and read replicas.

---

## 4. Why Photos Should Not Be Stored in the Database

Photos are large files and would make the database slow, expensive, and difficult to scale.

Instead, photos should be stored in object storage (such as Amazon S3), while the database stores only metadata such as photo URLs, user IDs, and timestamps.

---

## 5. Architecture Diagram

                    +--------+
                    |  Users |
                    +--------+
                         |
                         v
                    +--------+
                    |  CDN   |
                    +--------+
                         |
                         v
                +----------------+
                | Load Balancer  |
                +----------------+
                         |
          +--------------+--------------+
          |                             |
          v                             v
    +-----------+                 +-----------+
    | App Server|                 | App Server|
    +-----------+                 +-----------+
          |                             |
          +--------------+--------------+
                         |
          +--------------+--------------+
          |                             |
          v                             v
      +--------+                 +-------------+
      | Redis  |                 | Primary DB  |
      | Cache  |                 +-------------+
      +--------+                        |
                                        v
                                +--------------+
                                | Read Replica |
                                +--------------+

                         |
                         v

                +------------------+
                | Object Storage   |
                | (Photos)         |
                +------------------+
                         ^
                         |
                    +---------+
                    | Worker  |
                    +---------+
                         ^
                         |
                    +---------+
                    | Queue   |
                    +---------+

---

## 6. Component Explanations

### CDN

Serves photos from locations close to users to reduce latency and bandwidth costs.

### Load Balancer

Distributes requests across app servers to prevent any one server from becoming overloaded.

### App Servers

Handle user requests and business logic.

### Redis Cache

Stores frequently accessed feed data to reduce database load.

### Primary Database

Stores critical application data such as users, follows, and photo metadata.

### Read Replica

Handles read queries so the primary database can focus on writes.

### Object Storage

Stores photo and thumbnail files efficiently at large scale.

### Queue

Buffers thumbnail processing jobs and smooths traffic spikes.

### Worker

Processes jobs from the queue and creates thumbnails.

---

## 7. Upload Flow

1. User uploads a photo.
2. Request reaches the load balancer.
3. Load balancer forwards the request to an app server.
4. App server stores the original photo in object storage.
5. App server saves photo metadata in the primary database.
6. App server sends a thumbnail creation job to the queue.
7. Worker reads the job from the queue.
8. Worker creates a thumbnail.
9. Thumbnail is stored in object storage.
10. Feed caches are updated or invalidated.
11. CDN serves the photo and thumbnail to users viewing feeds.

---

## 8. Trade-Offs

### Cache Trade-Off

Using Redis speeds up feed reads significantly, but cached data can become stale and requires cache invalidation.

### Read Replica Trade-Off

Read replicas reduce load on the primary database, but there may be slight replication delays causing users to briefly see outdated data.

### CDN Trade-Off

CDNs improve performance worldwide, but increase system complexity and operational cost.
