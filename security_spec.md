# Security Specification

## 1. Data Invariants
- A user profile must correspond to the `userId` making the creation request unless they are an admin.
- Users cannot elevate their own privileges. A new profile must be created with the 'Viewer' role unless the creator is a bootstrapped admin.
- Email must correspond to the signed-in user's verified token.
- Only Admins can modify an existing user's role.
- Roles are strictly limited to 'Admin', 'Analyst', 'Viewer'.

## 2. Dirty Dozen Payloads
1. User creates profile with 'Admin' role (not bootstrapped admin).
2. Unverified email user attempts to create profile.
3. User attempts to read another user's profile.
4. User tries to overwrite an existing profile to change their role.
5. Admin attempts to assign an invalid role ('Superuser').
6. User provides invalid email length.
7. Payload missing required 'email' key.
8. Payload missing required 'role' key.
9. User attempts to modify their own role.
10. Payload includes extra unexpected fields (e.g., 'isAdmin: true').
11. User sets a different userId in the path than their auth UID.
12. Admin updates role but removes the email field mapping (affectedKeys violation).
