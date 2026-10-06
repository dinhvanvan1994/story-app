# Glossary

Single vocabulary for all artifacts (stories, specs, test cases, code, UI text). Use the term in the first column; never the ones in the last column.

| Term | Definition | Do not call it |
|---|---|---|
| Average | Arithmetic mean of the numeric votes in a round; `?` votes are excluded. | Mean score, result |
| Card | One selectable value on the Fibonacci scale shown in the UI. | Button, option |
| Consensus | True when at least one vote is cast and every cast vote has the same value. | Agreement, match |
| Display name | The name a participant types when joining; unique within a room. | Username, nickname |
| Fibonacci scale | The fixed set of cards: 0, 1, 2, 3, 5, 8, 13, 21, `?`. No custom scales. | Deck, custom scale |
| Guest | A participant who is not the host. | Player, client |
| Host | The participant who created the room: starts stories, reveals votes, moves to the next story. The product brief calls this persona the Facilitator; same person. | Admin, owner |
| Intent | A request a guest sends to the host to change room state (join, vote). | Event, command |
| Next story | Host action that clears all votes and returns the room to `waiting`. | Reset, restart |
| Participant | Anyone in a room, host included. | User, member, player |
| Phase | Where the room is in a round: `waiting` (no story started), `voting`, or `revealed`. | Status, state |
| Public view | The room state the host broadcasts: includes who has voted, hides vote values until reveal. | Private state, full state |
| Reducer | Pure function `(room, action) -> room` that applies every state change on the host. | Handler, controller |
| Results | What is shown after reveal: each vote, average, most common, highest, lowest, consensus. | Summary, report |
| Reveal | Host action that makes all votes visible to everyone at once. | Publish, show |
| Room | Ephemeral shared space identified by a room code; ends when the host closes the tab. | Session, game, lobby |
| Room code | Short code used to join a room; also embedded in the share link. | Room ID, PIN |
| Round | One story's estimation cycle: start story, vote, reveal, until next story. | Session, turn |
| Share link | URL containing the room code that lets someone join directly. | Invite link |
| Story | The item being estimated in a round (title only, no description in MVP). | Ticket, task, issue |
| Story point | The relative estimate for a story, chosen from the Fibonacci scale. | Point, size |
| Vote | One participant's chosen card for the current story. Shown to others as "Voted" / "Not voted" until reveal. | Selection, answer |
