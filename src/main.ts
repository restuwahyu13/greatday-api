import 'express-async-errors'
import 'reflect-metadata'
import 'dotenv/config'
import express, { Express, Request, Response, Router } from 'express'
import http, { OutgoingMessage, Server } from 'http'
import { StatusCodes as status } from 'http-status-codes'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import zlib from 'zlib'
import hpp from 'hpp'
import consola from 'consola'
import { mw as requestIp } from 'request-ip'

import { apiResponse } from '~/helpers/helper.apiResponse'
import { ip } from '~/middlewares/middleware.ip'
import { Container, Injectable } from '~/helpers/helper.di'
import { AppModule } from '~/app.module'
import { randomIpAddress } from '~/helpers/helper.randomString'

@Injectable()
class App {
	private app: Express
	private server: Server
	private env: string
	private port: number
	private ip: string

	constructor() {
		this.app = express()
		this.server = http.createServer(this.app)
		this.env = process.env.NODE_ENV
		this.port = +process.env.PORT
		this.ip = randomIpAddress()
	}

	private config(): void {
		this.app.enable('trust proxy')
		this.app.disable('x-powered-by')
		this.app.set('trust proxy', this.ip)
		Container.resolve<AppModule>(AppModule)
	}

	private middleware(): void {
		this.app.use(requestIp())
		this.app.use(ip(this.ip))
		this.app.use(bodyParser.json({ limit: '1mb' }))
		this.app.use(bodyParser.raw({ inflate: true, limit: '1mb', type: 'application/json' }))
		this.app.use(bodyParser.urlencoded({ extended: true }))
		this.app.use(helmet({ contentSecurityPolicy: false }))
		this.app.use(hpp({ checkBody: true, checkQuery: true }))
		this.app.use(
			cors({
				origin: '*',
				methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
				allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
				credentials: true
			})
		)
		this.app.use(
			compression({
				strategy: zlib.constants.Z_RLE,
				level: zlib.constants.Z_BEST_COMPRESSION,
				memLevel: zlib.constants.Z_BEST_COMPRESSION
			})
		)
		if (!['production', 'test'].includes(this.env)) {
			this.app.use(morgan('dev'))
		}
	}

	private route(): void {
		this.app.use('/users', Container.resolve<Router>('UsersModule'))
		this.app.use('/files', Container.resolve<Router>('FilesModule'))
	}

	private globalRoute(): void {
		this.app.all(['/'], (_req: Request, res: Response): OutgoingMessage => {
			console.log(_req.headers)
			return res.status(status.OK).json(apiResponse({ stat_code: status.OK, stat_message: 'Ping!' }))
		})
	}

	private run(): void {
		const serverInfo: string = `Server is running on port: ${this.port}`
		this.server.listen(this.port, () => consola.info(serverInfo))
	}

	public main(): void {
		this.config()
		this.middleware()
		this.route()
		this.globalRoute()
		this.run()
	}
}

/**
 * @description boostraping app and run app with env development / production
 */

;(function () {
	if (process.env.NODE_ENV != 'test') Container.resolve<App>(App).main()
})()
