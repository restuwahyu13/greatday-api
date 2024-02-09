import UserAgent from 'user-agents'

export class ConfigsEnvironment {
	private static userAgent: UserAgent = new UserAgent()

	static readonly NODE_ENV: string = process.env.NODE_ENV! ?? 'development'
	static readonly PORT: number = +process.env.PORT! ?? 3000
	static readonly REDIS_URL: string = process.env.REDIS_URL! ?? 'redis://localhost:6379'
	static readonly STORAGE_DIR: string = process.env.STORAGE_DIR! ?? '/home/users/app/storage'
	static readonly GRD_ORIGIN_URL: string = process.env.GRD_ORIGIN_URL ?? 'https://example.com'
	static readonly GRD_EPIC_URL: string = process.env.GRD_EPIC_URL! ?? 'https://example.com'
	static readonly GRD_DATAON_URL: string = process.env.GRD_DATAON_URL! ?? 'https://example.com'
	static readonly USER_AGENT: UserAgent = ConfigsEnvironment.userAgent
	static readonly JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY ?? 'abcdefg123456'
	static readonly JWT_EXPIRED: number = +process.env.JWT_EXPIRED ?? 1200
	static readonly FILE_SIZE_MAX: number = +process.env.FILE_SIZE_MAX ?? 1048576
}
