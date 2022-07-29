/**
 * `'installable'` event
 * @example pwa.dispatchEvent(new InstallableEvent());
 */
export class InstallableEvent extends Event {
  constructor() {
    super('installable');
  }
}

/**
 * `'installed'` event
 * @example pwa.dispatchEvent(new InstalledEvent(installed));
 */
export class InstalledEvent extends Event {
  /**
   * @param {boolean} installed
   */
  constructor(installed) {
    super('installed');
    this.installed = installed;
  }
}

/**
 * `'update-available'` event
 * @example pwa.dispatchEvent(new UpdateAvailableEvent());
 */
export class UpdateAvailableEvent extends Event {
  constructor() {
    super('update-available');
  }
}