declare namespace BatchSDK {
  /**
   * Batch Configuration object
   */
  interface Config {
    /**
     * Your Android API Key
     */
    androidAPIKey?: string | null;

    /**
     * Your iOS API Key
     */
    iOSAPIKey?: string | null;

    /**
     * Sets whether the SDK can use the advertising identifier or not (default: true)
     *
     * The advertising identifier is also called "IDFA" on iOS.
     */
    canUseAdvertisingIdentifier?: boolean;
  }

  type BatchEventCallback = (
    eventName: string,
    parameters: { [key: string]: unknown }
  ) => void;

  /**
   * Represents a locations, using lat/lng coordinates
   */
  interface Location {
    /**
     * Latitude
     */
    latitude: number;

    /**
     * Longitude
     */
    longitude: number;

    /**
     * Date of the tracked location
     */
    date?: Date;

    /**
     * Precision radius in meters
     */
    precision?: number;
  }

  /**
   * Batch Cordova Module
   * @version 1.11.0
   * @exports batch
   */
  interface Batch {
    /**
     * Registers a listener for a given event. Multiple listeners can be set on an event.
     *
     * @param event The event name to listen to.
     * @param listener Function with two arguments : event name and parameters, called when an event occurs
     */
    on(event: string, listener: BatchEventCallback): void;

    /**
     * Unregisters all listeners for a given event, or all events.
     *
     * @param event The event name you wish to remove the listener for. If nothing is passed, all events are removed.
     */
    off(event?: string): void;

    /**
     * Set Batch's config. You're required to call this before start.
     *
     * If you don't want to specify one of the configuration options, simply omit the key.
     *
     * @param config The config to set
     */
    setConfig(config: Config): void;

    /**
     * Start Batch. You need to call setConfig beforehand.
     */
    start(): void;

    /**
     * Opt In to Batch SDK Usage.
     *
     * This method will be taken into account on next full application start (full process restart)
     *
     * Only useful if you called batch.optOut() or batch.optOutAndWipeData() or opted out by default in the manifest
     *
     * Some features might not be disabled until the next app start if you call this late into the application's life. It is strongly
     * advised to restart the application (or at least the current activity) after opting in.
     */
    optIn(): void;

    /**
     * Opt Out from Batch SDK Usage
     *
     * Note that calling the SDK when opted out is discouraged: Some modules might behave unexpectedly
     * when the SDK is opted-out from.
     *
     * Opting out will:
     * - Prevent batch.start()
     * - Disable any network capability from the SDK
     * - Disable all In-App campaigns
     * - Make the Inbox module return an error immediatly when used
     * - Make the SDK reject any editor calls
     * - Make the SDK reject calls to batch.user.trackEvent(), batch.user.trackTransaction(), batch.user.trackLocation() and any related methods
     *
     * Even if you opt in afterwards, data that has been generated while opted out WILL be lost.
     *
     * If you're also looking at deleting user data, please use batch.optOutAndWipeData()
     *
     * Note that calling this method will stop Batch.
     * Your app should be prepared to handle these cases.
     * Some features might not be disabled until the next app start.
     */
    optOut(): void;

    /**
     * Opt Out from Batch SDK Usage
     *
     * Same as batch.optOut(Context) but also wipes data.
     *
     * Note that calling this method will stop Batch.
     * Your app should be prepared to handle these cases.
     */
    optOutAndWipeData(): void;

    /**
     * Push module
     */
    push: PushModule;

    /**
     * User module
     */
    user: UserModule;

    /**
     * Messaging module
     */
    messaging: MessagingModule;

    /**
     * Inbox module
     */
    inbox: InboxModule;
  }

  /**
   * Deprecated Batch Event Data type (plain javascript object)
   *
   * Please use BatchEventData
   *
   * @deprecated
   */
  type LegacyBatchEventData = { [key: string]: unknown };

  /**
   * Batch's user module
   */
  interface UserModule {
    eventData: typeof BatchEventData;

    /**
     * Get the unique installation ID, generated by Batch. Batch must be started to read it.
     * You will get the result in a callback you need to provide to this function.
     * @param resultCallback Callback function. First and only argument is the Batch-generated installation ID. Might be null/undefined if Batch isn't started.
     */
    getInstallationID(resultCallback: (installationID: string) => void): void;

    /**
     * Get the user data editor. Don't forget to call save when you're done.
     * @return Batch user data editor
     */
    getEditor(): BatchUserDataEditor;

    /**
     * Print the currently known attributes and tags for a user to the logs.
     */
    printDebugInformation(): void;

    /**
     * Track an event. Batch must be started at some point, or events won't be sent to the server.
     * @param name The event name. Must be a string.
     * @param label The event label (optional). Must be a string.
     * @param data The event data (optional). Must be an object.
     */
    trackEvent(name: string, label?: string, data?: BatchEventData): void;

    /**
     * Track an event. Batch must be started at some point, or events won't be sent to the server.
     * @param name The event name. Must be a string.
     * @param label The event label (optional). Must be a string.
     * @param data The event data (optional). Must be an object.
     * @deprecated Use trackEvent(name: String, label: String, data: BatchEventData)
     */
    trackEvent(name: string, label?: string, data?: LegacyBatchEventData): void;

    /**
     * Track a transaction. Batch must be started at some point, or events won't be sent to the server.
     * @param amount Transaction's amount.
     * @param data The transaction data (optional). Must be an object.
     */
    trackTransaction(amount: number, data?: { [key: string]: unknown }): void;

    /**
     * Track a geolocation update
     * You can call this method from any thread. Batch must be started at some point, or location updates won't be sent to the server.
     * @param location User location object
     */
    trackLocation(location: Location): void;
  }

  /**
   * Batch's push module
   */
  interface PushModule {
    AndroidNotificationTypes: typeof AndroidNotificationTypes;
    iOSNotificationTypes: typeof iOSNotificationTypes;

    /**
     * Ask iOS users if they want to accept push notifications. Required to be able to push users.
     * No effect on Android.
     */
    registerForRemoteNotifications(): void;

    /**
     * Change the used remote notification types on Android. (Ex: sound, vibrate, alert)
     * Example : setAndroidNotificationTypes(batch.push.AndroidNotificationTypes.ALERT | batch.push.AndroidNotificationTypes.SOUND)
     * @param notifTypes Any combined value of the AndroidNotificationTypes enum.
     */
    setAndroidNotificationTypes(notifTypes: AndroidNotificationTypes): void;

    /**
     * Change the used remote notification types on iOS. (Ex: sound, vibrate, alert)
     * Example : setiOSNotificationTypes(batch.push.iOSNotificationTypes.ALERT | batch.push.iOSNotificationTypes.SOUND)
     * @param notifTypes Any combined value of the AndroidNotificationTypes enum.
     */
    setiOSNotificationTypes(notifTypes: iOSNotificationTypes): void;

    /**
     * Clear the app badge on iOS. No effect on Android.
     */
    clearBadge(): void;

    /**
     * Dismiss the app's shown notifications on iOS. Should be called on startup.
     * No effect on Android.
     */
    dismissNotifications(): void;

    /**
     * Gets the last known push token.
     * Batch MUST be started in order to use this method.
     * You will get the result in a callback you need to provide to this function.
     *
     * The returned token might be outdated and invalid if this method is called
     * too early in your application lifecycle.
     *
     * On iOS, your application should still register for remote notifications
     * once per launch, in order to keep this value valid.
     *
     * @param resultCallback Callback function. First and only argument is the last known push token (can be null or empty).
     */
    getLastKnownPushToken(resultCallback: (token: string) => void): void;
  }

  /**
   * Batch's messaging module
   */
  interface MessagingModule {
    /**
     * Toogles whether Batch should enter its "do not disturb" (DnD) mode or exit it.
     * While in DnD, Batch will not display landings, not matter if they've been triggered by notifications or an In-App Campaign, even in automatic mode.
     *
     * This mode is useful for times where you don't want Batch to interrupt your user, such as during a splashscreen, a video or an interstitial ad.
     *
     * If a message should have been displayed during DnD, Batch will enqueue it, overwriting any previously enqueued message.
     * When exiting DnD, Batch will not display the message automatically: you'll have to call the queue management methods to display the message, if you want to.
     *
     * Use batch.messaging.showPendingMessage() to show a pending message, if any.
     *
     * @param enabled Whether to enable, or disable "Do Not Disturb" mode
     */
    setDoNotDisturbEnabled(enabled: boolean): void;

    /**
     * Shows the currently enqueued message, if any.
     */
    showPendingMessage(): void;
  }

  /**
   * Batch's inbox module
   */
  interface InboxModule {
    NotificationSource: typeof InboxNotificationSource;

    /**
     * Fetch notifications for the current installation.
     * Only the 100 latest notifications will be fetched.
     *
     * @param callback Callback. A method that takes two parameters: error, which will contain the Error if any, and notifications, which will be an array of inbox notifications if no error occurred.
     */
    fetchNotifications(
      callback: (error?: Error, notifications?: InboxNotification[]) => void
    ): void;

    /**
     * Fetch notifications for the specified user identifier.
     * Only the 100 latest notifications will be fetched.
     *
     * @param identifier User identifier for which you want the notifications
     * @param authKey Secret authentication key: it should be computed your backend and given to this method. Information on how to compute it can be found in our online documentation.
     * @param callback Callback. A method that takes two parameters: error, which will contain the Error if any, and notifications, which will be an array of inbox notifications if no error occurred.
     */
    fetchNotificationsForUserIdentifier(
      userIdentifier: string,
      authenticationKey: string,
      callback: (error?: Error, notifications?: InboxNotification[]) => void
    ): void;
  }

  /**
   * User data editor
   */
  interface BatchUserDataEditor {
    /**
     * Set the application language. Overrides Batch's automatically detected language.
     * Send null to let Batch autodetect it again.
     * @param language Language code. 2 chars minimum, or null
     */
    setLanguage(language: string | null): BatchUserDataEditor;

    /**
     * Set the application region. Overrides Batch's automatically detected region.
     * Send "null" to let Batch autodetect it again.
     * @param region Region code. 2 chars minimum, or null
     */
    setRegion(region: string | null): BatchUserDataEditor;

    /**
     * Set a custom user identifier to Batch, you should use this method if you have your own login system.
     * Be careful: Do not use it if you don't know what you are doing, giving a bad custom user ID can result
     * in failure of targeted push notifications delivery or offer delivery and restore.
     * @param identifier Your custom identifier.
     */
    setIdentifier(identifier: string | null): BatchUserDataEditor;

    /**
     * Set an attribute for a key
     * @param key Attribute key. Cannot be null, empty or undefined. It should be made of letters, numbers or underscores ([a-z0-9_]) and can't be longer than 30 characters.
     * @param value Attribute value. Accepted types are numbers, booleans, Date objects and strings. Strings must not be empty or longer than 64 characters.
     */
    setAttribute(
      key: string,
      value: string | number | boolean | Date
    ): BatchUserDataEditor;

    /**
     * Remove an attribute
     * @param key The key of the attribute to remove
     */
    removeAttribute(key: string): BatchUserDataEditor;

    /**
     * Remove all attributes
     */
    clearAttributes(): BatchUserDataEditor;

    /**
     * Add a tag to a collection. If the collection doesn't exist it will be created.
     * @param collection The tag collection name. Cannot be null or undefined. Must be a string of letters, numbers or underscores ([a-z0-9_]) and can't be longer than 30 characters.
     * @param tag The tag to add. Cannot be null, undefined or empty. Must be a string no longer than 64 characters.
     */
    addTag(collection: string, tag: string): BatchUserDataEditor;

    /**
     * Remove a tag
     * @param collection The tag collection name. Cannot be null or undefined. Must be a string of letters, numbers or underscores ([a-z0-9_]) and can't be longer than 30 characters.
     * @param tag The tag name. Cannot be null, empty or undefined. If the tag doesn't exist, this method will do nothing.
     */
    removeTag(collection: string, tag: string): BatchUserDataEditor;

    /**
     * Removes all tags
     */
    clearTags(): BatchUserDataEditor;

    /**
     * Removes all tags from a collection
     * @param collection The tag collection name. Cannot be null or undefined. Must be a string of letters, numbers or underscores ([a-z0-9_]) and can't be longer than 30 characters.
     */
    clearTagCollection(collection: string): BatchUserDataEditor;

    /**
     * Save all of the pending changes made in that editor. This action cannot be undone.
     */
    save(): BatchUserDataEditor;
  }

  /**
   * Notification model from the Inbox module
   */
  interface InboxNotification {
    /**
     * Unique notification identifier. Do not make assumptions about its format: it can change at any time.
     */
    identifier: string;

    /**
     * Notification title (if present)
     */
    title?: string;

    /**
     * Notification alert body
     */
    body: string;

    /**
     * URL of the rich notification attachment (image/audio/video) - iOS Only
     */
    iOSAttachmentURL?: string;

    /**
     * Raw notification user data (also called payload)
     */
    payload: { [key: string]: unknown };

    /**
     * Date at which the push notification has been sent to the device
     */
    date: Date;

    /**
     * Flag indicating whether this notification is unread or not
     */
    isUnread: boolean;

    /**
     * The push notification's source, indicating what made Batch send it. It can come from a push campaign via the API or the dashboard, or from the transactional API, for example.
     */
    source: InboxModule["NotificationSource"];
  }

  /**
   * Object holding data to be associated to an event
   * Keys should be made of letters, numbers or underscores ([a-z0-9_]) and can't be longer than 30 characters.
   */
  class BatchEventData {
    /**
     * Add a tag
     *
     * @param tag Tag to add. Can't be longer than 64 characters, and can't be empty or null. For better results, you should trim/lowercase your strings, and use slugs when possible.
     * @return Same BatchEventData instance, for chaining
     */
    addTag(tag: string): BatchEventData;

    /**
     * Add a string attribute for the specified key
     *
     * @param key   Attribute key. Should be made of letters, numbers or underscores ([a-z0-9_]) and can't be longer than 30 characters.
     * @param value String value to add. Can't be longer than 64 characters, and can't be empty or null. For better results, you should trim/lowercase your strings, and use slugs when possible.
     * @return Same BatchEventData instance, for chaining
     */
    put(key: string, value: string): BatchEventData;

    /**
     * Add a number attribute for the specified key.
     *
     * Note that numbers with a decimal part might be handled differently. You might want to round the value before sending it to the SDK.
     *
     * @param key   Attribute key. Should be made of letters, numbers or underscores ([a-z0-9_]) and can't be longer than 30 characters.
     * @param value Number value to add.
     * @return Same BatchEventData instance, for chaining
     */
    put(key: string, value: number): BatchEventData;

    /**
     * Add a boolean attribute for the specified key
     *
     * @param key   Attribute key. Should be made of letters, numbers or underscores ([a-z0-9_]) and can't be longer than 30 characters.
     * @param value Boolean value to add.
     * @return Same BatchEventData instance, for chaining
     */
    put(key: string, value: boolean): BatchEventData;
  }

  /**
   * Android Notification Types enum.
   * This enum's implementation is available on batch.push.AndroidNotificationTypes.
   */
  enum AndroidNotificationTypes {
    NONE = 0,
    SOUND = 1 << 0,
    VIBRATE = 1 << 1,
    LIGHTS = 1 << 2,
    ALERT = 1 << 3,
  }

  /**
   * iOS Notification Types enum.
   * This enum's implementation is available on batch.push.iOSNotificationTypes.
   */
  enum iOSNotificationTypes {
    NONE = 0,
    BADGE = 1 << 0,
    SOUND = 1 << 1,
    ALERT = 1 << 2,
  }

  /**
   * Inbox Notification Source enum.
   * A notification source represents how the push was sent from Batch: via the Transactional API, or using a Push Campaign
   *
   * To be used with batch.inbox fetched notifications. This enum's implementation is available on batch.inbox.NotificationSource.
   */
  enum InboxNotificationSource {
    UNKNOWN = 0,
    CAMPAIGN = 1,
    TRANSACTIONAL = 2,
  }
}

// Cordova extensions
interface Window {
  batch: BatchSDK.Batch;
}

interface CordovaPlugins {
  batch: BatchSDK.Batch;
}

declare let batch: BatchSDK.Batch;
