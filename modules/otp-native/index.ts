// Reexport the native module. On web, it will be resolved to OtpNativeModule.web.ts
// and on native platforms to OtpNativeModule.ts
export * from './src/OtpNative.types';
export { default } from './src/OtpNativeModule';

