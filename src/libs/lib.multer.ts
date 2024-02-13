import { Request } from 'express'
import multer from 'multer'
import { FileTypeResult, fromFile } from 'file-type'

import { ConfigsEnvironment } from '~/configs/config.env'
import { Injectable } from '~/helpers/helper.di'

@Injectable()
export class Multer {
	private async fileFilter(req: Request, file: Express.Multer.File, done: (error: Error, destination: string) => void): Promise<void> {
		const fileType: FileTypeResult = await fromFile(file.originalname)

		if (!req.header('content-type').includes('multipart/form-data')) {
			done(new Error('Content-Type is not valid'), null)
		} else if (+req.header('content-length') >= ConfigsEnvironment.FILE_SIZE_MAX) {
			done(new Error('File to many large'), null)
		} else if (!fileType) {
			done(new Error('Invalid file type'), null)
		} else if (ConfigsEnvironment.FILE_MIME_TYPE.split(',').indexOf(fileType.ext) === -1) {
			done(new Error('Invalid mime type'), null)
		} else {
			done(null, file.originalname)
		}
	}

	file = multer({ storage: multer.memoryStorage(), fileFilter: this.fileFilter, limits: { fileSize: ConfigsEnvironment.FILE_SIZE_MAX } })
}
