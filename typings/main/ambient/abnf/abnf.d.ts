// Compiled using typings@0.3.4
// Source: custom_typings/abnf.d.ts
declare module abnf {
  function Parse(input:string, calback?:Function):any;
}

declare module 'abnf' {
  export = abnf;
}