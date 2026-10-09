# Library Books API

## List Books

- Method: GET
- Path: /books
- Description: Get all books.
- Success Status Code: 200 OK

## Get One Book

- Method: GET
- Path: /books/1
- Description: Get a single book by ID.
- Success Status Code: 200 OK

## Create a Book

- Method: POST
- Path: /books
- Description: Create a new book.
- Success Status Code: 201 Created

Example Request Body:

```json
{
  "title": "Harry Potter",
  "author": "J.K. Rowling"
}
```

## Update a Book

- Method: PUT
- Path: /books/1
- Description: Update an existing book.
- Success Status Code: 200 OK

Example Request Body:

```json
{
  "title": "Harry Potter Updated",
  "author": "J.K. Rowling"
}
```

## Delete a Book

- Method: DELETE
- Path: /books/1
- Description: Delete a book.
- Success Status Code: 204 No Content

## List Books by Author

- Method: GET
- Path: /books?author=J.K. Rowling
- Description: Get all books by a specific author.
- Success Status Code: 200 OK

# Error Codes

## 400 Bad Request

Example:

- The title field is missing when creating a book.

## 404 Not Found

Example:

- Book ID 999 does not exist.
