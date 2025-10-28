// This file serves as an entry point for platform-specific implementations
// Metro bundler will use .native.tsx for iOS/Android and .web.tsx for web

export { default } from './LocationPicker.native';
export type { SelectedLocation } from './LocationPicker.native';
