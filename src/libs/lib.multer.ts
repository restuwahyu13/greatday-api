import { Request } from 'express'
import multer from 'multer'

import { ConfigsEnvironment } from '~/configs/config.env'
import { Injectable } from '~/helpers/helper.di'

@Injectable()
export class Multer {
	private fileFilter(req: Request, file: Express.Multer.File, done: (error: Error, destination: string) => void): void {
		if (!req.header('content-type').includes('multipart/form-data')) {
			done(new Error('Content type not valid'), null)
		} else if (+req.header('content-length') >= ConfigsEnvironment.FILE_SIZE_MAX) {
			done(new Error('File to many large'), null)
		} else {
			done(null, file.originalname)
		}
	}

	file = multer({ storage: multer.memoryStorage(), fileFilter: this.fileFilter, limits: { fileSize: ConfigsEnvironment.FILE_SIZE_MAX } })
}
