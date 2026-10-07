import type { Locator, Page } from "@playwright/test";
import type { VoteValue } from "../../src/types/room";

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
  readonly storyTitle: Locator;
  readonly startStoryButton: Locator;
  readonly currentStoryTitle: Locator;
  readonly roomPhase: Locator;
  readonly card0: Locator;
  readonly card1: Locator;
  readonly card2: Locator;
  readonly card3: Locator;
  readonly card5: Locator;
  readonly card8: Locator;
  readonly card13: Locator;
  readonly card21: Locator;
  readonly cardQuestion: Locator;
  readonly revealVotesButton: Locator;
  readonly revealError: Locator;
  readonly nextStoryButton: Locator;
  readonly participantVoteStatuses: Locator;

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
    this.storyTitle = page.getByTestId("story-title");
    this.startStoryButton = page.getByTestId("start-story");
    this.currentStoryTitle = page.getByTestId("current-story-title");
    this.roomPhase = page.getByTestId("room-phase");
    this.card0 = page.getByTestId("card-0");
    this.card1 = page.getByTestId("card-1");
    this.card2 = page.getByTestId("card-2");
    this.card3 = page.getByTestId("card-3");
    this.card5 = page.getByTestId("card-5");
    this.card8 = page.getByTestId("card-8");
    this.card13 = page.getByTestId("card-13");
    this.card21 = page.getByTestId("card-21");
    this.cardQuestion = page.getByTestId("card-question");
    this.revealVotesButton = page.getByTestId("reveal-votes");
    this.revealError = page.getByTestId("reveal-error");
    this.nextStoryButton = page.getByTestId("next-story");
    this.participantVoteStatuses = page.getByTestId("participant-vote-status");
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

  async startStory(title: string): Promise<void> {
    await this.storyTitle.fill(title);
    await this.startStoryButton.click();
  }

  async chooseCard(value: VoteValue): Promise<void> {
    const locators: Partial<Record<VoteValue, Locator>> = {
      "0": this.card0,
      "1": this.card1,
      "2": this.card2,
      "3": this.card3,
      "5": this.card5,
      "8": this.card8,
      "13": this.card13,
      "21": this.card21,
      "?": this.cardQuestion,
    };
    const card = locators[value];
    if (card === undefined) {
      throw new Error(`No Card locator is configured for value ${value}.`);
    }
    await card.click();
  }

  async revealVotes(): Promise<void> {
    await this.revealVotesButton.click();
  }

  async nextStory(): Promise<void> {
    await this.nextStoryButton.click();
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

  participantVoteStatus(name: string): Locator {
    return this.participantVoteStatuses.filter({ hasText: name });
  }
}
