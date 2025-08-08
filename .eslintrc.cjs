module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist', 
    '.eslintrc.cjs',
    'public/ffmpeg/*',
    'node_modules/*',
    '*.min.js',
    '*.bundle.js'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Reducir warnings de variables no utilizadas
    'no-unused-vars': 'off', // Desactivar temporalmente
    'prefer-const': 'error',
    // Desactivar warnings de React hooks para enfocarnos en errores críticos
    'react-hooks/exhaustive-deps': 'off',
    // Desactivar warnings de imports no utilizados
    'react-refresh/only-export-components': 'off'
  },
} 