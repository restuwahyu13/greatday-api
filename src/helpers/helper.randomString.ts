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

function randomIntForIP(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomNextNumber(numbs: number[]): number {
	const max: number = Math.max(...numbs)
	const min: number = Math.min(...numbs)
	const nextNumber: number = Math.floor(Math.random() * (max - min + 1))

	return nextNumber
}

export function randomIpAddress(): string {
	const ipLengths: number[] = [1, 2, 3]
	const ipTypes: string[] = ['A', 'B', 'C']
	let ip: string = ''

	switch (ipTypes[randomNextNumber(ipLengths)]) {
		case 'A':
			ip += randomIntForIP(1, 126)
			for (let i = 0; i < 3; i++) {
				ip += '.' + randomIntForIP(0, 255)
			}
			break

		case 'B':
			ip += randomIntForIP(128, 191)
			ip += '.' + randomIntForIP(0, 255)
			for (let i = 0; i < 2; i++) {
				ip += '.' + randomIntForIP(0, 255)
			}
			break

		case 'C':
			ip += randomIntForIP(192, 223)
			for (let i = 0; i < 2; i++) {
				ip += '.' + randomIntForIP(0, 255)
			}
			ip += '.' + randomIntForIP(0, 254)
			break

		default:
			return
	}

	return ip
}

export function randomDomainName(): string {
	const chars: string = 'abcdefghijklmnopqrstuvwxyz0123456789'
	let domain: string = ''

	for (let i = 0; i < 10; i++) {
		domain += chars[Math.floor(Math.random() * chars.length)]
	}

	const domainLengths: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	const domains: string[] = ['.com', '.xyz', '.id', '.tech', '.co', '.biz', '.edu', '.inc', '.ltd', '.org', '.cc', '.info']
	domain += domain + '-cloudstreet' + domains[randomNextNumber(domainLengths)]

	return 'app-' + domain.substring(0, 10) + domain.substring(11, domain.length)
}
