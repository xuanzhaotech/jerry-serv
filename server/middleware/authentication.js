// Authentication 鉴权
import config from '../config'
const jwt = require('jsonwebtoken')

const signatrue = config.jwt_secret
const debug = config.env === 'development'
// 只鉴权/api/ 开头 但不包括 public和login 的请求
const regx = [/^\/api\//i, /^(?!\/api\/public\/)/i, /^(?!\/api\/admin\/login)/i]
let payload

export const authentication = app => {
  app.use(async (ctx, next) => {
    const needAuth = regx.every(r => r.test(ctx.url))

    if (needAuth) {
      const token = resolveAuthorizationHeader(ctx)

      if (!token) {
        ctx.throw(401, debug ? 'Token not found' : 'Authentication Error')
      }
      if (!signatrue) {
        ctx.throw(500, debug ? 'Signatrue not found' : 'Authentication Error')
      }

      try {
        payload = await verify(token, signatrue)

        ctx.jwt = payload
      } catch (err) {
        // let msg = err.message
        // if (err.message.test(/jwt expired/)) {
        // }

        const msg = debug ? err.message : 'Authentication Error'
        ctx.throw(401, msg)
      }
    }
    await next()
  })
}

// TODO: 仿koa-jwt find -> cookie & head
function resolveAuthorizationHeader(ctx) {
  if (!ctx.header || !ctx.header.authorization) {
    return (
      ctx.throw(400, 'Bad Request')
    )
  }

  const parts = ctx.header.authorization.split(' ')

  if (parts.length === 2) {
    const scheme = parts[0]
    const credentials = parts[1]

    if (/^Bearer$/i.test(scheme)) {
      return credentials
    }
  }

  ctx.throw(
    401,
    'Bad Authorization header format. Format is "Authorization: Bearer <token>"'
  )
}

function verify(token, signatrue) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, signatrue, (error, decoded) => {
      error ? reject(error) : resolve(decoded)
    })
  })
}
