export type SerializedRequest = {
  url: string
  method: string
  headers: Record<string, string>
  body: any
}

export function strToArrayBuffer(str: string): ArrayBuffer {
  try {
    const encoder = new TextEncoder()
    const uint8Array = encoder.encode(str)
    return uint8Array.buffer as ArrayBuffer
  } catch (error) {
    console.error('Error converting JSON to ArrayBuffer:', error)
    throw error
  }
}

export function arrayBufferToStr(arrayBuffer: ArrayBuffer): string {
  try {
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(arrayBuffer)
  } catch (error) {
    console.error('Error converting ArrayBuffer to JSON:', error)
    throw error
  }
}

function readableStream() {
  return {
    serialize: async (stream: ReadableStream) => {
      const reader = stream.getReader()
      let chunk = await reader.read()
      let result = []
      while (!chunk.done) {
        result.push(chunk.value)
        chunk = await reader.read()
      }
      return {
        type: 'readable-stream',
        value: result,
      }
    },
    deserialize: async (value: any) => {
      if (value.type === 'readable-stream') {
        return new ReadableStream({
          start: (controller) => {
            for (const chunk of value.value) {
              controller.enqueue(chunk)
            }
            controller.close()
          },
        })
      }
      return value
    },
  }
}

function arrayBuffer() {
  return {
    serialize: async (req: Request | Response) => {
      try {
        return {
          type: 'array-buffer',
          value: arrayBufferToStr(await req.clone().arrayBuffer()),
        }
      } catch {
        return req.body
      }
    },
    deserialize: async (value: any) => {
      if (value.type === 'array-buffer') {
        return strToArrayBuffer(value.value)
      }
      return value
    },
  }
}

async function serializeBody(req: Request | Response) {
  if (req.body === null) {
    return null
  }
  const contentType = req.headers.get('Content-Type')
  if (contentType?.includes('application/json')) {
    return {
      type: 'json',
      value: await req.json(),
    }
  }
  if (contentType?.includes('text/plain')) {
    return {
      type: 'text',
      value: await req.text(),
    }
  }
  if (contentType?.includes('multipart/form-data')) {
    return {
      type: 'form-data',
      value: Object.fromEntries(await req.formData()),
    }
  }
  const b = await arrayBuffer().serialize(req)
  if (b !== null) {
    return b
  }
  if (req.body instanceof ReadableStream) {
    return await readableStream().serialize(req.body)
  }
  console.error('Serialize unsupported body type', req.body)
  throw new Error('Serialize unsupported body type')
}

function jsonClone(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

export async function serializeRequest(
  req: Request,
): Promise<SerializedRequest> {
  return jsonClone({
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    body: await serializeBody(req),
  })
}

function deserializeBody(body: any) {
  if (body === null) {
    return null
  }
  if (body.type === 'json') {
    return JSON.stringify(body.value)
  }
  if (body.type === 'text') {
    return body.value
  }
  if (body.type === 'form-data') {
    const fd = new FormData()
    for (const [key, value] of Object.entries(body.value)) {
      fd.append(key, value as string)
    }
    return fd
  }
  if (body.type === 'readable-stream') {
    return readableStream().deserialize(body.value)
  }
  if (body.type === 'array-buffer') {
    return arrayBuffer().deserialize(body.value)
  }
  console.error('Deserialize unsupported body type', body)
  throw new Error('Deserialize unsupported body type')
}

export async function deserializeRequest(
  req: SerializedRequest,
): Promise<Request> {
  const { url, method, headers, body } = req
  const h = new Headers(headers)
  if (h.get('content-type')?.includes('multipart/form-data')) {
    h.delete('content-type')
  }
  return new Request(url, {
    method,
    headers: h,
    body: await deserializeBody(body),
  })
}

export type SerializedResponse = {
  status: number
  headers: Record<string, string>
  body: any
}

export async function serializeResponse(
  res: Response,
): Promise<SerializedResponse> {
  return jsonClone({
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    body: await serializeBody(res),
  })
}

export async function deserializeResponse(
  str: SerializedResponse,
): Promise<Response> {
  const { status, headers, body } = str
  return new Response(await deserializeBody(body), {
    status,
    headers: new Headers(headers),
  })
}
