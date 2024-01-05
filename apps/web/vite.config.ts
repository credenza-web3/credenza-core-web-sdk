import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	resolve: {
		alias: {
			'@packages': path.resolve(__dirname, '../../packages')
		}
	},
	build: {
		commonjsOptions: {
			include: [/@repo-ui/, /node_modules/]
		}
	}
});
