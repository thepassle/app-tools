/**
 * `'installable'` event
 * @example pwa.dispatchEvent(new InstallableEvent());
 */
export class InstallableEvent extends Event {
    constructor();
}
/**
 * `'installed'` event
 * @example pwa.dispatchEvent(new InstalledEvent(installed));
 */
export class InstalledEvent extends Event {
    /**
     * @param {boolean} installed
     */
    constructor(installed: boolean);
    installed: boolean;
}
/**
 * `'update-available'` event
 * @example pwa.dispatchEvent(new UpdateAvailableEvent());
 */
export class UpdateAvailableEvent extends Event {
    constructor();
}
