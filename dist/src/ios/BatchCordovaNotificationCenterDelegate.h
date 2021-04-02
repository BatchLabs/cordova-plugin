//
//  Batch-Cordova-Plugin
//
//  Copyright © Batch.com. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>

NS_ASSUME_NONNULL_BEGIN

// Batch's Cordova plugin UNUserNotificationCenterDelegate
// Handles:
// - Forwarding calls to another delegate (chaining, rather than swizzling)
// - Giving notification callbacks to Batch
// - Delaying the initial push callbacks
// - Enabling/Disabling foreground notifications
@interface BatchCordovaNotificationCenterDelegate : NSObject <UNUserNotificationCenterDelegate>

/// Shared singleton BatchUNUserNotificationCenterDelegate.
/// Using this allows you to set the instance as UNUserNotificationCenter's delegate without having to retain it yourself.
/// The shared instance is lazily loaded.
@property (class, retain, readonly, nonnull) BatchCordovaNotificationCenterDelegate* sharedInstance;

/// Registers this class' sharedInstance as UNUserNotificationCenter's delegate, and stores the previous one as a property
+ (void)registerAsDelegate;

/// Should iOS display notifications even if the app is in foreground?
/// Default: false
@property (assign) BOOL showForegroundNotifications;

/// Previous delegate
@property (weak, nullable) id<UNUserNotificationCenterDelegate> previousDelegate;

/// Is Batch ready? When the SDK is started, it should tell this class and set this property to true: the delegate will then dequeue enqueued notifications.
@property (assign) BOOL isBatchReady;

@end

NS_ASSUME_NONNULL_END
