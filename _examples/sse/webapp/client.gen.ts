/* eslint-disable */
// webrpc-sse-chat v1.0.0 f3307fcc3621aa9099b8fa02f8bb22dee4263705
// --
// Code generated by webrpc-gen@v0.13.0-dev with ../../ generator. DO NOT EDIT.
//
// webrpc-gen -schema=service.ridl -target=../../ -client -out=./webapp/client.gen.ts

// WebRPC description and code-gen version
export const WebRPCVersion = "v1"

// Schema version of your RIDL schema
export const WebRPCSchemaVersion = "v1.0.0"

// Schema hash generated from your RIDL schema
export const WebRPCSchemaHash = "f3307fcc3621aa9099b8fa02f8bb22dee4263705"

//
// Types
//


export interface Message {
  id: number
  username: string
  text: string
  createdAt: string
}

export interface Chat {
  sendMessage(args: SendMessageArgs, headers?: object, signal?: AbortSignal): Promise<SendMessageReturn>
  subscribeMessages(args: SubscribeMessagesArgs, options: WebrpcStreamOptions<SubscribeMessagesReturn>): Promise<void>
  subscribeUsers(options: WebrpcStreamOptions<SubscribeUsersReturn>): Promise<void>
}

export interface SendMessageArgs {
  username: string
  text: string
}

export interface SendMessageReturn {  
}
export interface SubscribeMessagesArgs {
  username: string
}

export interface SubscribeMessagesReturn {
  message: Message  
}
export interface SubscribeUsersArgs {
}

export interface SubscribeUsersReturn {
  username: string  
}


  
//
// Client
//
export class Chat implements Chat {
  protected hostname: string
  protected fetch: Fetch
  protected path = '/rpc/Chat/'

  constructor(hostname: string, fetch: Fetch) {
    this.hostname = hostname
    this.fetch = (input: RequestInfo, init?: RequestInit) => fetch(input, init)
  }

  private url(name: string): string {
    return this.hostname + this.path + name
  }
  
  sendMessage = (args: SendMessageArgs, headers?: object, signal?: AbortSignal): Promise<SendMessageReturn> => {
    return this.fetch(
      this.url('SendMessage'), createHTTPRequest(args, headers, signal)).then((res) => {
        return buildResponse(res).then(_data => {
          return {}
          })}, (error) => {throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })}
      )
  }
  
  
  subscribeMessages = (args: SubscribeMessagesArgs, options: WebrpcStreamOptions<SubscribeMessagesReturn>): Promise<void> => {
    const _fetch = () => this.fetch(this.url("SubscribeMessages"),createHTTPRequest(args, options.headers, options.signal)
      ).then(async (res) => {
        await sseResponse(res, options, _fetch);
    }, (error) => {
      options.onError(error, _fetch);
    });
    return _fetch();
  }
  
  subscribeUsers = (options: WebrpcStreamOptions<SubscribeUsersReturn>): Promise<void> => {
    const _fetch = () => this.fetch(this.url("SubscribeMessages"),createHTTPRequest({}, options.headers, options.signal)
      ).then(async (res) => {
        await sseResponse(res, options, _fetch);
    }, (error) => {
      options.onError(error, _fetch);
    });
    return _fetch();
  }
  
}
  const createHTTPRequest = (body: object = {}, headers: object = {}, signal: AbortSignal | null = null): object => {
  return {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
    signal
  }
}

const buildResponse = (res: Response): Promise<any> => {
  return res.text().then(text => {
    let data
    try {
      data = JSON.parse(text)
    } catch(error) {
      let message = ''
      if (error instanceof Error)  {
        message = error.message
      }
      throw WebrpcBadResponseError.new({
        status: res.status,
        cause: `JSON.parse(): ${message}: response text: ${text}`},
      )
    }
    if (!res.ok) {
      const code: number = (typeof data.code === 'number') ? data.code : 0
      throw (webrpcErrorByCode[code] || WebrpcError).new(data)
    }
    return data
  })
}

//
// Errors
//

export class WebrpcError extends Error {
  name: string
  code: number
  message: string
  status: number
  cause?: string

  /** @deprecated Use message instead of msg. Deprecated in webrpc v0.11.0. */
  msg: string

  constructor(name: string, code: number, message: string, status: number, cause?: string) {
    super(message)
    this.name = name || 'WebrpcError'
    this.code = typeof code === 'number' ? code : 0
    this.message = message || `endpoint error ${this.code}`
    this.msg = this.message
    this.status = typeof status === 'number' ? status : 0
    this.cause = cause
    Object.setPrototypeOf(this, WebrpcError.prototype)
  }

  static new(payload: any): WebrpcError {
    return new this(payload.error, payload.code, payload.message || payload.msg, payload.status, payload.cause)
  }
}

// Webrpc errors

export class WebrpcEndpointError extends WebrpcError {
  constructor(
    name: string = 'WebrpcEndpoint',
    code: number = 0,
    message: string = 'endpoint error',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcEndpointError.prototype)
  }
}

export class WebrpcRequestFailedError extends WebrpcError {
  constructor(
    name: string = 'WebrpcRequestFailed',
    code: number = -1,
    message: string = 'request failed',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcRequestFailedError.prototype)
  }
}

export class WebrpcBadRouteError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadRoute',
    code: number = -2,
    message: string = 'bad route',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadRouteError.prototype)
  }
}

export class WebrpcBadMethodError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadMethod',
    code: number = -3,
    message: string = 'bad method',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadMethodError.prototype)
  }
}

export class WebrpcBadRequestError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadRequest',
    code: number = -4,
    message: string = 'bad request',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadRequestError.prototype)
  }
}

export class WebrpcBadResponseError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadResponse',
    code: number = -5,
    message: string = 'bad response',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadResponseError.prototype)
  }
}

export class WebrpcServerPanicError extends WebrpcError {
  constructor(
    name: string = 'WebrpcServerPanic',
    code: number = -6,
    message: string = 'server panic',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcServerPanicError.prototype)
  }
}

export class WebrpcInternalErrorError extends WebrpcError {
  constructor(
    name: string = 'WebrpcInternalError',
    code: number = -7,
    message: string = 'internal error',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcInternalErrorError.prototype)
  }
}


// Schema errors

export class EmptyUsernameError extends WebrpcError {
  constructor(
    name: string = 'EmptyUsername',
    code: number = 100,
    message: string = 'Username must be provided.',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, EmptyUsernameError.prototype)
  }
}


export enum errors {
  WebrpcEndpoint = 'WebrpcEndpoint',
  WebrpcRequestFailed = 'WebrpcRequestFailed',
  WebrpcBadRoute = 'WebrpcBadRoute',
  WebrpcBadMethod = 'WebrpcBadMethod',
  WebrpcBadRequest = 'WebrpcBadRequest',
  WebrpcBadResponse = 'WebrpcBadResponse',
  WebrpcServerPanic = 'WebrpcServerPanic',
  WebrpcInternalError = 'WebrpcInternalError',
  EmptyUsername = 'EmptyUsername',
}

const webrpcErrorByCode: { [code: number]: any } = {
  [0]: WebrpcEndpointError,
  [-1]: WebrpcRequestFailedError,
  [-2]: WebrpcBadRouteError,
  [-3]: WebrpcBadMethodError,
  [-4]: WebrpcBadRequestError,
  [-5]: WebrpcBadResponseError,
  [-6]: WebrpcServerPanicError,
  [-7]: WebrpcInternalErrorError,
  [100]: EmptyUsernameError,
}

export type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>

export interface WebrpcStreamOptions<T> extends WebrpcOptions {
  onMessage: (message: T) => void;
  onError: (error: WebrpcError, reconnect: () => void) => void;
  onOpen?: () => void;
  onClose?: () => void;
}
export interface WebrpcOptions {
  headers?: HeadersInit;
  signal?: AbortSignal;
}

