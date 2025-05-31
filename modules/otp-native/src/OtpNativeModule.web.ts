import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './OtpNative.types';

type OtpNativeModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class OtpNativeModule extends NativeModule<OtpNativeModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(OtpNativeModule, 'OtpNativeModule');
