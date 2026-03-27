"use client";

export type LearnerFriendshipState =
  | "ready"
  | "loading"
  | "sending"
  | "requested"
  | "incoming-request"
  | "connected"
  | "unavailable";

export interface LearnerFriendshipAction {
  label: string;
  helperText: string;
  disabled: boolean;
  loading: boolean;
}

export function getLearnerFriendshipAction(
  friendshipState: LearnerFriendshipState,
): LearnerFriendshipAction {
  switch (friendshipState) {
    case "loading":
      return {
        label: "Checking...",
        helperText: "Loading your friend request status.",
        disabled: true,
        loading: true,
      };
    case "sending":
      return {
        label: "Sending...",
        helperText: "Submitting your friend request now.",
        disabled: true,
        loading: true,
      };
    case "requested":
      return {
        label: "Requested",
        helperText: "A pending friend request is already waiting.",
        disabled: true,
        loading: false,
      };
    case "incoming-request":
      return {
        label: "Respond Below",
        helperText: "This learner already sent you a request.",
        disabled: true,
        loading: false,
      };
    case "connected":
      return {
        label: "Connected",
        helperText: "You already have an active friendship here.",
        disabled: true,
        loading: false,
      };
    case "unavailable":
      return {
        label: "Unavailable",
        helperText: "Refresh the page if friend actions are unavailable.",
        disabled: true,
        loading: false,
      };
    case "ready":
    default:
      return {
        label: "Add Friend",
        helperText: "Send a friend request from the learner directory.",
        disabled: false,
        loading: false,
      };
  }
}
