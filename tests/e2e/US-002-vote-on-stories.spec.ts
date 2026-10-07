import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { RoomPage } from "../page-objects/RoomPage";

interface BrowserActor {
  context: BrowserContext;
  page: Page;
  roomPage: RoomPage;
}

async function withActors(
  browser: Browser,
  count: number,
  action: (actors: BrowserActor[]) => Promise<void>,
): Promise<void> {
  const actors: BrowserActor[] = [];
  try {
    for (let index = 0; index < count; index += 1) {
      const context = await browser.newContext();
      const page = await context.newPage();
      actors.push({ context, page, roomPage: new RoomPage(page) });
    }
    await action(actors);
  } finally {
    await Promise.all(actors.map(({ context }) => context.close()));
  }
}

async function createHostRoom(host: BrowserActor): Promise<string> {
  await host.roomPage.goto("/");
  await host.roomPage.createRoom("Maya Chen");
  await expect(host.roomPage.roomView).toBeVisible({ timeout: 10_000 });
  return host.roomPage.roomCode();
}

async function joinGuest(
  guest: BrowserActor,
  code: string,
  name: string,
): Promise<void> {
  await guest.roomPage.goto("/");
  await guest.roomPage.joinRoom(code, name);
  await expect(guest.roomPage.roomView).toBeVisible();
}

async function startVoting(
  host: BrowserActor,
  title = "Checkout flow",
): Promise<void> {
  await host.roomPage.startStory(title);
  await expect(host.roomPage.roomPhase).toHaveText("voting");
}

function listenForRoomStateViews(page: Page): unknown[] {
  const views: unknown[] = [];
  page.on("websocket", (socket) => {
    socket.on("framereceived", (event) => {
      const frameText = Buffer.from(event.payload).toString("utf8");
      const eventIndex = frameText.indexOf("room:state");
      if (eventIndex < 0) {
        return;
      }
      const payloadIndex = frameText.indexOf("{", eventIndex);
      if (payloadIndex < 0) {
        throw new Error("The room:state WebSocket frame has no JSON payload.");
      }
      const payload: unknown = JSON.parse(frameText.slice(payloadIndex));
      collectRoomStateViews(
        { event: "room:state", payload },
        views,
      );
    });
  });
  return views;
}

function collectRoomStateViews(value: unknown, views: unknown[]): void {
  if (!isRecord(value) && !Array.isArray(value)) {
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectRoomStateViews(entry, views);
    }
    return;
  }
  const record = value;
  if (
    record.event === "room:state" &&
    isRecord(record.payload)
  ) {
    if (isRecord(record.payload.view)) {
      views.push(record.payload.view);
    }
  }
  for (const nested of Object.values(record)) {
    collectRoomStateViews(nested, views);
  }
}

async function readHostRoom(host: BrowserActor): Promise<unknown> {
  return host.page.evaluate(() => {
    const snapshot = sessionStorage.getItem("story-app:host-room");
    if (snapshot === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(snapshot);
    return parsed;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hostRoomVoteCount(value: unknown): number {
  if (!isRecord(value) || !Array.isArray(value.votes)) {
    return -1;
  }
  return value.votes.length;
}

function hostVoteForParticipant(
  value: unknown,
  displayName: string,
): unknown {
  if (
    !isRecord(value) ||
    !Array.isArray(value.participants) ||
    !Array.isArray(value.votes)
  ) {
    return undefined;
  }
  const participant = value.participants.find(
    (entry) => isRecord(entry) && entry.displayName === displayName,
  );
  if (!isRecord(participant) || typeof participant.id !== "string") {
    return undefined;
  }
  const vote = value.votes.find(
    (entry) =>
      isRecord(entry) && entry.participantId === participant.id,
  );
  return isRecord(vote) ? vote.value : undefined;
}

function publicViewContainsVoteValue(view: unknown): boolean {
  return (
    !isRecord(view) ||
    !Array.isArray(view.votes) ||
    view.votes.some(
      (vote) => isRecord(vote) && Object.hasOwn(vote, "value"),
    )
  );
}

const cards = (page: RoomPage) => [
  page.card0,
  page.card1,
  page.card2,
  page.card3,
  page.card5,
  page.card8,
  page.card13,
  page.card21,
  page.cardQuestion,
];

// TC-002-01
test("US-002 TC-002-01 Host starts a titled Story and begins a clean Round", async ({
  browser,
}) => {
  await withActors(browser, 1, async ([host]) => {
    await createHostRoom(host);
    await host.roomPage.startStory("  Checkout flow  ");
    await expect(host.roomPage.roomPhase).toHaveText("voting");
    await expect(host.roomPage.currentStoryTitle).toHaveText("Checkout flow");
    await expect.poll(async () =>
      hostRoomVoteCount(await readHostRoom(host)),
    ).toBe(0);
    await expect(await readHostRoom(host)).toMatchObject({
      phase: "voting",
      story: { title: "Checkout flow" },
      votes: [],
      revision: 2,
    });
  });
});

// TC-002-04
test("US-002 TC-002-04 Host and Guest each cast one Vote in a Round", async ({
  browser,
}) => {
  await withActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await joinGuest(guest, code, "Noah Patel");
    await startVoting(host);

    await host.roomPage.chooseCard(5);
    await guest.roomPage.chooseCard("?");

    await expect(host.roomPage.participantVoteStatus("Maya Chen")).toContainText(
      "5",
    );
    await expect(
      guest.roomPage.participantVoteStatus("Noah Patel"),
    ).toContainText("?");
    await expect.poll(async () =>
      hostRoomVoteCount(await readHostRoom(host)),
    ).toBe(2);
  });
});

// TC-002-06
test("US-002 TC-002-06 Participant changes a Vote before Reveal", async ({
  browser,
}) => {
  await withActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await joinGuest(guest, code, "Noah Patel");
    await startVoting(host);

    await guest.roomPage.chooseCard(3);
    await expect(
      host.roomPage.participantVoteStatus("Noah Patel"),
    ).toContainText("Voted");
    await guest.roomPage.chooseCard(8);

    await expect.poll(async () =>
      hostVoteForParticipant(await readHostRoom(host), "Noah Patel"),
    ).toBe(8);
    const room = await readHostRoom(host);
    expect(hostRoomVoteCount(room)).toBe(1);
  });
});

// TC-002-08
test("US-002 TC-002-08 Participants see only permitted Vote information before Reveal", async ({
  browser,
}) => {
  await withActors(browser, 3, async ([host, guestB, guestC]) => {
    const guestViews = [
      listenForRoomStateViews(guestB.page),
      listenForRoomStateViews(guestC.page),
    ];
    const code = await createHostRoom(host);
    await joinGuest(guestB, code, "Noah Patel");
    await joinGuest(guestC, code, "Ava Kim");
    await startVoting(host);

    await guestB.roomPage.chooseCard(5);
    await expect(
      guestB.roomPage.participantVoteStatus("Noah Patel"),
    ).toContainText("5");
    await expect(
      guestB.roomPage.participantVoteStatus("Ava Kim"),
    ).toContainText("Not voted");
    await expect(
      guestC.roomPage.participantVoteStatus("Noah Patel"),
    ).toContainText("Voted");
    await expect.poll(() => guestViews.flat().length).toBeGreaterThan(0);

    const votingViews = guestViews.flat().filter((view) => {
      return (
        typeof view === "object" &&
        view !== null &&
        "phase" in view &&
        view.phase === "voting"
      );
    });
    expect(votingViews.length).toBeGreaterThan(0);
    expect(
      votingViews.every((view) => !publicViewContainsVoteValue(view)),
    ).toBe(true);
  });
});

// TC-002-09
test("US-002 TC-002-09 Host Reveals all current Vote values", async ({
  browser,
}) => {
  await withActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await joinGuest(guest, code, "Noah Patel");
    await startVoting(host);
    await host.roomPage.chooseCard(8);
    await guest.roomPage.chooseCard("?");
    await expect.poll(async () =>
      hostRoomVoteCount(await readHostRoom(host)),
    ).toBe(2);
    await host.roomPage.revealVotes();

    await expect(host.roomPage.roomPhase).toHaveText("revealed");
    await expect(guest.roomPage.roomPhase).toHaveText("revealed");
    await expect(host.roomPage.participantVoteStatus("Maya Chen")).toContainText(
      "8",
    );
    await expect(
      guest.roomPage.participantVoteStatus("Noah Patel"),
    ).toContainText("?");
  });
});

// TC-002-12
test("US-002 TC-002-12 Host sees the exact no-Vote Reveal message", async ({
  browser,
}) => {
  await withActors(browser, 1, async ([host]) => {
    await createHostRoom(host);
    await startVoting(host);
    await host.roomPage.revealVotes();
    await expect(host.roomPage.revealError).toHaveText(
      "At least one vote is required to reveal",
    );
    await expect(host.roomPage.roomPhase).toHaveText("voting");
  });
});

// TC-002-14
test("US-002 TC-002-14 Guest does not see Host-only actions", async ({
  browser,
}) => {
  await withActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await joinGuest(guest, code, "Noah Patel");

    await expect(guest.roomPage.startStoryButton).toBeHidden();
    for (const card of cards(guest.roomPage)) {
      await expect(card).toBeDisabled();
    }
    await startVoting(host);
    for (const card of cards(guest.roomPage)) {
      await expect(card).toBeEnabled();
    }
    await expect(guest.roomPage.revealVotesButton).toBeHidden();
    await host.roomPage.chooseCard(5);
    await host.roomPage.revealVotes();
    await expect(guest.roomPage.nextStoryButton).toBeHidden();
  });
});

// TC-002-16
test("US-002 TC-002-16 all Card controls are disabled after Reveal", async ({
  browser,
}) => {
  await withActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await joinGuest(guest, code, "Noah Patel");
    await startVoting(host);
    await guest.roomPage.chooseCard(3);
    await expect.poll(async () =>
      hostRoomVoteCount(await readHostRoom(host)),
    ).toBe(1);
    await host.roomPage.revealVotes();

    for (const card of cards(guest.roomPage)) {
      await expect(card).toBeDisabled();
    }
    await expect(guest.roomPage.roomPhase).toHaveText("revealed");
  });
});

// TC-002-18
test("US-002 TC-002-18 Next story resets the Round for all Participants", async ({
  browser,
}) => {
  await withActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await joinGuest(guest, code, "Noah Patel");
    await startVoting(host);
    await guest.roomPage.chooseCard(5);
    await expect.poll(async () =>
      hostRoomVoteCount(await readHostRoom(host)),
    ).toBe(1);
    await host.roomPage.revealVotes();
    await host.roomPage.nextStory();

    await expect(host.roomPage.roomPhase).toHaveText("waiting");
    await expect(guest.roomPage.roomPhase).toHaveText("waiting");
    await expect(host.roomPage.currentStoryTitle).toBeHidden();
    await expect(guest.roomPage.participantVoteStatus("Noah Patel")).toHaveCount(
      0,
    );
  });
});

// TC-002-19
test("US-002 TC-002-19 Guest joining during voting can Vote in the active Round", async ({
  browser,
}) => {
  await withActors(browser, 3, async ([host, guestB, guestC]) => {
    const code = await createHostRoom(host);
    await joinGuest(guestB, code, "Noah Patel");
    await startVoting(host);
    const guestViews = listenForRoomStateViews(guestC.page);
    await joinGuest(guestC, code, "Ava Kim");
    await expect(guestC.roomPage.roomPhase).toHaveText("voting");
    await expect(guestC.roomPage.currentStoryTitle).toHaveText("Checkout flow");

    await guestC.roomPage.chooseCard(2);
    await expect(
      host.roomPage.participantVoteStatus("Ava Kim"),
    ).toContainText("Voted");
    await expect.poll(() => guestViews.length).toBeGreaterThan(0);
    const votingViews = guestViews.filter((view) => {
      return (
        typeof view === "object" &&
        view !== null &&
        "phase" in view &&
        view.phase === "voting"
      );
    });
    expect(votingViews.length).toBeGreaterThan(0);
    expect(
      votingViews.every((view) => !publicViewContainsVoteValue(view)),
    ).toBe(true);
    const room = await readHostRoom(host);
    expect(room).toMatchObject({
      votes: [
        {
          participantId: expect.any(String),
          value: 2,
        },
      ],
    });
  });
});

// TC-002-23
test("US-002 TC-002-23 Round controls are operable by keyboard", async ({
  browser,
}) => {
  await withActors(browser, 1, async ([host]) => {
    await createHostRoom(host);
    await host.roomPage.storyTitle.focus();
    await host.page.keyboard.insertText("Checkout flow");
    await host.page.keyboard.press("Tab");
    await host.page.keyboard.press("Enter");
    await expect(host.roomPage.roomPhase).toHaveText("voting");

    await host.roomPage.card5.focus();
    await host.page.keyboard.press("Enter");
    await host.roomPage.revealVotesButton.focus();
    await host.page.keyboard.press("Enter");
    await expect(host.roomPage.roomPhase).toHaveText("revealed");
    await host.roomPage.nextStoryButton.focus();
    await host.page.keyboard.press("Enter");
    await expect(host.roomPage.roomPhase).toHaveText("waiting");
  });
});

// TC-002-24
test("US-002 TC-002-24 Story title markup is rendered as text", async ({
  browser,
}) => {
  await withActors(browser, 1, async ([host]) => {
    const dialogs: string[] = [];
    host.page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message);
      await dialog.dismiss();
    });
    await createHostRoom(host);
    const title = "<img src=x onerror=alert(1)>";
    await host.roomPage.startStory(title);
    await expect(host.roomPage.currentStoryTitle).toHaveText(title);
    expect(dialogs).toEqual([]);
  });
});
