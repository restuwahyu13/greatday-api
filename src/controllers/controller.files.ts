import { Request, Response, NextFunction, Handler } from 'express'
import { OutgoingMessage } from 'http'

import { ApiResponse } from '~/helpers/helper.apiResponse'
import { Controller, Inject } from '~/helpers/helper.di'
import { rawParser } from '~/helpers/helper.rawParser'
import { FilesService } from '~/services/service.files'

@Controller()
export class FilesController {
	constructor(
		@Inject('FilesService')
		private readonly filesService: FilesService
	) {}

	fileUpload(): Handler {
		return async (req: Request, res: Response, _next: NextFunction): Promise<OutgoingMessage> => {
			try {
				const files: ApiResponse = await this.filesService.fileUpload(rawParser<Express.Multer.File>(req.file))
				return res.status(files.stat_code).json(files)
			} catch (e: any) {
				return res.status(e.stat_code).json(e)
			}
		}
	}
}
