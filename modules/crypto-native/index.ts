// Reexport the native module. On web, it will be resolved to CryptoNativeModule.web.ts
// and on native platforms to CryptoNativeModule.ts
export * from './src/CryptoNative.types';
export { default } from './src/CryptoNativeModule';

