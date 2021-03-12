
import type { Interface } from 'readline'

declare function Read(options: Read.Options, callback: Read.Callback): void
declare function Read(options: Read.Options): Promise<[string, boolean]>
declare function Read(options: Read.Options): Promise<string>

declare namespace Read {
    type Callback = (error: any, value: string, isDefault: boolean) => void

    interface Options {
        /** 
         * The default value to pass if the input is 
         * empty. `isDefault` will be set to `true` if
         * this happens.
         */
        default?: string,

        /** Allow the user to change the default value */
        edit?: boolean,

        /** Prints this before reading input. */
        prompt?: string,

        /** The input stream. */
        input?: ReadableStream,

        /** The output stream. */
        output?: WritableStream,

        /** 
         * The character(s) to used instead of silenced 
         * characters. Requires `silent` to be `true`. 
         * 
         * @example
         * // Suppress password characters with '*'
         * const options = {
         *     prompt: 'Password: ',
         *     silent: true,
         *     replace: '*'
         * }
         */
        replace?: string,

        /**
         * Whether to pass the `isDefault` parameter to
         * the Promise. This option is only necessary if
         * using Promises, since in the callback, you can
         * just ignore the third argument. This defaults 
         * to `true`.
         */
        returnIsDefault?: boolean,

        /**
         * The function to run when a SIGINT (Ctrl-C
         * or equivalent) is sent. By default, this 
         * closes the `readline.Interface` instance 
         * and throws an error.
         * 
         * @param rl The `readline.Interface` used
         * by `read`. 
         * 
         * @example
         * function sigintHandler(rl: Interface): void {
         *     rl.close();
         *     console.log('Caught SIGINT');
         *     process.exit(1);
         * }
         */
        sigintHandler?: (rl: Interface) => void,

        /** Whether to suppress input. */
        silent?: boolean,

        /** 
         * Number of milliseconds to wait before 
         * canceling. After this amount of time,
         * an error will be thrown.
         */
        timeout?: number,

        /** 
         * Whether to assume the output is a TTY.
         * If set to `true`, `read` will assume it
         * is a TTY, whether it actually is or not.
         * If set to `false` or left empty, `read` 
         * will infer based on `output.isTTY`.
         */
        terminal?: boolean
    }
}

export = Read
