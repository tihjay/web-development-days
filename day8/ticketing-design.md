1. Requirements
   Functional Requirements

TicketHub is a website where users can purchase tickets for concerts and events.

The system must allow users to:

Register and log into an account.
Browse upcoming events.
View event details.
View available seats for an event.
Temporarily reserve (hold) seats.
Purchase tickets.
View purchased tickets.
Receive confirmation after successful purchase.
Allow seat holds to expire automatically if payment is not completed.
Non-Functional Requirements
Speed
Event pages should load in under 1 second.
Seat availability should update in near real time.
Ticket purchases should complete within a few seconds.
Correctness
A seat must never be sold twice.
Orders must accurately reflect completed purchases.
Payment failures must not create tickets.
Fairness
During a popular sale, users should be processed in the order they enter the queue.
Users should not be able to bypass the queue.
Expired seat holds should return seats to inventory.
Scalability
The system must handle normal traffic and sudden traffic spikes.
Additional application servers should be added without redesigning the system.
Availability
Users must still be able to browse events even during large sales. 2. Capacity Estimates
Normal Day

Given:

2,000,000 registered users
50,000 visitors per day
Each visitor views 10 pages
5,000 tickets sold per day
Page Views
50,000 × 10 = 500,000 page views/day

Average Read Requests
500,000 ÷ 86,400 ≈ 5.8 requests/second

Ticket Purchases
5,000 ÷ 86,400 ≈ 0.06 purchases/second

The normal workload is mostly browsing.

Big Concert Sale

Given:

200,000 users
20,000 seats
First 10 minutes (600 seconds)
Purchase Attempts
200,000 ÷ 600 = 333 purchase attempts/second

Seat Availability Requests

Assume each user refreshes seat information 5 times:

200,000 × 5 = 1,000,000 seat requests

1,000,000 ÷ 600 ≈ 1,667 requests/second

Comparison
Metric Normal Day Concert On SaleVisitors 50,000/day 200,000/10 min
Reads/sec 5.8 1,667+
Purchases/sec 0.06 333

The peak sale generates traffic hundreds of times larger than normal traffic.

3. API Design
   Browse Events
   HTTP
   GET /events

Returns all upcoming events.

View Event Details
HTTP
GET /events/{eventId}

Returns event information.

View Available Seats
HTTP
GET /events/{eventId}/seats

Returns seat availability.

Hold Seat
HTTP
POST /holds

Request:

JSON
{
"userId": 1,
"seatId": 150
}

Creates a temporary seat hold.

Purchase Ticket
HTTP
POST /orders

Request:

JSON
{
"holdId": 300,
"paymentToken": "abc123"
}

Creates an order after successful payment.

View Purchased Tickets
HTTP
GET /users/{userId}/tickets

Returns all purchased tickets.

4. Data Model
   Users
   Column Typeuser_id PK
   name VARCHAR
   email VARCHAR
   created_at TIMESTAMP
   Events
   Column Typeevent_id PK
   name VARCHAR
   venue VARCHAR
   event_date TIMESTAMP
   Seats
   Column Typeseat_id PK
   event_id FK
   section VARCHAR
   row_number VARCHAR
   seat_number VARCHAR

Relationship:

One Event → Many Seats

Seat_Holds
Column Typehold_id PK
user_id FK
seat_id FK
expires_at TIMESTAMP
status VARCHAR

Relationship:

One User → Many Holds
One Seat → One Active Hold

Orders
Column Typeorder_id PK
user_id FK
seat_id FK
purchase_time TIMESTAMP
status VARCHAR

Relationship:

One User → Many Orders
One Seat → One Order

Entity Relationships
Plain Text
Users
| \
| \
| \
| \
| \
v v
Seat_Holds Orders
| |
v v
Seats
|
v
Events 5. Preventing Double Booking

Preventing two people from buying the same seat is the most important requirement of TicketHub.

When a user selects a seat:

Begin a database transaction.
Lock the seat row using row-level locking.
Verify the seat has not already been sold or held.
Create a seat hold record.
Complete payment.
Convert the hold into an order.
Commit the transaction.

Example:

SQL
BEGIN;

 
SELECT \*
FROM seats
WHERE seat_id = 150
FOR UPDATE;

 
-- Verify seat available

 
INSERT INTO seat_holds (...);

 
COMMIT;

A unique constraint is also added:

SQL
UNIQUE(seat_id)

on the Orders table.

If two users attempt to purchase the same seat at the same time:

The first transaction locks the seat.
The second transaction must wait.
After the first buyer succeeds, the second transaction sees the seat is unavailable.
The purchase is rejected.

This guarantees that a seat can only be sold once.

6. Architecture Diagram
   Plain Text
   Users
   |
   |
   CDN
   |
   Load Balancer
   |

---

| | |
App Server 1 App Server 2 App Server 3
| | |

---

|
Redis
Cache
|
Sale Queue
|
PostgreSQL
Database
Component Explanation
CDN

Stores static files such as images and JavaScript closer to users.

Load Balancer

Distributes requests across multiple application servers.

Application Servers

Handle business logic, authentication, seat holds, and purchases.

Redis Cache

Stores frequently requested data:

Event details
Seat maps
Popular event pages

This reduces database load during heavy traffic.

Sale Queue

Used during popular ticket launches.

When many users attempt to buy tickets simultaneously:

Requests enter a queue.
Users are processed fairly.
The database avoids overload.
PostgreSQL Database

Stores:

Users
Events
Seats
Holds
Orders

Provides ACID transactions to guarantee correctness.

How the System Survives the Big Sale
Redis serves most read requests.
CDN handles static content.
Multiple application servers share traffic.
The queue smooths sudden traffic spikes.
Database transactions prevent double-booking.
Expired seat holds automatically release seats back into inventory. 7. Trade-Offs
Trade-Off 1: Fairness vs Speed

Using a queue improves fairness.

Advantages:

Prevents bots and queue jumping.
Gives all users a fair chance.

Disadvantages:

Adds waiting time.
Trade-Off 2: Strong Consistency vs Performance

Using transactions and row locks guarantees seat correctness.

Advantages:

Prevents double-booking.

Disadvantages:

Slightly slower than an eventually consistent design.
Conclusion

TicketHub is designed to support normal daily traffic and extremely large concert sales. Redis caching, load balancing, a sale queue, and database transactions provide scalability, fairness, and correctness while ensuring that no seat can ever be sold twice.
