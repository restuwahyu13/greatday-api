import { Request, Response, NextFunction, Handler } from 'express'
import { StatusCodes as status } from 'http-status-codes'
import { Multer } from 'multer'
import { OutgoingMessage } from 'http'

import { Inject, Middleware } from '~/helpers/helper.di'
import { MimeType } from '~/helpers/helper.mimeType'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { fileStream } from '~/helpers/helper.fileStream'
import { UsersMetadata } from '~/helpers/helper.usersMetadata'

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
						throw apiResponse({ err_message: err })
					}

					if (!req.file) {
						throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: 'Invalid file upload' })
					} else if (!MimeType.whiteListBytes(req.file.buffer, req.file.originalname)) {
						throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: 'Invalid mime type' })
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
