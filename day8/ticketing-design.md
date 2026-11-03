1. Requirements
   Functional Requirements
   Users can create accounts and log in.
   Users can browse events and concerts.
   Users can view available seats for an event.
   Users can temporarily hold seats before payment.
   Users can purchase tickets.
   Users can view their purchased tickets.
   Event organizers can create and manage events.
   The system must prevent two users from purchasing the same seat.
   Non-Functional Requirements
   Speed
   Event pages should load in under 1 second.
   Seat availability should update quickly during sales.
   Correctness
   A seat must never be sold twice.
   Orders and payments must be processed reliably.
   Ticket ownership records must be accurate.
   Fairness
   During popular sales, requests should be processed fairly.
   A user should not be able to bypass the queue.
   Seat holds should expire after a short period (e.g., 5 minutes) so abandoned seats return to inventory.
   Scalability
   Support normal traffic and large spikes during major ticket releases.
   Availability
   Browsing events should remain available even during heavy traffic.
2. Traffic Estimates
   Normal Day

Given:

50,000 visitors/day
10 page views per visitor
5,000 ticket purchases/day

Page views:

50,000 × 10 = 500,000 page views/day

Average requests per second:

500,000 / 86,400 ≈ 5.8 requests/sec

Ticket purchases:

5,000 / 86,400 ≈ 0.06 purchases/sec

Popular Concert Sale

Given:

200,000 users
20,000 seats
First 10 minutes

Seat purchase attempts:

200,000 / 600 ≈ 333 purchase attempts/sec

Possible seat views and refreshes make real traffic much higher, potentially several thousand requests per second.

Comparison
Metric Normal Day Big SaleUsers 50,000/day 200,000 in 10 min
Requests/sec ~6 Hundreds to thousands
Purchases/sec <1 ~333

The big sale creates a traffic spike dozens or hundreds of times larger than normal traffic.

3. API Design
   Get Events
   HTTP
   GET /events

Returns all upcoming events.

Get Event Details
HTTP
GET /events/{eventId}

Returns event information.

View Seats
HTTP
GET /events/{eventId}/seats

Returns seat availability.

Hold Seat
HTTP
POST /holds

Request:

JSON
{
"userId": 123,
"seatId": 456
}

Creates a temporary seat hold.

Purchase Ticket
HTTP
POST /orders

Request:

JSON
{
"holdId": 789,
"paymentToken": "abc123"
}

Converts hold into a paid order.

View User Tickets
HTTP
GET /users/{userId}/tickets

Returns purchased tickets.

4. Data Model
   Users
   Column Typeuser_id PK
   name VARCHAR
   email VARCHAR
   created_at TIMESTAMP
   Events
   Column Typeevent_id PK
   title VARCHAR
   venue VARCHAR
   event_date TIMESTAMP
   Seats
   Column Typeseat_id PK
   event_id FK
   section VARCHAR
   row VARCHAR
   seat_number VARCHAR

Relationship:

Event 1 → Many Seats

Orders
Column Typeorder_id PK
user_id FK
seat_id FK
status VARCHAR
created_at TIMESTAMP

Relationships:

User 1 → Many Orders

Seat 1 → 0 or 1 Orders

Relationship Diagram
Plain Text
Users
|
| 1:M
|
Orders
|
| M:1
|
Seats
|
| M:1
|
Events 5. Preventing Double Booking

The most critical requirement is ensuring only one buyer obtains a seat.

Approach
User selects a seat.
Database transaction begins.
Seat record is locked.
System checks whether the seat is available.
Temporary hold is created.
User completes payment.
Order is created.
Transaction commits.
Database Constraint

Create a unique constraint on seat ownership:

SQL
UNIQUE(seat_id)

This guarantees a seat can appear in only one completed order.

Result

If two users try to buy the same seat simultaneously:

One transaction succeeds.
The other transaction fails.
Double-booking cannot occur. 6. Architecture Diagram
Plain Text
Users
|
|
Load Balancer
|

---

| | |
Application Application Application
Server Server Server
| | |

---

|
Redis
Cache
|
Queue Service
|
Database
(PostgreSQL)
Components
Load Balancer
Distributes traffic across servers.
Prevents a single server from becoming overloaded.
Application Servers
Handle API requests.
Manage seat holds and purchases.
Redis Cache
Stores frequently viewed event and seat data.
Reduces database load during large sales.
Queue Service
Buffers purchase requests.
Helps maintain fairness during traffic spikes.
Database
Stores users, events, seats, holds, and orders.
Provides transactional guarantees.
Surviving the Big Sale
Multiple application servers scale horizontally.
Redis serves frequent reads.
Queue smooths sudden spikes.
Database transactions protect seat inventory. 7. Trade-Offs
Trade-Off 1: Fairness vs Speed

Using a queue improves fairness but adds latency.

Benefit:

More equitable purchase process.

Cost:

Users may wait longer.
Trade-Off 2: Strong Consistency vs Performance

Using transactions and locks prevents double-booking.

Benefit:

Correct seat ownership.

Cost:

Slightly slower purchase processing.
Conclusion

TicketHub uses caching, queues, horizontal scaling, and transactional database protection to support both normal traffic and extremely large ticket-sale events while guaranteeing that no seat can be sold twice
