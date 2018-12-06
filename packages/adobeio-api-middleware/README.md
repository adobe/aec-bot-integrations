# adobeio-api-wrapper
Tools for using Adobe.IO server side APIs 
This is a pre-requirement for integrating with Adobe Campaign Standard APIs.

I've added a repo clone of a project done internally at Adobe which already does a lot of this, though it was designed for serverless execution. 

We can use this code as a reference. Once its no longer needed it will be removed. 
The code is available [here](existing-packages-to-be-deleted).

## What should this package do?
* Create a JWT (Json Web Token) from a private key.

   Documentation:
[JWT Authentication Quick Start](https://www.adobe.io/authentication/auth-methods.html#!adobeio/adobeio-documentation/master/auth/JWTAuthenticationQuickStart.md) 

   We can use ready Node packages for generating JWTs, from a quick search, [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) seems very popular.

* Exchange the JWT for an access token

   This is done by a  POST request to https://ims-na1.adobelogin.com/ims/exchange/jwt with the following parameters:

   * **client_id:**	The API key generated for your integration. Find this on the I/O Console for your integration.
   * **client_secret:**	The client secret generated for your integration. Find this on the I/O Console for your integration.
   * **jwt_token:**	A base-64 encoded JSON Web Token that encapsulates the identity of your integration, signed with a private key that corresponds to a public key certificate attached to the integration. Generate this on the I/O Console in the JWT Tab for your integration. Note that this token has expiration time parameter exp set to 24 hours from when the token is generated.

* Make an API calls using the access token. Seamlessly refresh the access token if needed.

## Why do we need this package?

This is a pre-requisite for using Adobe Campaign Standard APIs and potentially other Adobe APIs in the future.



