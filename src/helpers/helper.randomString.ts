export const randomIfNoneMatch = (length: number): string => {
	let result = ''
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/_'
	const charactersLength = characters.length
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

export const randomXGDParams = (length: number): string => {
	let result = ''

	const characters = '0123456789ABCDEF'
	const charactersLength = characters.length

	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}

	return result
}

export const randomDeviceId = (): string => {
	let deviceId: string = ''
	let characters: string = 'abcdef0123456789'

	for (let i = 0; i < 16; i++) {
		deviceId += characters.charAt(Math.floor(Math.random() * characters.length))
	}

	return deviceId
}

export const randomIMEI = (): number => {
	let imei: any = ''
	let characters: string = '0123456789'
	let sum: number = 0
	let mul: number = 2
	let totalDigit: number = 0

	for (let i = 0; i < 14; i++) {
		imei += characters.charAt(Math.floor(Math.random() * characters.length))
	}

	for (let i = 13; i >= 0; i--) {
		let digit = imei.charAt(i) - 0
		let tp = digit * mul
		if (mul === 1) {
			mul++
		} else {
			mul--
		}
		if (tp > 9) {
			tp = Math.floor(tp / 10) + (tp % 10)
		}
		totalDigit += tp
	}

	if (totalDigit % 10 === 0) {
		sum = 0
	} else {
		sum = 10 - (totalDigit % 10)
	}

	imei += sum

	return imei
}

export const randomNamefile = (): string => {
	let now = new Date()

	let year = now.getFullYear()
	let month = ('0' + (now.getMonth() + 1)).slice(-2)
	let day = ('0' + now.getDate()).slice(-2)
	let hour = ('0' + now.getHours()).slice(-2)
	let minute = ('0' + now.getMinutes()).slice(-2)
	let second = ('0' + now.getSeconds()).slice(-2)
	let milliseconds = now.getMilliseconds()

	let userId = '28'
	if (process.argv.length > 0) {
		userId = process.argv[process.argv.length - 1].split('=')[1]
	}

	return `img_web_${userId}_${year}${month}${day}_1707${hour}${minute}${second}${milliseconds}.jpg`
}
