import { Request, Response, NextFunction } from 'express'
import validator from 'validator'
import { StatusCodes as status } from 'http-status-codes'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'
import { OutgoingMessage } from 'http'
import { JWTPayload, JWTVerifyResult } from 'jose'

import { Redis } from '~/libs/lib.redis'
import { JsonWebToken } from '~/libs/lib.jwt'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { Container, Injectable } from '~/helpers/helper.di'

@Injectable()
export class AuthorizationMiddleware {
	async use(req: Request, res: Response, next: NextFunction): Promise<OutgoingMessage> {
		try {
			const redis: InstanceType<typeof Redis> = new Redis()
			const jwt: InstanceType<typeof JsonWebToken> = new JsonWebToken()
			const headers: Record<string, any> = req.headers

			if (!headers.hasOwnProperty('authorization')) {
				throw apiResponse({ stat_code: status.UNAUTHORIZED, err_message: 'Authorization required' })
			} else if (!Array.isArray(headers.authorization.match('Bearer'))) {
				throw apiResponse({ stat_code: status.UNAUTHORIZED, err_message: 'Authorization required' })
			}

			let authToken: string = headers.authorization.split('Bearer ')[1]
			if (!validator.isJWT(authToken)) {
				throw apiResponse({ stat_code: status.UNAUTHORIZED, err_message: 'Invalid token' })
			}

			authToken = authToken.trim()

			const decodeToken: JwtPayload = jsonwebtoken.decode(authToken) as any
			if (!decodeToken) {
				throw apiResponse({ stat_code: status.UNAUTHORIZED, err_message: 'Invalid token' })
			}

			const accessToken: string = await redis.get(`${decodeToken.jti}:token`)
			if (authToken != accessToken) {
				throw apiResponse({ stat_code: status.UNAUTHORIZED, err_message: 'Invalid token' })
			}

			const verifyRes: JWTVerifyResult<JWTPayload> = await jwt.verify(decodeToken.jti, authToken)
			Container.register('User', { useValue: await redis.hget(`${verifyRes.payload.jti}:data`, 'users') })

			next()
		} catch (e: any) {
			return res.status(e.stat_code ?? status.INTERNAL_SERVER_ERROR).json(apiResponse({ err_message: e }))
		}
	}
}
