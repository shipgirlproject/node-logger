import process from 'node:process';
import { supportsColor } from './supports-color.ts';
import { checkDebug } from './util.ts';

const consoleStyles = {
	Reset: '\x1b[0m',
	Bright: '\x1b[1m',
	Dim: '\x1b[2m',
	Underscore: '\x1b[4m',
	Blink: '\x1b[5m',
	Reverse: '\x1b[7m',
	Hidden: '\x1b[8m',
	FgBlack: '\x1b[30m',
	FgRed: '\x1b[31m',
	FgGreen: '\x1b[32m',
	FgYellow: '\x1b[33m',
	FgBlue: '\x1b[34m',
	FgMagenta: '\x1b[35m',
	FgCyan: '\x1b[36m',
	FgWhite: '\x1b[37m',
	FgGray: '\x1b[90m',
	FgOrange: '\x1b[38;5;208m',
	FgLightGreen: '\x1b[38;5;119m',
	FgLightBlue: '\x1b[38;5;117m',
	FgViolet: '\x1b[38;5;141m',
	FgBrown: '\x1b[38;5;130m',
	FgPink: '\x1b[38;5;219m',
	BgBlack: '\x1b[40m',
	BgRed: '\x1b[41m',
	BgGreen: '\x1b[42m',
	BgYellow: '\x1b[43m',
	BgBlue: '\x1b[44m',
	BgMagenta: '\x1b[45m',
	BgCyan: '\x1b[46m',
	BgWhite: '\x1b[47m',
	BgGray: '\x1b[100m'
};

const consoleModuleColors = [
	consoleStyles.FgCyan,
	consoleStyles.FgGreen,
	consoleStyles.FgLightGreen,
	consoleStyles.FgBlue,
	consoleStyles.FgLightBlue,
	consoleStyles.FgMagenta,
	consoleStyles.FgOrange,
	consoleStyles.FgViolet,
	consoleStyles.FgBrown,
	consoleStyles.FgPink
];

enum LogLevel {
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR',
	DEBUG = 'DEBUG'
}

const defaultConsoleLevelColors: ConsoleLevelColors = {
	INFO: consoleStyles.FgCyan,
	WARN: consoleStyles.FgYellow,
	ERROR: consoleStyles.FgRed,
	DEBUG: consoleStyles.FgPink
};

export type ConsoleLevelColors = Record<LogLevel, string>;

const defaultDebugMode = checkDebug();

export class Logger {
	private hashCache: Record<string, number> = {};

	private defaultModule: string;
	private debugMode: boolean;
	private consoleLevelColors: ConsoleLevelColors;

	constructor({
		defaultModule,
		debugMode = defaultDebugMode,
		consoleLevelColors = defaultConsoleLevelColors
	}: {
		defaultModule: string;
		debugMode?: boolean;
		consoleLevelColors?: ConsoleLevelColors;
	}) {
		this.defaultModule = defaultModule;
		this.debugMode = debugMode;
		this.consoleLevelColors = consoleLevelColors;
	}

	info(msg: unknown, module?: string) {
		this.log(msg, LogLevel.INFO, module);
	}

	warn(msg: unknown, module?: string) {
		this.log(msg, LogLevel.WARN, module);
	}

	error(msg: unknown, module?: string) {
		this.log(msg, LogLevel.ERROR, module);
	}

	debug(msg: unknown, module?: string) {
		if (this.debugMode) this.log(msg, LogLevel.DEBUG, module);
	}

	exception(exception: string, module?: string) {
		this.log(exception, LogLevel.ERROR, module);
		process.exit(1);
	}

	setDebugMode(debugMode: boolean) {
		this.debugMode = debugMode;
	}

	private log(msg: unknown, level: LogLevel, module?: string) {
		module ??= this.defaultModule;

		const shouldUseColor = ((level === LogLevel.ERROR) || (level === LogLevel.WARN)) ? supportsColor.stderr : supportsColor.stdout;
		const messageShouldUseColor = (typeof msg === 'string') && shouldUseColor;

		const now = new Date().toISOString();
		const levelColor = shouldUseColor ? this.consoleLevelColors[level] : '';
		const moduleColor = consoleModuleColors[this.intHash(module, consoleModuleColors.length)];

		const timePart = shouldUseColor ? `${(level === LogLevel.DEBUG) ? consoleStyles.FgGray : consoleStyles.FgCyan}${now}${consoleStyles.Reset}` : now;
		const modulePart = shouldUseColor ? `[${moduleColor}${module}${consoleStyles.Reset}]` : `[${module}]`;
		const levelPart = shouldUseColor ? `${levelColor}${level}:${consoleStyles.Reset}` : `${level}:`;

		switch (level) {
			case LogLevel.INFO:
				console.info(timePart, modulePart, levelPart, msg);
				break;
			case LogLevel.WARN:
				console.warn(timePart, modulePart, levelPart, messageShouldUseColor ? `${consoleStyles.FgYellow}${msg}${consoleStyles.Reset}` : msg);
				break;
			case LogLevel.ERROR:
				console.error(timePart, modulePart, levelPart, messageShouldUseColor ? `${consoleStyles.FgRed}${msg}${consoleStyles.Reset}` : msg);
				break;
			case LogLevel.DEBUG:
				console.debug(timePart, modulePart, levelPart, messageShouldUseColor ? `${consoleStyles.FgGray}${msg}${consoleStyles.Reset}` : msg);
				break;
			default:
				console.log(timePart, modulePart, msg);
		}
	}

	private intHash(str: string, length = 10): number {
		const cached = this.hashCache[str];
		if (cached) return cached;

		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
		}
		const h = (hash % length + length + str.length) % length;

		this.hashCache[str] = h;
		return h;
	}
}
