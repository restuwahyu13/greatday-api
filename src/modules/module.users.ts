import { DependencyContainer } from 'tsyringe'

import { Module, Injectable, Inject } from '~/helpers/helper.di'
import { UsersService } from '~/services/service.users'
import { UsersController } from '~/controllers/controller.users'
import { UsersRoute } from '~/routes/route.users'
import { GreatDayProvider } from '~/providers/provider.greatDay'
import { AuthorizationMiddleware } from '~/middlewares/middleware.authorization'
import { FilesMiddleware } from '~/middlewares/middleware.upload'
import { Redis } from '~/libs/lib.redis'
import { Axios } from '~/libs/lib.axios'
import { JsonWebToken } from '~/libs/lib.jwt'
import { Multer } from '~/libs/lib.multer'
import { FormData } from '~/libs/lib.formdata'
import { UsersMetadata } from '~/helpers/helper.usersMetadata'

@Module([
	{ token: 'UsersService', useClass: UsersService },
	{ token: 'UsersController', useClass: UsersController },
	{ token: 'UsersRoute', useClass: UsersRoute },
	{ token: 'GreatDayProvider', useClass: GreatDayProvider },
	{ token: 'AuthMiddleware', useClass: AuthorizationMiddleware },
	{ token: 'FilesMiddleware', useClass: FilesMiddleware },
	{ token: 'Redis', useClass: Redis },
	{ token: 'Axios', useClass: Axios },
	{ token: 'Jwt', useClass: JsonWebToken },
	{ token: 'Multer', useClass: Multer },
	{ token: 'FormData', useClass: FormData },
	{
		token: 'UsersMetadata',
		useFactory: (dc: DependencyContainer) => {
			return dc.resolve(UsersMetadata)
		}
	}
])
@Injectable()
export class UsersModule {
	constructor(@Inject('UsersRoute') public readonly usersRoute: UsersRoute) {}
}
