import { NativeModule, requireNativeModule } from 'expo';

import { OtpNativeModuleEvents } from './OtpNative.types';

declare class OtpNativeModule extends NativeModule<OtpNativeModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<OtpNativeModule>('OtpNative');
