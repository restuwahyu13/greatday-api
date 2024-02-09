import axios, { AxiosResponse } from 'axios'

import { apiResponse } from '~/helpers/helper.apiResponse'
import { Injectable } from '~/helpers/helper.di'

export enum EAxiosHttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	PATCH = 'PATCH'
}

interface IAxiosConfig {
	url: string
	path: string
	method: EAxiosHttpMethod
	data?: Record<string, any>
	configs?: Record<string, any>
}

@Injectable()
export class Axios {
	async request(config: IAxiosConfig): Promise<any> {
		try {
			const res: AxiosResponse = await axios.request({
				url: config.url + config.path,
				method: config.method,
				data: config.data ?? {},
				...config.configs
			})

			return res.data
		} catch (e: any) {
			if (axios.isAxiosError(e)) {
				throw apiResponse({
					err_message: e.response ? (typeof e.response.data !== 'string' ? e.response.data.message : e.response.data) : e.message
				})
			}

			throw apiResponse({ err_message: e })
		}
	}
}
