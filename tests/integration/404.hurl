# request a route that doesn't exist
GET http://localhost:8080/no-such-route

# We should get back an HTTP 1.1 404 response
HTTP/1.1 404
[Asserts]
header "Content-Type" startsWith "application/json"
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" isString
