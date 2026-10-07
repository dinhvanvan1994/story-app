// Infrastructure spike for the Supabase Realtime Broadcast assumptions in D-003.
// Run with: node --env-file=.env.local spikes/broadcast-spike.mjs

import { randomBytes } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
const missing = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((name) => !process.env[name])

if (missing.length > 0) {
  console.error(`Missing environment variable(s): ${missing.join(', ')}. Fill .env.local first.`)
  process.exit(2)
}

const realtime = {}
if (typeof WebSocket === 'undefined') {
  try {
    realtime.transport = (await import('ws')).default
  } catch {
    console.error('This Node version has no WebSocket. Install ws as a devDependency: npm install --save-dev ws')
    process.exit(2)
  }
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const randomCode = () => {
  const bytes = randomBytes(6)
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

const code = randomCode()
const topic = `room:${code}`
const hint = 'Check Supabase Realtime settings: public channel access must be allowed'
const checks = []
const clients = []
let host
let guest
let guest2
let guestJoinError
let guest2JoinError
let replyError

const safeMessage = (error) => String(error?.message ?? error).replaceAll(key, '[redacted]')
const elapsedMs = (start) => Math.round(performance.now() - start)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function record(id, name, passed, detail) {
  checks.push({ id, name, passed, detail })
  console.log(`${passed ? 'PASS' : 'FAIL'} ${id} ${name}: ${detail}`)
}

async function run(id, name, test) {
  const start = performance.now()
  try {
    const detail = await test()
    record(id, name, true, detail)
  } catch (error) {
    record(id, name, false, `${safeMessage(error)} (${elapsedMs(start)} ms)`)
  }
}

function createRealtimeClient() {
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime,
  })
  clients.push(client)
  return client
}

function createParticipant(client, channelTopic) {
  const participant = { client, channel: null, inbox: [], listeners: [] }
  participant.channel = client.channel(channelTopic)
  for (const event of ['room:intent', 'room:state']) {
    participant.channel.on('broadcast', { event }, (message) => {
      participant.inbox.push({ event, message, at: performance.now() })
      for (const listener of [...participant.listeners]) listener()
    })
  }
  return participant
}

async function subscribe(participant, timeoutMs = 5000) {
  const start = performance.now()
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no SUBSCRIBED status within ${timeoutMs} ms`)), timeoutMs)
    participant.channel.subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(timer)
        resolve()
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        clearTimeout(timer)
        const failure = new Error(`${status}${error?.message ? `: ${error.message}` : ''}`)
        failure.status = status
        reject(failure)
      }
    })
  })
  return elapsedMs(start)
}

async function send(participant, event, payload) {
  const result = await participant.channel.send({ type: 'broadcast', event, payload })
  if (result !== 'ok') throw new Error(`channel.send returned ${result}`)
}

function waitFor(participant, predicate, timeoutMs, timeoutDetail) {
  const existing = predicate(participant.inbox)
  if (existing) return Promise.resolve(existing)

  return new Promise((resolve, reject) => {
    const onMessage = () => {
      const matched = predicate(participant.inbox)
      if (!matched) return
      clearTimeout(timer)
      participant.listeners = participant.listeners.filter((listener) => listener !== onMessage)
      resolve(matched)
    }
    const timer = setTimeout(() => {
      participant.listeners = participant.listeners.filter((listener) => listener !== onMessage)
      reject(new Error(timeoutDetail?.() ?? `no matching broadcast within ${timeoutMs} ms`))
    }, timeoutMs)
    participant.listeners.push(onMessage)
  })
}

const findMessage = (participant, event, requestId) =>
  participant.inbox.find(
    ({ event: receivedEvent, message }) =>
      receivedEvent === event &&
      (message.payload?.requestId === requestId || message.payload?.intent?.requestId === requestId),
  )

function joinIntent(requestId, extra = {}) {
  return {
    intent: {
      type: 'join',
      requestId,
      participantId: 'guest',
      displayName: 'Spike Guest',
      ...extra,
    },
  }
}

try {
  const hostClient = createRealtimeClient()
  const guestClient = createRealtimeClient()
  const guest2Client = createRealtimeClient()

  await run('C1', 'host subscribes within 5000 ms', async () => {
    const participant = createParticipant(hostClient, topic)
    const subscribedIn = await subscribe(participant)
    host = participant
    return `SUBSCRIBED in ${subscribedIn} ms on ${topic}`
  })
  const c1 = checks.find((check) => check.id === 'C1')
  if (!c1.passed && /CHANNEL_ERROR|TIMED_OUT/.test(c1.detail)) console.log(hint)

  await run('C2', 'guest on unused code gets no reply within 5000 ms', async () => {
    let unusedCode = randomCode()
    while (unusedCode === code) unusedCode = randomCode()
    const unusedClient = createRealtimeClient()
    const unused = createParticipant(unusedClient, `room:${unusedCode}`)
    const subscribedIn = await subscribe(unused)
    await send(unused, 'room:intent', joinIntent('no-host'))
    await delay(5000)
    const replies = unused.inbox.length
    if (replies > 0) throw new Error(`received ${replies} unexpected broadcast(s)`)
    return `SUBSCRIBED in ${subscribedIn} ms; received 0 broadcasts in 5000 ms`
  })

  if (host) {
    try {
      guest = createParticipant(guestClient, topic)
      const subscribedIn = await subscribe(guest)
      console.log(`INFO guest SUBSCRIBED in ${subscribedIn} ms`)
    } catch (error) {
      guestJoinError = safeMessage(error)
    }
    try {
      guest2 = createParticipant(guest2Client, topic)
      const subscribedIn = await subscribe(guest2)
      console.log(`INFO guest2 SUBSCRIBED in ${subscribedIn} ms`)
    } catch (error) {
      guest2JoinError = safeMessage(error)
    }
  }

  if (host && guest) {
    host.listeners.push(() => {
      for (const received of host.inbox) {
        const requestId = received.message.payload?.intent?.requestId
        if (received.event !== 'room:intent' || !requestId?.startsWith('rt-') || received.replied) continue
        received.replied = true
        send(host, 'room:state', {
          requestId,
          view: { roomCode: code, hostParticipantId: 'host', participants: [] },
        }).catch((error) => {
          replyError = safeMessage(error)
          for (const listener of [...guest.listeners]) listener()
        })
      }
    })
  }

  await run('C3', '10 guest-host round trips have max under 2000 ms', async () => {
    if (!host || !guest) throw new Error(`host/guest not subscribed${guestJoinError ? `: ${guestJoinError}` : ''}`)
    const timings = []
    for (let index = 1; index <= 10; index += 1) {
      const requestId = `rt-${index}`
      const start = performance.now()
      await send(guest, 'room:intent', joinIntent(requestId))
      const reply = await waitFor(
        guest,
        (inbox) => findMessage(guest, 'room:state', requestId),
        5000,
        () => (replyError ? `host reply failed: ${replyError}` : `no matching broadcast within 5000 ms`),
      )
      timings.push(Math.round(reply.at - start))
    }
    const sorted = [...timings].sort((left, right) => left - right)
    const median = (sorted[4] + sorted[5]) / 2
    const detail = `min ${sorted[0]} ms, median ${median} ms, max ${sorted[9]} ms`
    if (sorted[9] >= 2000) throw new Error(detail)
    return detail
  })

  await run('C4', 'sender does not receive its own broadcast', async () => {
    if (!host || !guest) throw new Error(`host/guest not subscribed${guestJoinError ? `: ${guestJoinError}` : ''}`)
    const requestId = 'echo-check'
    const start = performance.now()
    await send(host, 'room:state', { requestId, view: { roomCode: code } })
    await waitFor(guest, (inbox) => findMessage(guest, 'room:state', requestId), 5000)
    await delay(1000)
    if (findMessage(host, 'room:state', requestId)) throw new Error('host received its own broadcast')
    return `guest received it; host did not after ${elapsedMs(start)} ms`
  })

  await run('C5', '10 back-to-back intents arrive complete and in order', async () => {
    if (!host || !guest) throw new Error(`host/guest not subscribed${guestJoinError ? `: ${guestJoinError}` : ''}`)
    const start = performance.now()
    await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        send(guest, 'room:intent', joinIntent(`seq-${index + 1}`, { sequence: index + 1 })),
      ),
    )
    const messages = await waitFor(
      host,
      (inbox) => {
        const matching = inbox.filter(
          ({ event, message }) =>
            event === 'room:intent' && message.payload?.intent?.requestId?.startsWith('seq-'),
        )
        return matching.length >= 10 ? matching.slice(0, 10) : null
      },
      5000,
    )
    const sequence = messages.map(({ message }) => message.payload.intent.sequence)
    if (sequence.some((value, index) => value !== index + 1)) {
      throw new Error(`received sequence ${sequence.join(',')}`)
    }
    return `received ${sequence.join(',')} in ${elapsedMs(start)} ms`
  })

  await run('C6', 'guest and guest2 intents both reach host', async () => {
    if (!host || !guest || !guest2) {
      throw new Error(`host/guest/guest2 not subscribed${guest2JoinError ? `: ${guest2JoinError}` : ''}`)
    }
    const start = performance.now()
    await Promise.all([
      send(guest, 'room:intent', joinIntent('sim-guest', { participantId: 'guest-1' })),
      send(guest2, 'room:intent', joinIntent('sim-guest2', { participantId: 'guest-2' })),
    ])
    await Promise.all([
      waitFor(host, (inbox) => findMessage(host, 'room:intent', 'sim-guest'), 5000),
      waitFor(host, (inbox) => findMessage(host, 'room:intent', 'sim-guest2'), 5000),
    ])
    return `host received both in ${elapsedMs(start)} ms`
  })

  await run('C7', 'handler keys and unchanged payload shape', async () => {
    if (!host || !guest) throw new Error(`host/guest not subscribed${guestJoinError ? `: ${guestJoinError}` : ''}`)
    const payload = joinIntent('shape-check', { displayName: 'Nguyễn Văn' })
    await send(guest, 'room:intent', payload)
    const received = await waitFor(host, (inbox) => findMessage(host, 'room:intent', 'shape-check'), 5000)
    const keys = Object.keys(received.message)
    const expectedKeys = ['type', 'event', 'payload']
    const detail = `handler keys: [${keys.join(', ')}]; sent payload unchanged under payload`
    if (
      keys.length !== expectedKeys.length ||
      !expectedKeys.every((expectedKey) => keys.includes(expectedKey))
    ) {
      throw new Error(`${detail}; expected keys [${expectedKeys.join(', ')}]`)
    }
    if (!isDeepStrictEqual(received.message.payload, payload)) throw new Error(`${detail}; payload differs`)
    return detail
  })

  await run('C8', 'guest message does not call host handler after removeChannel', async () => {
    if (!host || !guest) throw new Error(`host/guest not subscribed${guestJoinError ? `: ${guestJoinError}` : ''}`)
    const removed = await host.client.removeChannel(host.channel)
    if (removed !== 'ok') throw new Error(`removeChannel returned ${removed}`)
    const before = host.inbox.length
    const start = performance.now()
    await send(guest, 'room:intent', joinIntent('after-remove'))
    await delay(2000)
    if (host.inbox.length !== before) throw new Error('host handler received a message after removeChannel')
    return `host handler not called during ${elapsedMs(start)} ms after removeChannel`
  })
} finally {
  const cleanupErrors = []
  for (const client of clients) {
    try {
      await client.removeAllChannels()
    } catch (error) {
      cleanupErrors.push(safeMessage(error))
    }
  }
  if (cleanupErrors.length > 0) console.error(`Cleanup error(s): ${cleanupErrors.join('; ')}`)
}

for (const id of ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']) {
  if (!checks.some((check) => check.id === id)) record(id, 'not run', false, 'prerequisite check failed')
}

console.log('\nSummary')
console.table(checks.map(({ id, passed, name }) => ({ check: id, result: passed ? 'PASS' : 'FAIL', name })))
process.exit(checks.every((check) => check.passed) ? 0 : 1)
