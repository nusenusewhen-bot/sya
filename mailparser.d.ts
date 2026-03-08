declare module 'mailparser' {
  export function simpleParser(source: string | Buffer): Promise<any>;
  // Minimal — just enough to silence the error
}
