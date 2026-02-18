import { defineConfig } from '@soybeanjs/eslint-config';

export default defineConfig(
  { vue: true },
  {
    rules: {
      // 'vue/multi-word-component-names': [
      //   'warn',
      //   {
      //     ignores: ['index', 'App', '[id]']
      //   }
      // ],
      // 'vue/component-name-in-template-casing': [
      //   'warn',
      //   'PascalCase',
      //   {
      //     ignores: ['/^icon-/']
      //   }
      // ],
      'vue/multi-word-component-names': 'off',
      'vue/no-setup-props-reactivity-loss': 'off',
      'vue/no-ref-object-reactivity-loss': 'off',
      'vue/no-duplicate-attr-inheritance': 'off',
      'vue/no-static-inline-styles': 'off',
      'vue/define-emits-declaration': 'off',
      'vue/block-order': ['warn', { order: ['template', 'script', 'style'] }],
      'no-console': 'off',
      'max-params': 'off',
      'vue/prefer-true-attribute-shorthand': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'vue/html-comment-content-newline': 'off',
      'require-atomic-updates': 'off',
      'class-methods-use-this': 'off',
      '@typescript-eslint/require-atomic-updates': 'off',
      complexity: ['error', { max: 40 }],
      'no-await-in-loop': 'off'
    }
  }
);
