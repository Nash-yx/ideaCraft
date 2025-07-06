import neostandard from 'neostandard'

export default neostandard({
  // 忽略的文件和目錄
  ignores: [
    'dist/**',
    'build/**',
    'node_modules/**',
    'coverage/**',
    '.next/**',
    '.nuxt/**',
    '.output/**',
    '.vitepress/cache/**',
    '.vitepress/dist/**',
    'public/**',
    'static/**',
    '*.min.js',
    '*.bundle.js',
    '*.config.js',
    '*.d.ts',
  ],

  // 環境設定
  env: ['browser', 'node', 'es2024'],

  // TypeScript 支援（如果項目使用 TypeScript）
  typescript: true,

  // JSX 支援（如果項目使用 React/Vue JSX）
  jsx: true,

  // 自定義規則
  rules: {
    // 開發階段允許 console，生產環境警告
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // 開發階段允許 debugger，生產環境報錯
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // 允許未使用的變量以 _ 開頭
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // 允許空的 catch 塊（但建議至少有註釋）
    'no-empty': ['error', { allowEmptyCatch: true }],

    // 允許在條件語句中使用常量表達式
    'no-constant-condition': ['error', { checkLoops: false }],

    // 允許在 return 語句中使用 await
    'no-return-await': 'off',

    // 強制使用 const 聲明不會被重新賦值的變量
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: false,
      },
    ],

    // 要求或禁止末尾逗號
    'comma-dangle': [
      'error',
      {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never',
      },
    ],

    // 限制單行代碼的最大長度
    'max-len': [
      'warn',
      {
        code: 100,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],

    // 要求對象字面量屬性名稱使用一致的引號
    'quote-props': ['error', 'as-needed'],

    // 禁止使用 var
    'no-var': 'error',

    // 優先使用箭頭函數
    'prefer-arrow-callback': 'error',

    // 優先使用模板字面量
    'prefer-template': 'error',

    // 要求使用 === 和 !==
    eqeqeq: ['error', 'always', { null: 'ignore' }],
  },
})
