# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a markdown fragment
Content-Type: text/markdown
# Body of the request goes in ```...``` when it's a string
```# This is a fragment!```

# We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check 
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# If the request is missing the Authorization header, it should be forbidden
GET {{url}}

HTTP/1.1 401

# If the wrong username/password pair are used (no such user), it should be forbidden
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhjlkkj3JkMQ==

HTTP/1.1 401

# Try to GET the fragment we just posted by its URL
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Length: 21
[Asserts]
header "Content-Type" startsWith "text/markdown"
body == "# This is a fragment!"

# GET the fragment by converting markdown fragment to html
GET {{url}}.html
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Length: 29
[Asserts]
header "Content-Type" startsWith "text/html"
body contains "<h1>This is a fragment!</h1>"

# If the extension used represents an unknown or unsupported type, or if the fragment cannot be converted to this type, 
# an HTTP 415 error is returned instead, with an appropriate message. For example, a plain text fragment cannot be returned as a PNG.
GET {{url}}.png
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 415

# no fragments with the given id returns 404 error
GET http://localhost:8080/v1/fragments/randomid
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404
