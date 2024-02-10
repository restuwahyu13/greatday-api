import { IsLatitude, IsLongitude, IsNotEmpty, IsString, Matches } from 'class-validator'

export class UsersLoginDTO {
	@IsNotEmpty()
	@IsString()
	company!: any

	@IsNotEmpty()
	@IsString()
	uid!: any

	@IsNotEmpty()
	@IsString()
	password: string
}

export class UsersSetLocationDTO {
	@IsLatitude()
	latitude: number

	@IsLongitude()
	longitude: number
}

export class UsersRecordAttendanceDTO {
	@Matches(/^(\w+)-(\d{6})-(\d{2}-\d{2})-(\w+_\w+_\d+_\d{8}_\d+)\.(jpg)$/, { message: 'filename must be a filename pattern' })
	filename: string
}
