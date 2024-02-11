import { Handler, NextFunction, Request, Response } from 'express'
import { randomDomainName, randomIpAddress } from '~/helpers/helper.randomString'

export const ip = (): Handler => {
	return (_req: Request, res: Response, next: NextFunction): void => {
		const ip: string = randomIpAddress()
		const domain: string = randomDomainName()

		res.setHeader('Origin', domain)
		res.setHeader('Referer', domain)
		res.setHeader('X-Forwarded-For', ip)
		res.setHeader('X-Real-Ip', ip)

		next()
	}
}
