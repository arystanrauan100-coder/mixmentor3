// Re-export from input-otp npm package via require to bypass TypeScript's
// baseUrl resolution that would confuse "input-otp" with root input-otp.tsx
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("input-otp") as {
  OTPInput: import("react").ForwardRefExoticComponent<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OTPInputContext: import("react").Context<any>;
};

export const OTPInput = pkg.OTPInput;
export const OTPInputContext = pkg.OTPInputContext;
