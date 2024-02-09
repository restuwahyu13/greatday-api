import FormDataNode from 'form-data'

import { ApiResponse, apiResponse } from '~/helpers/helper.apiResponse'
import { Inject, Service } from '~/helpers/helper.di'
import { Axios, EAxiosHttpMethod } from '~/libs/lib.axios'
import { FormData } from '~/libs/lib.formdata'

@Service()
export class FilesService {
	constructor(
		@Inject('Axios')
		private readonly axiosLibs: Axios,
		@Inject('FormData')
		private readonly formDataLibs: FormData
	) {}

	async fileUpload(file: Express.Multer.File): Promise<ApiResponse> {
		try {
			const form: FormDataNode = await this.formDataLibs.append(file.filename)

			const uploadRes: Record<string, any> = await this.axiosLibs.request({
				url: 'https://api.escuelajs.co',
				path: '/api/v1/files/upload',
				method: EAxiosHttpMethod.POST,
				data: form,
				configs: {
					headers: form.getHeaders()
				}
			})

			return apiResponse({ stat_code: 200, stat_message: 'Success', data: uploadRes })
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}
}
