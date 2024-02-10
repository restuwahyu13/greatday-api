import { DependencyContainer } from 'tsyringe'

import { Injectable, Module, Router } from '~/helpers/helper.di'
import { UsersModule } from '~/modules/module.users'
import { FilesModule } from '~/modules/module.files'

@Module([
	{
		token: 'UsersModule',
		useFactory: (dc: DependencyContainer): Router => {
			return dc.resolve(UsersModule).usersRoute.main()
		}
	},
	{
		token: 'FilesModule',
		useFactory: (dc: DependencyContainer): Router => {
			return dc.resolve(FilesModule).filesRoute.main()
		}
	}
])
@Injectable()
export class AppModule {}
