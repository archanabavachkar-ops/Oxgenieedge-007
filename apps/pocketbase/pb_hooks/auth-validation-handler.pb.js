/// <reference path="../pb_data/types.d.ts" />
// Validate auth request data before authentication
onRecordAuthWithPasswordRequest((e) => {
  const identity = e.requestInfo.data.get("identity");
  const password = e.requestInfo.data.get("password");
  
  // Validate that both identity and password are provided
  if (!identity || identity.trim() === "") {
    throw new BadRequestError("Email is required");
  }
  
  if (!password || password.trim() === "") {
    throw new BadRequestError("Password is required");
  }
  
  // Validate password length
  if (password.length < 8) {
    throw new BadRequestError("Invalid credentials");
  }
  
  e.next();
}, "users");

// Log successful authentication attempts
onRecordAuthWithPasswordRequest((e) => {
  const identity = e.requestInfo.data.get("identity");
  console.log("Authentication attempt for: " + identity);
  e.next();
}, "users");

// Handle auth errors gracefully
onRecordAfterCreateError((e) => {
  console.log("User creation error: " + e.error);
  e.next();
}, "users");