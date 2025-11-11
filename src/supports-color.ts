// based on https://github.com/chalk/supports-color/tree/3b17ac24ace893aac0d2d5187f14cd4a517dd00a

import process from 'node:process';
import tty from 'node:tty';
import { hasFlag } from './util.ts';

function checkFlag() {
	if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false') || hasFlag('color=never'))
		return false;

	if (hasFlag('color') || hasFlag('colors'))
		return true;

	return undefined;
}

function checkEnv() {
	if ('FORCE_COLOR' in process.env) {
		const env = process.env.FORCE_COLOR!;
		if (env === 'true') return true;
		if (env === 'false') return false;
		if (env.length === 0) return true;
	};

	return undefined;
}

const KNOWN_CI_ENVS = [
	'GITHUB_ACTIONS',
	'GITEA_ACTIONS',
	'CIRCLECI',
	'TRAVIS',
	'APPVEYOR',
	'GITLAB_CI',
	'BUILDKITE',
	'DRONE'
];

function checkSupport(isTTY: boolean) {
	const forceColor = checkEnv() ?? checkFlag();

	if ((forceColor !== undefined) && (forceColor === false))
		return false;

	if ('TF_BUILD' in process.env && 'AGENT_NAME' in process.env)
		return true;

	if (!isTTY && (forceColor === undefined))
		return false;

	if (process.env.TERM === 'dumb')
		return false;

	if ('CI' in process.env)
		return (KNOWN_CI_ENVS.some(k => k in process.env) || process.env.CI_NAME === 'codeship');

	if ('TEAMCITY_VERSION' in process.env)
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(process.env.TEAMCITY_VERSION!) ? true : false;

	if (process.env.TERM === 'wezterm')
		return true;

	if ('TERM_PROGRAM' in process.env)
		if ((process.env.TERM_PROGRAM === 'iTerm.app') || (process.env.TERM_PROGRAM === 'Apple_Terminal'))
			return true;

	if (/-256(color)?$|^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(process.env.TERM!))
		return true;

	if ('COLORTERM' in process.env)
		return true;

	return false;
}

export const supportsColor = {
	stdout: checkSupport(tty.isatty(1)),
	stderr: checkSupport(tty.isatty(2))
};
