import { Handler, NextFunction, Request, Response } from 'express'
import { randomDomainName, randomIpAddress } from '~/helpers/helper.randomString'

export const ip = (): Handler => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const ip: string = randomIpAddress()
		const domain: string = randomDomainName()

		res.setHeader('host', domain)
		res.setHeader('x-forwarded-host', domain)
		res.setHeader('x-forwarded-for', ip)
		res.setHeader('x-real-ip', ip)

		req.headers['host'] = domain
		req.headers['x-forwarded-host'] = domain
		req.headers['x-forwarded-for'] = ip
		req.headers['x-real-ip'] = ip

		next()
	}
}
