import type { User, Message } from "./types";

export const getSenderFull = (loggedUser: User, users: User[]): User =>
  users[0]._id === loggedUser._id ? users[1] : users[0];

export const getSender = (loggedUser: User | null, users: User[] | User): string => {
  if (Array.isArray(users)) {
    const other = users.find((u) => u._id !== loggedUser?._id);
    return other?.name ?? "Unknown sender";
  }
  return users.name ?? "Unknown sender";
};

export const isSameSender = (
  messages: Message[], m: Message, i: number, userId: string | undefined
): boolean =>
  i < messages.length - 1 &&
  (messages[i + 1].sender._id !== m.sender._id || messages[i + 1].sender._id === undefined) &&
  messages[i].sender._id !== userId;

export const isLatestMessage = (
  messages: Message[], i: number, userId: string | undefined
): boolean =>
  i === messages.length - 1 &&
  messages[messages.length - 1].sender._id !== userId &&
  Boolean(messages[messages.length - 1].sender._id);

export const isSameSenderMargin = (
  messages: Message[], m: Message, i: number, userId: string | undefined
): number | string =>
  i < messages.length - 1 &&
  messages[i + 1].sender._id === m.sender._id &&
  messages[i].sender._id !== userId
    ? 33
    : "auto";

export const isSameUser = (messages: Message[], m: Message, i: number): boolean =>
  i > 0 && messages[i - 1].sender._id === m.sender._id;
