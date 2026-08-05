declare module 'seek-bzip' {
  export default class Bunzip {
    public static decode(data: Uint8Array, output?: Uint8Array): Uint8Array
  }
}
