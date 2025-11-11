import process from 'node:process';

// from https://github.com/sindresorhus/has-flag/blob/6d754119be74a2332b87c19a1d572f2212629caa/index.js
export function hasFlag(flag: string) {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = process.argv.indexOf(prefix + flag);
	const terminatorPosition = process.argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}

export function checkDebug() {
	return !hasFlag('no-debug') || hasFlag('debug') || (process.env.NODE_ENV !== 'production');
}
