# US-001 — Create & Join Room

## 1. User story

**Host**
- As a host, I want to create a room and receive a room code and share link, so that guests can join my estimation room.

**Guest**
- As a guest, I want to join a room with its room code and my display name, so that I can participate with the team.

## 2. Acceptance criteria

### AC-1 — Host creates a room
**Given** Maya Chen enters the display name “Maya Chen” when creating a room  
**When** she creates the room  
**Then** she is shown a room code of exactly 6 characters (uppercase letters `A–Z` and digits `0–9`), a share link containing that room code, and a participant list containing “Maya Chen”.  
**And** her display name follows the same validation rules as a guest display name.

### AC-2 — Guest joins with room code
**Given** the room with code `A7K9Q2` is active  
**When** Noah Patel joins using `A7K9Q2` and display name “Noah Patel”  
**Then** the guest joins the room and the participant list includes “Maya Chen” and “Noah Patel”.

### AC-3 — Participant list synchronizes
**Given** Maya Chen and Noah Patel have the same room open in different browsers  
**When** Noah Patel joins  
**Then** both browsers show the same participant list, including “Noah Patel”, within 2 seconds.

### AC-4 — Guest joins from share link
**Given** the share link for room `A7K9Q2` is `https://example.test/?room=A7K9Q2`  
**When** Noah Patel opens the share link and enters “Noah Patel” as the display name  
**Then** the room code field is already filled with `A7K9Q2` and Noah Patel joins without re-entering the room code.

### AC-5 — Empty display name is rejected
**Scenario 1 — Host**  
**Given** Maya Chen leaves the display name empty (or enters only spaces) when creating a room  
**When** she attempts to create the room  
**Then** the room is not created and she sees exactly: “Enter a display name.”

**Scenario 2 — Guest**  
**Given** a guest enters an empty display name (or only spaces, `"   "`) for room `A7K9Q2`  
**When** the guest attempts to join  
**Then** the guest is not added to the participant list and sees exactly: “Enter a display name.”

### AC-6 — Duplicate display name is rejected
**Given** “Noah Patel” is already a participant in room `A7K9Q2`  
**When** another guest attempts to join that room with display name “Noah Patel”  
**Then** the guest is not added to the participant list and sees exactly: “That display name is already used in this room.”

### AC-7 — No host reply prevents joining
**Given** Noah Patel attempts to join using room code `Z9Z9Z9` and no host replies within 5 seconds  
**When** the 5-second wait expires  
**Then** the guest is not added to the participant list and sees exactly: “Room not found or host is not reachable.”

### AC-8 — Lowercase room code is normalized
**Given** the active room has room code `A7K9Q2`  
**When** Noah Patel enters `a7k9q2` as the room code  
**Then** the room code field converts the value to `A7K9Q2` and the guest can join that room.

### AC-9 — Maximum-length display name is accepted
**Given** a guest enters the 24-character display name “abcdefghijklmnopqrstuvwx” for room `A7K9Q2`  
**When** the guest attempts to join  
**Then** the display name is accepted and the guest is added to the participant list.

### AC-10 — Display name over the maximum length is rejected
**Given** a guest enters the 25-character display name “abcdefghijklmnopqrstuvwxy” for room `A7K9Q2`  
**When** the guest attempts to join  
**Then** the guest is not added to the participant list and sees exactly: “Display name must be 24 characters or fewer.”

### AC-11 — Unicode display name is accepted
**Given** a guest enters the display name “Nguyễn Văn” for room `A7K9Q2`, once as precomposed characters, and once typed as base letters plus separate accent marks (the letter e followed by the marks U+0302 and U+0303, and the letter a followed by the mark U+0306)  
**When** the guest attempts to join  
**Then** both inputs are accepted, and the participant list shows “Nguyễn Văn” in each case.

### AC-12 — Display name with invalid characters is rejected
**Given** a guest enters the 18-character display name `<script>x</script>` for room `A7K9Q2`  
**When** the guest attempts to join  
**Then** the guest is not added to the participant list and sees exactly: “Display name contains invalid characters.”

### AC-13 — Leading and trailing spaces are trimmed
**Given** a guest enters the display name “  Noah Patel  ” for room `A7K9Q2`  
**When** the guest joins  
**Then** the participant list shows the display name “Noah Patel” without leading or trailing spaces.

### AC-14 — Duplicate display names are rejected case-insensitively
**Given** “Noah Patel” is already a participant in room `A7K9Q2`  
**When** another guest attempts to join that room with display name “noah patel”  
**Then** the guest is not added to the participant list and sees exactly: “That display name is already used in this room.”

### AC-15 — Guest refresh retains identity in the room
**Given** guest Noah Patel has joined room `A7K9Q2` in a browser tab  
**When** Noah Patel refreshes that page  
**Then** Noah Patel remains in the room under the same display name and appears only once in the participant list, without being rejected as a duplicate.

### AC-16 — Host refresh restores the room
**Given** Maya Chen has created room `A7K9Q2` and Noah Patel has joined it  
**When** Maya Chen refreshes her page  
**Then** the room is restored with the same room code `A7K9Q2`, the participant list still contains “Maya Chen” once and “Noah Patel”, and Maya Chen is not rejected as a duplicate.

### AC-17 — Malformed room code is rejected immediately
**Given** Noah Patel enters an empty room code, or `A7K9` (4 characters), or `A7K9Q2X` (7 characters)  
**When** he attempts to join  
**Then** he does not join a room and sees exactly: “Enter a 6-character room code.” without waiting 5 seconds.

### AC-18 — Room code with invalid characters is rejected immediately
**Given** Noah Patel enters the 6-character room code `A7K9Q!`  
**When** he attempts to join  
**Then** he does not join a room and sees exactly: “Room code can only contain letters and digits.” without waiting 5 seconds.

### AC-19 — Host cannot reach the realtime service
**Given** Maya Chen enters the valid display name “Maya Chen” and the realtime connection cannot be established  
**When** she creates the room and 10 seconds pass without a connection  
**Then** no room is created, no room code is shown, and she sees exactly: “Could not connect to the realtime service. Try again.” in the create form.

## 3. Field definitions

| Field | Type | Min / max length | Allowed characters | Uniqueness | Error message |
|---|---|---:|---|---|---|
| Display name | Text | 1 / 24 Unicode code points, counted after NFC normalization and trimming | Unicode letters, combining marks, digits, the ordinary space (U+0020) only, hyphens, and apostrophes; any other whitespace character is invalid; the value is normalized to Unicode NFC, then leading and trailing spaces are trimmed, before validation. | Unique within a room; compared with `toLowerCase()` after NFC normalization and trimming. | Empty: “Enter a display name.” Too long: “Display name must be 24 characters or fewer.” Invalid characters: “Display name contains invalid characters.” Duplicate: “That display name is already used in this room.” |
| Room code | Text | Exactly 6 characters | Uppercase ASCII letters `A–Z` and digits `0–9`; lowercase input is converted to uppercase. | Randomly generated; collisions are treated as negligible because no room registry exists. | Empty or not exactly 6 characters: “Enter a 6-character room code.” (immediate). Exactly 6 characters with a character outside `A–Z` and `0–9`: “Room code can only contain letters and digits.” (immediate). Well-formed code with no host reply within 5 seconds: “Room not found or host is not reachable.” |

## 4. Error and edge cases

| Edge case | Acceptance criterion |
|---|---|
| Empty or whitespace-only display name | AC-5; host display name follows the same validation rules in AC-1. |
| Display name already used, including case-only difference | AC-6 and AC-14. |
| 24-character display name accepted | AC-9. |
| 25-character display name rejected | AC-10. |
| Unicode display name accepted | AC-11. |
| Invalid display-name characters | AC-12. |
| Leading and trailing display-name spaces | AC-13. |
| Unknown room code or unreachable host (no reply within 5 seconds) | AC-7. |
| Room code supplied by share link | AC-4. |
| Lowercase room code | AC-8. |
| Guest refreshes the page | AC-15. |
| Host refreshes the page | AC-16. |
| Empty or malformed room code (wrong length) | AC-17. |
| Room code of 6 characters with invalid characters | AC-18. |
| Host cannot connect to the realtime service | AC-19. |
| Display name typed with combining marks | AC-11. |

## 5. Traceability

| Product brief success criterion | Coverage |
|---|---|
| 1 | Covered by AC-3: participants in different browsers see the same participant list within 2 seconds. |
| 4 | Partial: this story covers room creation and guest joining, the first two actions in the full-round flow. Voting, reveal, and next story are outside this feature. |

## 6. Assumptions

- **A-1:** The host enters a display name when creating a room, so the host can appear in the participant list; the brief does not specify this input.
- **A-2:** A room code is exactly 6 characters and uses uppercase ASCII letters and digits; it is generated randomly, and collisions are treated as negligible because no room registry exists. The brief says only “short code”.
- **A-3:** Display names are normalized to Unicode NFC and trimmed at the start and end; they are 1–24 Unicode code points counted after that, permit Unicode letters, combining marks, digits, the ordinary space (U+0020), hyphens, and apostrophes (any other whitespace is invalid), and are compared with `toLowerCase()` after normalization and trimming. These constraints are not stated in the brief.
- **A-4:** A share link contains the room code as the `room` query parameter, for example `https://example.test/?room=A7K9Q2`; the URL format is not stated in the brief.
- **A-5:** Exact validation and connection error messages are as written in AC-5–AC-7, AC-10, AC-12, AC-14 and AC-17–AC-19; the brief does not define message text.
- **A-6:** An active room is a room whose host tab is open. If no host reply arrives within 5 seconds, the guest sees the same message whether the code is unknown or the host is unreachable; D-003 means there is no room registry to distinguish those cases.
- **A-7:** A guest who closes the tab is not removed from the participant list in the MVP; removal behavior is not specified in the brief.
- **A-8:** A guest refresh retains the same tab identity and display name without creating a duplicate participant, per D-006.
- **A-9:** The host identity is also kept per tab (D-006), so a host refresh restores the same room (same code, same participants) instead of ending it. Closing the host tab still ends the room, as stated in the brief. This is not host migration, which stays out of scope.
- **A-10:** A malformed room code (empty, not exactly 6 characters after uppercasing, or containing characters outside `A–Z` and `0–9`) is rejected locally and immediately; no host lookup or 5-second wait happens.
- **A-11:** If the host's saved room is missing or unreadable after a host refresh, the app shows the home screen (create and join forms) with no error, and the room is gone.
- **A-12:** If the realtime connection cannot be established, the guest sees the same message as AC-7 after 5 seconds.
- **A-13:** The host's room is shown only once the realtime connection is ready, so a guest who joins right after the code appears reaches the host. The host's first connection was measured at about 3 seconds in a spike, so the host waits up to 10 seconds (AC-19) instead of the guest's 5.
- **A-14:** On guest refresh the guest sees a reconnecting state until the host replies. If no matching reply arrives within 5,000 ms, the app shows the home screen with the AC-7 message in `join-error` and deletes the guest session.
