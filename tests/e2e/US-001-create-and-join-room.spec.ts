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

async function withBrowserActors(
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

async function expectParticipant(
  roomPage: RoomPage,
  name: string,
  timeout?: number,
): Promise<void> {
  const matchingItems = roomPage.participantItemsWithText(name);
  await expect(matchingItems).toHaveCount(1, { timeout });
  await expect(matchingItems).toContainText(name, { timeout });
}

test("US-001 TC-001-01 Host creates a room", async ({ browser }) => {
  await withBrowserActors(browser, 1, async ([host]) => {
    const code = await createHostRoom(host);
    expect(code).toMatch(/^[A-Z0-9]{6}$/);

    const shareLink = await host.roomPage.shareLink();
    expect(new URL(shareLink).searchParams.get("room")).toBe(code);
    await expectParticipant(host.roomPage, "Maya Chen");
  });
});

test("US-001 TC-001-04 Guest joins by room code", async ({ browser }) => {
  await withBrowserActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await guest.roomPage.goto("/");
    await guest.roomPage.joinRoom(code, "Noah Patel");
    await expect(guest.roomPage.roomView).toBeVisible();

    for (const roomPage of [host.roomPage, guest.roomPage]) {
      await expectParticipant(roomPage, "Maya Chen");
      await expectParticipant(roomPage, "Noah Patel");
    }
  });
});

test("US-001 TC-001-06 Participant list synchronizes within 2 seconds", async ({
  browser,
}) => {
  await withBrowserActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await guest.roomPage.goto("/");
    await guest.roomPage.fillJoinForm(code, "Noah Patel");

    const clickedAt = Date.now();
    await guest.roomPage.joinRoomButton.click();
    await expect(guest.roomPage.roomView).toBeVisible({
      timeout: Math.max(1, 2_000 - (Date.now() - clickedAt)),
    });

    for (const roomPage of [host.roomPage, guest.roomPage]) {
      const remaining = Math.max(1, 2_000 - (Date.now() - clickedAt));
      await expectParticipant(roomPage, "Noah Patel", remaining);
      await expectParticipant(roomPage, "Maya Chen", remaining);
    }
  });
});

test("US-001 TC-001-07 Share link prefills the code and is removed after join", async ({
  browser,
}) => {
  await withBrowserActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    const shareLink = await host.roomPage.shareLink();

    await guest.roomPage.goto(shareLink);
    await expect(guest.roomPage.roomCodeInput).toHaveValue(code);
    await guest.roomPage.guestDisplayName.fill("Noah Patel");
    await guest.roomPage.joinRoomButton.click();
    await expect(guest.roomPage.roomView).toBeVisible();
    await expect
      .poll(() => new URL(guest.page.url()).searchParams.has("room"))
      .toBe(false);
  });
});

test("US-001 TC-001-18 Lowercase room code is normalized", async ({
  browser,
}) => {
  await withBrowserActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await guest.roomPage.goto("/");
    await guest.roomPage.fillJoinForm(code.toLowerCase(), "Noah Patel");
    await expect(guest.roomPage.roomCodeInput).toHaveValue(code);
    await guest.roomPage.joinRoomButton.click();
    await expect(guest.roomPage.roomView).toBeVisible();
  });
});

test("US-001 TC-001-23 Unicode names show normalized in the participant list", async ({
  browser,
}) => {
  await withBrowserActors(browser, 4, async ([hostA, guestA, hostB, guestB]) => {
    const codeA = await createHostRoom(hostA);
    await guestA.roomPage.goto("/");
    await guestA.roomPage.joinRoom(codeA, "Nguyễn Văn");
    await expect(guestA.roomPage.roomView).toBeVisible();
    await expectParticipant(hostA.roomPage, "Nguyễn Văn");
    await expectParticipant(guestA.roomPage, "Nguyễn Văn");

    const codeB = await createHostRoom(hostB);
    await guestB.roomPage.goto("/");
    await guestB.roomPage.joinRoom(codeB, "Nguye\u0302\u0303n Va\u0306n");
    await expect(guestB.roomPage.roomView).toBeVisible();
    await expectParticipant(hostB.roomPage, "Nguyễn Văn");
    await expectParticipant(guestB.roomPage, "Nguyễn Văn");
  });
});

test("US-001 TC-001-29 Leading and trailing spaces are trimmed", async ({
  browser,
}) => {
  await withBrowserActors(browser, 2, async ([host, guest]) => {
    const code = await createHostRoom(host);
    await guest.roomPage.goto("/");
    await guest.roomPage.joinRoom(code, "  Noah Patel  ");
    await expect(guest.roomPage.roomView).toBeVisible();
    await expectParticipant(host.roomPage, "Noah Patel");
  });
});

test("US-001 TC-001-46 Guest joins immediately after the host's room appears", async ({
  browser,
}) => {
  await withBrowserActors(browser, 2, async ([host, guest]) => {
    await guest.roomPage.goto("/");
    await guest.roomPage.guestDisplayName.fill("Noah Patel");

    const code = await createHostRoom(host);
    await guest.roomPage.roomCodeInput.fill(code);
    await guest.roomPage.joinRoomButton.click();
    await expect(guest.roomPage.roomView).toBeVisible();

    for (const roomPage of [host.roomPage, guest.roomPage]) {
      await expectParticipant(roomPage, "Maya Chen");
      await expectParticipant(roomPage, "Noah Patel");
    }
  });
});
