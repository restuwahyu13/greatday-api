import { Handler, NextFunction, Request, Response } from 'express'
import { randomDomainName, randomIpAddress } from '~/helpers/helper.randomString'

export const ip = (): Handler => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const ip: string = randomIpAddress()
		const domain: string = randomDomainName()

		res.setHeader('Host', domain)
		res.setHeader('Origin', domain)
		res.setHeader('Referer', domain)

		res.setHeader('X-Forwarded-Host', domain)
		res.setHeader('X-Forwarded-For', ip)
		res.setHeader('X-Real-Ip', ip)

		req.headers['host'] = domain
		req.headers['origin'] = domain
		req.headers['referer'] = domain

		req.headers['X-Forwarded-host'] = domain
		req.headers['X-Forwarded-for'] = ip
		req.headers['X-Real-ip'] = ip

		next()
	}
}
