export class DialogStateEvent extends Event {
  /** 
   * @param {'opening' | 'opened' | 'closing' | 'closed'} kind
   * @param {{
   *  id: string,
   *  dialog: import('./index.js').DialogNode,
   * }} opts 
   */
  constructor(kind, {id, dialog}) {
    super(kind);
    this.dialog = dialog;
    this.id = id;
  }
}