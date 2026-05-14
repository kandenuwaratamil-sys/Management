# Firebase Security Specification - Kandenuwara School Management System

## Data Invariants
1. A user can only access their own profile unless they are an admin.
2. Only admins can create/update/delete student and teacher records.
3. Attendance can be marked by admins and teachers.
4. Subjects and Terms can only be managed by admins.
5. All IDs must follow a strict format `^[a-zA-Z0-9_\-]+$`.
6. Timestamps must be server-generated.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: Attempt to create a user profile with a different UID than the authenticated user.
2. **Privilege Escalation**: A student trying to update their role to 'admin'.
3. **Orphaned Student**: Creating a student record without being an admin.
4. **Invalid ID**: Using a 1MB string or special characters as a document ID.
5. **Ghost Field Injection**: Adding `isVerified: true` to a student record.
6. **Future Attendance**: Marking attendance with a future date.
7. **Cross-Tenant Attack**: Deleting a record belonging to another user (not applicable as much here but still a risk if shared).
8. **PII Leak**: Reading all users' emails as a student.
9. **State Shortcut**: Setting term progress to 200%.
10. **Immutable Field Change**: Changing `createdAt` on an existing student record.
11. **Spoofed Attendance**: A student marking their own attendance as 'present'.
12. **Admin Hijack**: Trying to add a UID to the `/admins/` collection.

## Test Runner (Vulnerability Verification)
The `firestore.rules.test.ts` will verify that all unauthorized operations return `PERMISSION_DENIED`.
