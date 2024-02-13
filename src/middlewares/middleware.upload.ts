import { Request, Response, NextFunction, Handler } from 'express'
import { StatusCodes as status } from 'http-status-codes'
import { Multer } from 'multer'
import { OutgoingMessage } from 'http'
import { FileTypeResult, fromBuffer } from 'file-type'

import { Inject, Middleware } from '~/helpers/helper.di'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { fileStream } from '~/helpers/helper.fileStream'
import { UsersMetadata } from '~/helpers/helper.usersMetadata'
import { ConfigsEnvironment } from '~/configs/config.env'

@Middleware()
export class FilesMiddleware {
	constructor(
		@Inject('UsersMetadata')
		private readonly usersMetadata: UsersMetadata
	) {}

	use(multer: Multer, field: string): Handler {
		return (req: Request, res: Response, next: NextFunction): void => {
			const fileupload: Handler = multer.single(field)

			fileupload(req, res, async <Error>(err: Error): Promise<NextFunction | OutgoingMessage> => {
				try {
					if (err instanceof Error) {
						throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: err.message })
					}

					const fileType: FileTypeResult = await fromBuffer(req.file.buffer)

					if (!fileType) {
						throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: 'Invalid file type' })
					} else if (ConfigsEnvironment.FILE_MIME_TYPE.split(',').indexOf(fileType.ext) === -1) {
						throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: 'Invalid mime type' })
					} else if (req.file.size >= ConfigsEnvironment.FILE_SIZE_MAX) {
						throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: 'File to many large' })
					}

					req.file.filename = await fileStream(req.file, this.usersMetadata.user())

					next()
				} catch (e: any) {
					return res.status(e.stat_code ?? status.INTERNAL_SERVER_ERROR).json(apiResponse({ err_message: e }))
				}
			})
		}
	}
}
