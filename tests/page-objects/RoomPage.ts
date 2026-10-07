import type { Locator, Page } from "@playwright/test";

export class RoomPage {
  readonly hostDisplayName: Locator;
  readonly createRoomButton: Locator;
  readonly createError: Locator;
  readonly roomCodeInput: Locator;
  readonly guestDisplayName: Locator;
  readonly joinRoomButton: Locator;
  readonly joinError: Locator;
  readonly roomView: Locator;
  readonly roomCodeValue: Locator;
  readonly shareLinkLocator: Locator;
  readonly participantList: Locator;
  readonly participantItems: Locator;

  constructor(private readonly page: Page) {
    this.hostDisplayName = page.getByTestId("host-display-name");
    this.createRoomButton = page.getByTestId("create-room");
    this.createError = page.getByTestId("create-error");
    this.roomCodeInput = page.getByTestId("room-code");
    this.guestDisplayName = page.getByTestId("guest-display-name");
    this.joinRoomButton = page.getByTestId("join-room");
    this.joinError = page.getByTestId("join-error");
    this.roomView = page.getByTestId("room-view");
    this.roomCodeValue = page.getByTestId("room-code-value");
    this.shareLinkLocator = page.getByTestId("share-link");
    this.participantList = page.getByTestId("participant-list");
    this.participantItems = page.getByTestId("participant-item");
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async createRoom(name: string): Promise<void> {
    await this.hostDisplayName.fill(name);
    await this.createRoomButton.click();
  }

  async joinRoom(code: string, name: string): Promise<void> {
    await this.fillJoinForm(code, name);
    await this.joinRoomButton.click();
  }

  async fillJoinForm(code: string, name: string): Promise<void> {
    await this.roomCodeInput.fill(code);
    await this.guestDisplayName.fill(name);
  }

  async roomCode(): Promise<string> {
    return (await this.roomCodeValue.innerText()).trim();
  }

  async shareLink(): Promise<string> {
    const href = await this.shareLinkLocator.getAttribute("href");
    if (href === null) {
      throw new Error("Room Share link has no href.");
    }
    return href;
  }

  participantItemsWithText(name: string): Locator {
    return this.participantItems.filter({ hasText: name });
  }
}
