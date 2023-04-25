export type BeforeInstallPromptEvent = Event & {
    prompt(): Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
};
export const pwa: Pwa;
/**
 * @typedef {Event & {
 *  prompt(): Promise<void>,
 *  userChoice: Promise<{
 *   outcome: 'accepted' | 'dismissed',
 *   platform: string
 *  }>
 * }} BeforeInstallPromptEvent
 */
declare class Pwa extends EventTarget {
    /** @type {boolean} */
    updateAvailable: boolean;
    /** @type {boolean} */
    installable: boolean;
    /** @type {BeforeInstallPromptEvent  | undefined} */
    installPrompt: BeforeInstallPromptEvent | undefined;
    /** @type {ServiceWorker | undefined} */
    __waitingServiceWorker: ServiceWorker | undefined;
    isInstalled: boolean;
    /** Triggers the install prompt, when it's available. You can call this method when the `'installable'` event has fired. */
    triggerPrompt: () => Promise<void>;
    /** Update */
    update: () => void;
    /**
     * @param {string} swPath
     * @param {RegistrationOptions} [opts]
     * @returns {Promise<ServiceWorkerRegistration> | Promise<void>}
     */
    register(swPath: string, opts?: RegistrationOptions): Promise<ServiceWorkerRegistration> | Promise<void>;
    kill(): Promise<void>;
}
export {};
