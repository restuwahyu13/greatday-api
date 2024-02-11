import { Handler, NextFunction, Request, Response } from 'express'
import consola from 'consola'
import { randomDomainName } from '~/helpers/helper.randomString'
import { ConfigsEnvironment } from '~/configs/config.env'

export const ip = (ip: string): Handler => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const domain: string = randomDomainName()

		consola.info(`
=================================================
======== Req Before Headers From Client =========
=================================================

headers: ${JSON.stringify(req.headers)}

=================================================
=================================================
=================================================
		`)

		res.setHeader('Origin', domain)
		res.setHeader('Referer', domain)
		res.setHeader('X-Forwarded-For', ip)
		res.setHeader('X-Real-IP', ip)
		res.setHeader('X-Client-IP', ip)
		res.setHeader('User-Agent', ConfigsEnvironment.USER_AGENT.data.userAgent)

		req.headers['x-forwarded-for'] = ip
		req.headers['x-real-ip'] = ip
		req.headers['x-client-ip'] = ip
		req.headers['user-agent'] = ConfigsEnvironment.USER_AGENT.data.userAgent

		consola.info(`
=================================================
======== Req After Headers From Client ==========
=================================================

headers: ${JSON.stringify(res.getHeaders())}

=================================================
=================================================
=================================================
		`)

		next()
	}
}
