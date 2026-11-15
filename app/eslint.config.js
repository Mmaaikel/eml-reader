import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{ ignores: ['dist', 'node_modules', 'test-results', 'playwright-report', '.impeccable'] },
	{
		files: ['**/*.{ts,tsx}'],
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		languageOptions: {
			ecmaVersion: 2022,
			globals: { ...globals.browser },
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			// Parsed email data is loosely typed at the edges (pdf.js objects)
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		files: ['test/**/*.ts', '*.config.ts'],
		languageOptions: { globals: { ...globals.node } },
	},
	// Formatting is Prettier's job
	prettier,
)
