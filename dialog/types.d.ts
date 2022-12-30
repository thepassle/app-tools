export type DialogNode = HTMLDialogElement & { form: HTMLFormElement };

export interface DialogCallbacks {
  opening?: <Parameters>(opts: {dialog: DialogNode, parameters: Parameters}) => void;
  opened?: <Parameters>(opts: {dialog: DialogNode, parameters: Parameters}) => void;
  closing?: (opts: {dialog: DialogNode}) => void;
  closed?: (opts: {dialog: DialogNode}) => void;
}

export type Config = Record<string, DialogCallbacks>;

export interface OpenDialogOptions {
  id: string;
  parameters?: object;
}