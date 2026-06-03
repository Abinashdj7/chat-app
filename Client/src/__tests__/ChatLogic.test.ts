/// <reference types="@testing-library/jest-dom" />
import { describe, test, expect } from 'vitest'
import {
  getSender,
  getSenderFull,
  isSameSender,
  isLatestMessage,
  isSameUser,
} from '../ChatLogic'
import type { User, Message } from '../types'

const userA: User = { _id: 'a1', name: 'Alice' }

// Minimal message fixture — only the fields ChatLogic actually reads
const msg = (senderId: string) =>
  ({ sender: { _id: senderId } }) as unknown as Message

// getSender ---------------------------------------------------------------

describe('getSender', () => {
  test('returns the other user name in a 1-1 chat', () => {
    const users: User[] = [{ _id: 'a1', name: 'Alice' }, { _id: 'b2', name: 'Bob' }]
    expect(getSender(userA, users)).toBe('Bob')
  })

  test('returns "Bob" even when Bob is first in the array', () => {
    const users: User[] = [{ _id: 'b2', name: 'Bob' }, { _id: 'a1', name: 'Alice' }]
    expect(getSender(userA, users)).toBe('Bob')
  })

  test('returns "Unknown sender" when users array is empty', () => {
    expect(getSender(userA, [])).toBe('Unknown sender')
  })

  test('returns name when users is a single object (not array)', () => {
    expect(getSender(userA, { _id: 'b2', name: 'Bob' })).toBe('Bob')
  })

  test('returns "Unknown sender" when users is null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getSender(userA, null as any)).toBe('Unknown sender')
  })
})

// getSenderFull -----------------------------------------------------------

describe('getSenderFull', () => {
  test('returns the other user object', () => {
    const users: User[] = [{ _id: 'a1', name: 'Alice' }, { _id: 'b2', name: 'Bob' }]
    expect(getSenderFull(userA, users)).toEqual({ _id: 'b2', name: 'Bob' })
  })

  test('returns users[0] when users[0] is not the logged-in user', () => {
    const users: User[] = [{ _id: 'b2', name: 'Bob' }, { _id: 'a1', name: 'Alice' }]
    expect(getSenderFull(userA, users)).toEqual({ _id: 'b2', name: 'Bob' })
  })
})

// isSameSender ------------------------------------------------------------

describe('isSameSender', () => {
  test('returns true when next message is from a different sender and current is not the logged user', () => {
    const messages = [msg('b2'), msg('a1')]
    expect(isSameSender(messages, messages[0], 0, 'a1')).toBe(true)
  })

  test('returns false for the last message in the list', () => {
    const messages = [msg('b2')]
    expect(isSameSender(messages, messages[0], 0, 'a1')).toBe(false)
  })

  test('returns false when current message is from the logged-in user', () => {
    const messages = [msg('a1'), msg('b2')]
    expect(isSameSender(messages, messages[0], 0, 'a1')).toBe(false)
  })
})

// isLatestMessage ---------------------------------------------------------

describe('isLatestMessage', () => {
  test('returns truthy for the last message when it is from someone else', () => {
    const messages = [msg('b2')]
    expect(isLatestMessage(messages, 0, 'a1')).toBeTruthy()
  })

  test('returns false when last message is from the logged-in user', () => {
    const messages = [msg('a1')]
    expect(isLatestMessage(messages, 0, 'a1')).toBeFalsy()
  })

  test('returns false when index is not the last', () => {
    const messages = [msg('b2'), msg('b2')]
    expect(isLatestMessage(messages, 0, 'a1')).toBeFalsy()
  })
})

// isSameUser --------------------------------------------------------------

describe('isSameUser', () => {
  test('returns true when previous message has the same sender', () => {
    const messages = [msg('b2'), msg('b2')]
    expect(isSameUser(messages, messages[1], 1)).toBe(true)
  })

  test('returns false for the first message (no previous)', () => {
    const messages = [msg('b2')]
    expect(isSameUser(messages, messages[0], 0)).toBe(false)
  })

  test('returns false when previous sender is different', () => {
    const messages = [msg('a1'), msg('b2')]
    expect(isSameUser(messages, messages[1], 1)).toBe(false)
  })
})
