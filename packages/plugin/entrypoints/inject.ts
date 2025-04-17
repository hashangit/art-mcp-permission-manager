import { deserializeResponse, serializeRequest } from '@/lib/serialize'
import { Vista } from '@rxliuli/vista'
import { internalMessaging } from 'cors-unblock/internal'

export default defineUnlistedScript(() => {
  new Vista()
    .use(async (c, next) => {
      const allowedInfo = await internalMessaging.sendMessage(
        'getAllowedInfo',
        undefined,
      )
      if (
        !allowedInfo.enabled ||
        (allowedInfo.type !== 'all' &&
          !allowedInfo.hosts?.includes(new URL(c.req.url).hostname))
      ) {
        await next()
        return
      }
      c.res = await deserializeResponse(
        await internalMessaging.sendMessage(
          'request',
          await serializeRequest(c.req),
        ),
      )
    })
    .intercept()
})
