export type DialogNode = HTMLDialogElement & {
    form: HTMLFormElement;
};
export interface DialogCallbacks {
    opening?: <Parameters>(context: Context) => void;
    opened?: <Parameters>(context: Context) => void;
    closing?: (context: Context) => void;
    closed?: (context: Context) => void;
}
export type Config = Record<string, DialogCallbacks>;
export interface OpenDialogOptions {
    id: string;
    parameters?: object;
}
export interface Context {
    dialog: DialogNode | undefined;
    id: string;
    parameters?: Record<string, any>;
}
