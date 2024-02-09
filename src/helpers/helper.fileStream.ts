import { WriteStream, createWriteStream } from 'fs'
import path from 'path'
import sharp, { Sharp } from 'sharp'
import zlib from 'zlib'

import { ConfigsEnvironment } from '~/configs/config.env'
import { IUser } from '~/providers/provider.greatDay'

export const fileStream = (file: Express.Multer.File, user: IUser): Promise<string> => {
	return new Promise((resolve: (value: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
		const now: Date = new Date()

		const year: number = now.getFullYear()
		const month: string = ('0' + (now.getMonth() + 1)).slice(-2)
		const day: string = ('0' + now.getDate()).slice(-2)
		const hour: string = ('0' + now.getHours()).slice(-2)
		const minute: string = ('0' + now.getMinutes()).slice(-2)
		const second: string = ('0' + now.getSeconds()).slice(-2)
		const milliseconds: number = now.getMilliseconds()

		const fileName: string = `img_web_${user.userId}_${year}${month}${day}_1707${hour}${minute}${second}${milliseconds}.jpg`
		const writeStream: WriteStream = createWriteStream(path.resolve(ConfigsEnvironment.STORAGE_DIR, fileName))
		const sh: Sharp = sharp()

		if (path.extname(file.originalname) === '.png') {
			sh.toFormat('jpg', {
				quality: 70,
				progressive: true,
				optimiseScans: true,
				compressionLevel: zlib.constants.Z_BEST_COMPRESSION
			})

			sh.pipe<NodeJS.WritableStream> = (destination: NodeJS.WritableStream) => {
				destination.write(file.buffer)
				return destination
			}

			sh.pipe(writeStream).on('error', reject).end()
		} else if (path.extname(file.originalname) === '.jpeg') {
			sh.toFormat('jpg', {
				quality: 70,
				progressive: true,
				optimiseScans: true,
				compressionLevel: zlib.constants.Z_BEST_COMPRESSION
			})

			sh.pipe<NodeJS.WritableStream> = (destination: NodeJS.WritableStream) => {
				destination.write(file.buffer)
				return destination
			}

			sh.pipe(writeStream).on('error', reject).end()
		} else if (path.extname(file.originalname) === '.webp') {
			sh.toFormat('jpg', {
				quality: 70,
				progressive: true,
				optimiseScans: true,
				compressionLevel: zlib.constants.Z_BEST_COMPRESSION
			})

			sh.pipe<NodeJS.WritableStream> = (destination: NodeJS.WritableStream) => {
				destination.write(file.buffer)
				return destination
			}

			sh.pipe(writeStream).on('error', reject).end()
		} else {
			sh.toFormat('jpg', {
				quality: 70,
				progressive: true,
				optimiseScans: true,
				compressionLevel: zlib.constants.Z_BEST_COMPRESSION
			})

			sh.pipe<NodeJS.WritableStream> = (destination: NodeJS.WritableStream) => {
				destination.write(file.buffer)
				return destination
			}

			sh.pipe(writeStream).on('error', reject).end()
		}

		writeStream.on('error', reject).end(() => resolve(fileName))
	})
}
