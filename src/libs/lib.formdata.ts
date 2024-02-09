import FormDataNode from 'form-data'
import { createReadStream, existsSync } from 'fs'
import { resolve } from 'path'
import { StatusCodes as status } from 'http-status-codes'

import { ConfigsEnvironment } from '~/configs/config.env'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { Injectable } from '~/helpers/helper.di'

@Injectable()
export class FormData {
	async append(fileName: string): Promise<FormDataNode> {
		const dir: string = resolve(ConfigsEnvironment.STORAGE_DIR, fileName)

		if (!existsSync(dir)) {
			throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: 'No such file in directory' })
		}

		const form: FormDataNode = new FormDataNode()
		form.append('file', createReadStream(dir))

		return form
	}
}
