export class DialogStateEvent extends Event {
  /** 
   * @param {'opening' | 'opened' | 'closing' | 'closed'} kind
   * @param {import('./types.js').Context} context
   */
  constructor(kind, context) {
    super(kind);
    this.context = context;
  }
}