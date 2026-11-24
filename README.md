Assignment 9 - Reading List

## Run the app

Use Node.js 26 LTS. Open two terminals in the project folder.

Server terminal:
```powershell
cd server
npm.cmd ci
npm.cmd start
```

Client terminal:
```powershell
cd client
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Open [http://localhost:5173](http://localhost:5173). Keep both terminals running; Ctrl+C stops them.

Server variables: `PORT=3000` and `CLIENT_ORIGIN=http://localhost:5173`. The client uses `VITE_API_URL=http://localhost:3000` in `client/.env`; restart Vite after changing it. No Vite proxy is used.

## Files

- `server/server.js`: routes, CORS and errors.
- `server/booksStore.js`: books in memory and statistics.
- `server/validate.js`: book, id and query checks.
- `client/src/api/books.js`: Fetch requests.
- `client/src/components/`: book form, book list, filters and statistics.
- `client/src/App.jsx` and `main.jsx`: state, page components and React startup.
- `client/src/index.css`: basic styling; `client/.env.example`: API URL example.

## Testing

`GET /api/crash` is kept to demonstrate an async error. It logs the error and returns 500 with `{ "error": "Something went wrong" }`.

OPTIONS requests appeared in the server log; the curl headers are below. The browser Network-tab capture and wrong-origin console result still need to be recorded.

## Questions

1. **Parameters:** The id identifies one book, like `/api/books/7`. Genre and sort control the list and go in the query string. Putting id in the query string would make the list route also handle single-book requests.

2. **Body parsing:** With `express.json()` below the routes, `req.body` was undefined and POST returned 400 with `Body must be a JSON object`. The parser must run before the routes so they can read the JSON.

3. **One response:** Without `return`, the client got 404, but the handler tried to send another response and logged `ERR_HTTP_HEADERS_SENT`. Using `return` stops the handler after the first response.

4. **PUT and PATCH:** PATCH is useful for changing only a rating and keeping the other fields. PUT fits the edit form because it replaces the whole book. In the book 7 test below, PUT sent the complete book and PATCH changed its rating from 5 to 4.

5. **CORS:** With `CLIENT_ORIGIN=http://localhost:9999`, the server logged the request and returned 200 with the wrong allowed-origin header. The browser console check is still pending; a CORS error is expected because the client runs on port 5173. curl can read the response because it does not enforce browser CORS rules.

6. **Validation:** Someone can use curl to send a request without using the form. The server must check the data again, such as rejecting a rating for an unread book.

7. **State:** Adding a book changed the total from six to seven, but restarting restored six and the added book returned 404. The books live in program memory, so keeping changes would need saved storage.

## Self-study

- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams): encodes query values safely; used for search and filters.
- [localeCompare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare): compares text alphabetically; used to sort titles and authors on an array copy.
- [Vite variables](https://vite.dev/guide/env-and-mode): the `VITE_` prefix makes a variable available to client code; the API URL is read with `import.meta.env.VITE_API_URL`.
- [Express responses](https://expressjs.com/en/5x/api/response/): `res.status(204).end()` sends no body; the Fetch helper skips JSON parsing for 204.
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController): cleanup aborts old Fetch requests; checking the signal stops their results and cancellation errors from changing the page.

## Challenges

The main challenges were checking read status and rating together in PATCH, and keeping unrated books last in both sort directions. Old search requests also had to be cancelled so they could not replace newer results.

## Curl results

Recorded with Node.js 26.13.1 on 24 November 2026. These Git Bash commands used test port 64618; change it to 3000 when running them normally. The full response headers and bodies are kept below.

```text
# 1. Statistics before a change
$ curl.exe --include --silent --show-error http://localhost:64618/api/stats
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-mL6daAkHNonMCKN4oSWDtLCg+To"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":6,"read":4,"unread":2,"averageRating":4.5,"byGenre":{"fiction":2,"fantasy":1,"science":1,"history":1,"non-fiction":1}}

# 2. Combined genre, read, and sort query
$ curl.exe --include --silent --show-error "http://localhost:64618/api/books?genre=fiction&read=true&sort=title"
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 246
ETag: W/"f6-9K+4V5rLW+f7E55KHqjTFrymjAk"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":6,"title":"The Dispossessed","author":"Ursula K. Le Guin","year":1974,"genre":"fiction","read":true,"rating":5},{"id":1,"title":"The Left Hand of Darkness","author":"Ursula K. Le Guin","year":1969,"genre":"fiction","read":true,"rating":5}]

# 3. One book
$ curl.exe --include --silent --show-error http://localhost:64618/api/books/1
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 126
ETag: W/"7e-FKb/RrXcFP+az5pnkH4h5uwbel8"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"The Left Hand of Darkness","author":"Ursula K. Le Guin","year":1969,"genre":"fiction","read":true,"rating":5}

# 4. Create a book (Location header)
$ curl.exe --include --silent --show-error --request POST --header "Content-Type: application/json" --data-raw '{"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science"}' http://localhost:64618/api/books
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/7
Content-Type: application/json; charset=utf-8
Content-Length: 105
ETag: W/"69-8kXkNrMjj3kKhlLq+1Mlo3M1GZU"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science","read":false,"rating":null}

# 5. Statistics after creation
$ curl.exe --include --silent --show-error http://localhost:64618/api/stats
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-XxMvW7YEDxNAQklYdEa2HaAdPNY"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":7,"read":4,"unread":3,"averageRating":4.5,"byGenre":{"fiction":2,"fantasy":1,"science":2,"history":1,"non-fiction":1}}

# 6. Invalid year
$ curl.exe --include --silent --show-error --request POST --header "Content-Type: application/json" --data-raw '{"title":"Invalid year","author":"Test author","year":999,"genre":"other"}' http://localhost:64618/api/books
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 57
ETag: W/"39-2hxkQVGUygT77eAZY8u2BQSh9Ts"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"year must be an integer between 1000 and 2026"}

# 7. Repeated query parameter
$ curl.exe --include --silent --show-error "http://localhost:64618/api/books?genre=fiction&genre=history"
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 54
ETag: W/"36-IZzciCoGJsoVLecxPqow1HazVJM"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Query parameter genre must not be repeated"}

# 8. Missing resource
$ curl.exe --include --silent --show-error http://localhost:64618/api/books/99999
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}

# 9. Duplicate title and author
$ curl.exe --include --silent --show-error --request POST --header "Content-Type: application/json" --data-raw '{"title":" dune ","author":"FRANK HERBERT","year":1965,"genre":"science"}' http://localhost:64618/api/books
HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 60
ETag: W/"3c-YJy0XpDp5agPe/8cl8QkvyagI8A"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"A book with this title and author already exists"}

# 10. PUT replaces book 7 with a complete body
$ curl.exe --include --silent --show-error --request PUT --header "Content-Type: application/json" --data-raw '{"title":"Dune (replacement)","author":"Frank Herbert","year":1965,"genre":"fiction","read":true,"rating":5}' http://localhost:64618/api/books/7
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 115
ETag: W/"73-5SBtbA0E7JUVYxpV7xxSji30rJc"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"Dune (replacement)","author":"Frank Herbert","year":1965,"genre":"fiction","read":true,"rating":5}

# 11. PATCH changes only rating on the same book 7
$ curl.exe --include --silent --show-error --request PATCH --header "Content-Type: application/json" --data-raw '{"rating":4}' http://localhost:64618/api/books/7
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 115
ETag: W/"73-TwI6IXMLIGONO6mSUl93lnYMpYc"
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"Dune (replacement)","author":"Frank Herbert","year":1965,"genre":"fiction","read":true,"rating":4}

# 12. Delete book 7 with no response body
$ curl.exe --include --silent --show-error --request DELETE http://localhost:64618/api/books/7
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Tue, 24 Nov 2026 10:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

# 13. Delete book 7 again
$ curl.exe --include --silent --show-error --request DELETE http://localhost:64618/api/books/7
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Tue, 24 Nov 2026 10:18:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}

# 14. OPTIONS preflight
$ curl.exe --include --silent --show-error --request OPTIONS --header "Origin: http://localhost:5173" --header "Access-Control-Request-Method: PATCH" --header "Access-Control-Request-Headers: content-type" http://localhost:64618/api/books/1
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin, Access-Control-Request-Headers
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
Content-Length: 0
Date: Tue, 24 Nov 2026 10:18:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```
