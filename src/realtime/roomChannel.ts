import type { RealtimeChannelSendResponse } from "@supabase/supabase-js";
import {
  isRoomIntentPayload,
  isRoomRejectedPayload,
  isRoomStatePayload,
} from "../domain/messageGuards";
import { supabaseClient } from "../lib/supabaseClient";
import type {
  JoinIntent,
  PublicView,
  RoomIntentPayload,
  RoomRejectedPayload,
  RoomStatePayload,
} from "../types/room";

export interface RoomChannelHandlers {
  onIntent: (payload: RoomIntentPayload) => void;
  onState: (payload: RoomStatePayload) => void;
  onRejected: (payload: RoomRejectedPayload) => void;
  onStatus: (status: string, error?: Error) => void;
}

export interface RoomChannel {
  sendIntent: (intent: JoinIntent) => Promise<RealtimeChannelSendResponse>;
  sendState: (
    view: PublicView,
    requestId?: string,
  ) => Promise<RealtimeChannelSendResponse>;
  sendRejected: (
    rejection: RoomRejectedPayload,
  ) => Promise<RealtimeChannelSendResponse>;
  close: () => Promise<void>;
}

export function openRoomChannel(
  roomCode: string,
  handlers: RoomChannelHandlers,
): RoomChannel {
  const channel = supabaseClient.channel(`room:${roomCode}`, {
    config: { broadcast: { self: false } },
  });

  channel
    .on("broadcast", { event: "room:intent" }, ({ payload }) => {
      if (isRoomIntentPayload(payload)) {
        handlers.onIntent(payload);
      }
    })
    .on("broadcast", { event: "room:state" }, ({ payload }) => {
      if (isRoomStatePayload(payload)) {
        handlers.onState(payload);
      }
    })
    .on("broadcast", { event: "room:rejected" }, ({ payload }) => {
      if (isRoomRejectedPayload(payload)) {
        handlers.onRejected(payload);
      }
    })
    .subscribe((status, error) => {
      handlers.onStatus(status, error);
    });

  return {
    sendIntent: (intent) =>
      channel.send({
        type: "broadcast",
        event: "room:intent",
        payload: { intent } satisfies RoomIntentPayload,
      }),
    sendState: (view, requestId) =>
      channel.send({
        type: "broadcast",
        event: "room:state",
        payload: {
          ...(requestId === undefined ? {} : { requestId }),
          view,
        } satisfies RoomStatePayload,
      }),
    sendRejected: (rejection) =>
      channel.send({
        type: "broadcast",
        event: "room:rejected",
        payload: rejection,
      }),
    close: async () => {
      await supabaseClient.removeChannel(channel);
    },
  };
}
