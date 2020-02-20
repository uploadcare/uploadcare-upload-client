import WebSocket from '../tools/sockets.node'

import { FileInfo } from '../api/types'
import { Status } from '../api/fromUrlStatus'
import { Events } from './events'

type AllStatuses =
  | StatusErrorResponse
  | StatusProgressResponse
  | StatusSuccessResponse

type StatusProgressResponse = {
  status: Status.Progress
  done: number
  total: number
}

type StatusErrorResponse = {
  status: Status.Error
  msg: string
  url: string
}

type StatusSuccessResponse = {
  status: Status.Success
} & FileInfo

const response = (
  type: 'progress' | 'success' | 'fail',
  data: any
): AllStatuses => {
  if (type === 'success') {
    return { status: Status.Success, ...data } as StatusSuccessResponse
  }

  if (type === 'progress') {
    return { status: Status.Progress, ...data } as StatusProgressResponse
  }

  return { status: Status.Error, ...data } as StatusErrorResponse
}

const key = '79ae88bd931ea68464d9'
const protocol =
  typeof window !== 'undefined' && document.location.protocol !== 'https:'
    ? 'ws:/'
    : 'wss://'

const port = protocol === 'wss://' ? 443 : 80

const pusherUrl = `${protocol}ws.pusherapp.com:${port}/app/${key}?protocol=5&client=js&version=1.12.2`

type Message = {
  event: string
  data: { channel: string }
}

type EventTypes = {
  [key: string]: AllStatuses
} & {
  connected: undefined
} & {
  error: Error
}

class Pusher {
  ws: WebSocket | undefined = undefined
  queue: Message[] = []
  isConnected = false
  subscribers = 0
  emmitter: Events<EventTypes> = new Events()

  connect(): void {
    if (!this.isConnected && !this.ws) {
      this.ws = new WebSocket(pusherUrl)

      this.ws.addEventListener('error', error => {
        this.emmitter.emit('error', new Error(error.message))
      })

      this.emmitter.on('connected', () => {
        this.isConnected = true
        this.queue.forEach(message => this.send(message))
        this.queue = []
      })

      this.ws.addEventListener('message', e => {
        const data = JSON.parse(e.data)

        switch (data.event) {
          case 'pusher:connection_established': {
            this.emmitter.emit('connected', undefined)
            break
          }

          case 'progress':
          case 'success':
          case 'fail': {
            this.emmitter.emit<string>(
              data.channel,
              response(data.event, JSON.parse(data.data))
            )
          }
        }
      })
    }
  }

  send(data: { event: string; data: { channel: string } }): void {
    const str = JSON.stringify(data)
    // console.log('send: ')
    // console.log('  ', str)

    this.ws?.send(str)
  }

  subscribe(token: string, handler: (data: AllStatuses) => void): void {
    this.subscribers += 1
    this.connect()

    const channel = `task-status-${token}`
    const message = {
      event: 'pusher:subscribe',
      data: { channel }
    }

    this.emmitter.on(channel, handler)
    if (this.isConnected) {
      this.send(message)
    } else {
      this.queue.push(message)
    }
  }

  unsubscribe(token: string): void {
    this.subscribers -= 1

    const channel = `task-status-${token}`
    const message = {
      event: 'pusher:unsubscribe',
      data: { channel }
    }

    this.emmitter.off(channel)
    if (this.isConnected) {
      this.send(message)
    } else {
      this.queue = this.queue.filter(msg => msg.data.channel !== channel)
    }

    if (this.subscribers === 0) {
      this.ws?.close()
      this.ws = undefined
      this.isConnected = false
    }
  }

  error(callback: (error: Error) => void): void {
    const handler = (error: Error): void => {
      callback(error)

      this.emmitter.off('error', handler)
    }
    this.emmitter.on('error', handler)
  }
}

export default Pusher
