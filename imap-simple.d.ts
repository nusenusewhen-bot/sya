declare module 'imap-simple' {
  const imap: {
    connect(config: any): Promise<any>;
  };
  export default imap;
}
