/* eslint-disable */
// webrpc-sse-chat v1.0.0 f3307fcc3621aa9099b8fa02f8bb22dee4263705
// --
// Code generated by webrpc-gen@v0.14.0 with ../../ generator. DO NOT EDIT.
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
    this.hostname = hostname.replace(/\/*$/, '')
    this.fetch = (input: RequestInfo, init?: RequestInit) => fetch(input, init)
  }

  private url(name: string): string {
    return this.hostname + this.path + name
  }
  
  sendMessage = (args: SendMessageArgs, headers?: object, signal?: AbortSignal): Promise<SendMessageReturn> => {
    return this.fetch(
      this.url('SendMessage'),
      createHTTPRequest(args, headers, signal)).then((res) => {
      return buildResponse(res).then(_data => {
        return {}
      })
    }, (error) => {
      throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })
    })
  }
  
  subscribeMessages = (args: SubscribeMessagesArgs, options: WebrpcStreamOptions<SubscribeMessagesReturn>): Promise<void> => {
    const _fetch = () => this.fetch(this.url('SubscribeMessages'),createHTTPRequest(args, options.headers, options.signal)
      ).then(async (res) => {
        await sseResponse(res, options, _fetch);
    }, (error) => {
      options.onError(error, _fetch);
    });
    return _fetch();
  }
  subscribeUsers = (options: WebrpcStreamOptions<SubscribeUsersReturn>): Promise<void> => {
    const _fetch = () => this.fetch(this.url('SubscribeUsers'),createHTTPRequest({}, options.headers, options.signal)
      ).then(async (res) => {
        await sseResponse(res, options, _fetch);
    }, (error) => {
      options.onError(error, _fetch);
    });
    return _fetch();
  }
}
  
const sseResponse = async (
    res: Response,
    options: WebrpcStreamOptions<any>,
    retryFetch: () => Promise<void>
) => {
    const {onMessage, onOpen, onClose, onError} = options;

    if (!res.ok) {
        try {
            await buildResponse(res);
        } catch (error) {
            // @ts-ignore
            onError(error, retryFetch);
        }
        return;
    }

    if (!res.body) {
        onError(
            WebrpcBadResponseError.new({
                status: res.status,
                cause: "Invalid response, missing body",
            }),
            retryFetch
        );
        return;
    }

    onOpen && onOpen();

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let lastReadTime = Date.now();
    const timeout = (10 + 1) * 1000;
    let intervalId: any;

    try {
        intervalId = setInterval(() => {
            if (Date.now() - lastReadTime > timeout) {
                throw WebrpcStreamLostError.new({cause: "Stream timed out"});
            }
        }, timeout);

        while (true) {
            let value;
            let done;
            try {
                ({value, done} = await reader.read());
                lastReadTime = Date.now();
                buffer += decoder.decode(value, {stream: true});
            } catch (error) {
                let message = "";
                if (error instanceof Error) {
                    message = error.message;
                }

                if (error instanceof DOMException && error.name === "AbortError") {
                    onError(
                        WebrpcRequestFailedError.new({
                            message: "AbortError",
                            cause: `AbortError: ${message}`,
                        }),
                        () => {
                            throw new Error("Abort signal cannot be used to reconnect");
                        }
                    );
                } else {
                    onError(
                        WebrpcStreamLostError.new({
                            cause: `reader.read(): ${message}`,
                        }),
                        retryFetch
                    );
                }
                return;
            }

            let lines = buffer.split("\n");
            for (let i = 0; i < lines.length - 1; i++) {
                if (lines[i].length == 0) {
                    continue;
                }
                let data: any;
                try {
                    data = JSON.parse(lines[i]);
                    if (data.hasOwnProperty("webrpcError")) {
                        const error = data.webrpcError;
                        const code: number =
                            typeof error.code === "number" ? error.code : 0;
                        onError(
                            (webrpcErrorByCode[code] || WebrpcError).new(error),
                            retryFetch
                        );
                        return;
                    }
                } catch (error) {
                    if (
                        error instanceof Error &&
                        error.message === "Abort signal cannot be used to reconnect"
                    ) {
                        throw error;
                    }
                    onError(
                        WebrpcBadResponseError.new({
                            status: res.status,
                            // @ts-ignore
                            cause: `JSON.parse(): ${error.message}`,
                        }),
                        retryFetch
                    );
                }
                onMessage(data);
            }

            if (!done) {
                buffer = lines[lines.length - 1];
                continue;
            }

            onClose && onClose();
            return;
        }
    } catch (error) {
        // @ts-ignore
        if (error instanceof WebrpcStreamLostError) {
            onError(error, retryFetch);
        } else {
            throw error;
        }
    } finally {
        clearInterval(intervalId);
    }
};



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

export class WebrpcClientDisconnectedError extends WebrpcError {
  constructor(
    name: string = 'WebrpcClientDisconnected',
    code: number = -8,
    message: string = 'client disconnected',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcClientDisconnectedError.prototype)
  }
}

export class WebrpcStreamLostError extends WebrpcError {
  constructor(
    name: string = 'WebrpcStreamLost',
    code: number = -9,
    message: string = 'stream lost',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcStreamLostError.prototype)
  }
}

export class WebrpcStreamFinishedError extends WebrpcError {
  constructor(
    name: string = 'WebrpcStreamFinished',
    code: number = -10,
    message: string = 'stream finished',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcStreamFinishedError.prototype)
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
  WebrpcClientDisconnected = 'WebrpcClientDisconnected',
  WebrpcStreamLost = 'WebrpcStreamLost',
  WebrpcStreamFinished = 'WebrpcStreamFinished',
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
  [-8]: WebrpcClientDisconnectedError,
  [-9]: WebrpcStreamLostError,
  [-10]: WebrpcStreamFinishedError,
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

