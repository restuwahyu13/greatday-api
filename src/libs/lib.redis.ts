import IORedis from 'ioredis'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { Injectable } from '~/helpers/helper.di'

@Injectable()
export class Redis {
	private config(): IORedis {
		return new IORedis(process.env.REDIS_URL)
	}

	async ttl(key: string): Promise<number> {
		try {
			return await this.config().ttl(key)
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async exists(key: string): Promise<number> {
		try {
			return await this.config().exists(key)
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async del(key: string): Promise<number> {
		try {
			return await this.config().del(key)
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async setEx(key: string, expired: number, data: string | number): Promise<string> {
		try {
			return await this.config().setex(key, expired, data)
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async set(key: string, data: string | number): Promise<string> {
		try {
			return await this.config().set(key, data)
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async get(key: string): Promise<string> {
		try {
			return await this.config().get(key)
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async hset(key: string, field: string, data: Record<string, any>): Promise<number> {
		try {
			return await this.config().hset(key, { [field]: JSON.stringify(data) })
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async hsetEx(key: string, field: string, exp: number, data: Record<string, any>): Promise<number> {
		try {
			const res: number = await this.config().hset(key, { [field]: JSON.stringify(data) })
			await this.config().expire(key, exp)
			return res
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async hget(key: string, field: string): Promise<any> {
		try {
			return await this.config()
				.hget(key, field)
				.then((val: string) => JSON.parse(val))
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async hexists(key: string, field: string): Promise<number> {
		try {
			return await this.config().hexists(key, field)
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}
}
