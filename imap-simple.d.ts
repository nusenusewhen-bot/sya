declare module 'imap-simple' {
  export const imap: any;
  export function connect(config: any): Promise<any>;
  // Minimal types - enough to silence the error
}
