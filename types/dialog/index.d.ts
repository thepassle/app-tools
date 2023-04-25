export class Dialog extends EventTarget {
    /**
     *
     * @param {Config} config
     */
    constructor(config: Config);
    isOpen: boolean;
    opened: Promise<any>;
    __resolveOpened: (value: any) => void;
    closed: Promise<any>;
    __resolveClosed: (value: any) => void;
    /** @type {Context} */
    context: Context;
    /**
     * @returns {DialogNode}
     */
    __initDialogNode(): DialogNode;
    __onLightDismiss: ({ target }: {
        target: any;
    }) => void;
    close: (kind?: string) => void;
    __onDialogClose: () => Promise<void>;
    __dialog: import("./types.js").DialogNode;
    /**
     * @param {OpenDialogOptions} options
     * @returns
     */
    open({ id, parameters }: OpenDialogOptions): Promise<void>;
    /**
     * Can be used to modify the dialog
     *
     * @example
     * dialog.modify(node => {node.classList.add('foo')});
     * @param {(dialog: DialogNode | undefined) => void} cb
     */
    modify(cb: (dialog: DialogNode | undefined) => void): void;
    #private;
}
export type DialogNode = import('./types.js').DialogNode;
export type DialogCallbacks = import('./types.js').DialogCallbacks;
export type Config = import('./types.js').Config;
export type OpenDialogOptions = import('./types.js').OpenDialogOptions;
export type Context = import('./types.js').Context;
