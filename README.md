# nodejs-jwt-auth-api
a simple nodejs authentication API

### register
```
url: postman(localhost:3000/register)
type: post
params: {
name,
emai,
password
}

returns: {
auth,
token,
message
}
```

### login
```
url: postman(localhost:3000/login)
type: post
params: {
email,
password
}

returns: {
auth,
token,
_id,
message
}
```

### some-resource
```
url: postman(localhost:3000/some-resource)
type: get
header: x-access-token
params: {
_id
}

returns: {
name,
email,
auth,
message
}
```
