export class DialogStateEvent extends Event {
    /**
     * @param {'opening' | 'opened' | 'closing' | 'closed'} kind
     * @param {import('./types.js').Context} context
     */
    constructor(kind: 'opening' | 'opened' | 'closing' | 'closed', context: import('./types.js').Context);
    context: import("./types.js").Context;
}
