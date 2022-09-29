import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
const { scss } = preprocess;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({ preprocess: [scss()] }),
	kit: {
		adapter: adapter({ out: 'build' })
	}
};

export default config;
