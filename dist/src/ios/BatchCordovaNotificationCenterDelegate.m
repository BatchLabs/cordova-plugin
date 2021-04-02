//
//  Batch-Cordova-Plugin
//
//  Copyright © Batch.com. All rights reserved.
//

#import "BatchCordovaNotificationCenterDelegate.h"

#import <Batch/BatchPush.h>

@implementation BatchCordovaNotificationCenterDelegate
{
    BOOL _isBatchReady;
    NSMutableArray<UNNotificationResponse*>* _enqueuedNotificationResponses;
}

+ (void)load
{
    [[NSNotificationCenter defaultCenter] addObserver:[BatchCordovaNotificationCenterDelegate class]
                                             selector:@selector(applicationFinishedLaunching:) name:UIApplicationDidFinishLaunchingNotification
                                               object:nil];
}

+ (void)applicationFinishedLaunching:(NSNotification*)notification {
    [BatchCordovaNotificationCenterDelegate registerAsDelegate];
}

+ (BatchCordovaNotificationCenterDelegate *)sharedInstance
{
    static BatchCordovaNotificationCenterDelegate *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[BatchCordovaNotificationCenterDelegate alloc] init];
    });
    
    return sharedInstance;
}

+ (void)registerAsDelegate
{
    UNUserNotificationCenter *notifCenter = [UNUserNotificationCenter currentNotificationCenter];
    BatchCordovaNotificationCenterDelegate *instance = [self sharedInstance];
    instance.previousDelegate = notifCenter.delegate;
    notifCenter.delegate = instance;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        _showForegroundNotifications = false;
        _isBatchReady = false;
        _enqueuedNotificationResponses = [NSMutableArray new];
    }
    return self;
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
    [BatchPush handleUserNotificationCenter:center willPresentNotification:notification willShowSystemForegroundAlert:self.showForegroundNotifications];
    
    id<UNUserNotificationCenterDelegate> chainDelegate = self.previousDelegate;
    // It's the chain delegate's responsibility to call the completionHandler
    if ([chainDelegate respondsToSelector:@selector(userNotificationCenter:willPresentNotification:withCompletionHandler:)]) {
        [chainDelegate userNotificationCenter:center
                      willPresentNotification:notification
                        withCompletionHandler:completionHandler];
    } else {
        UNNotificationPresentationOptions options = UNNotificationPresentationOptionNone;
        if (self.showForegroundNotifications) {
            options = UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound;
            
#ifdef __IPHONE_14_0
            if (@available(iOS 14.0, *)) {
                options = options | UNNotificationPresentationOptionList | UNNotificationPresentationOptionBanner;
            } else {
                options = options | UNNotificationPresentationOptionAlert;
            }
#else
            options = options | UNNotificationPresentationOptionAlert;
#endif
        }
        
        if (completionHandler) {
            completionHandler(options);
        };
    }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
    if (_isBatchReady) {
        [BatchPush handleUserNotificationCenter:center didReceiveNotificationResponse:response];
    } else {
        [self enqueueNotificationResponse:response];
    }
    
    id<UNUserNotificationCenterDelegate> chainDelegate = self.previousDelegate;
    // It's the chain delegate's responsibility to call the completionHandler
    if ([chainDelegate respondsToSelector:@selector(userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:)]) {
        [chainDelegate userNotificationCenter:center
               didReceiveNotificationResponse:response
                        withCompletionHandler:completionHandler];
    } else {
        if (completionHandler) {
            completionHandler();
        }
    }

}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center openSettingsForNotification:(UNNotification *)notification
{
    if (@available(iOS 12.0, *)) {
        id<UNUserNotificationCenterDelegate> chainDelegate = self.previousDelegate;
        if ([chainDelegate respondsToSelector:@selector(userNotificationCenter:openSettingsForNotification:)]) {
            [self.previousDelegate userNotificationCenter:center
                              openSettingsForNotification:notification];
        }
    }
}

- (BOOL)isBatchReady {
    return _isBatchReady;
}

- (void)setIsBatchReady:(BOOL)isBatchReady {
    _isBatchReady = isBatchReady;
    if (isBatchReady) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            [self dequeueNotificationResponses];
        });
    }
}

- (void)enqueueNotificationResponse:(UNNotificationResponse*)notificationResponse {
    @synchronized (_enqueuedNotificationResponses) {
        [_enqueuedNotificationResponses addObject:notificationResponse];
    }
}

- (void)dequeueNotificationResponses {
    NSArray<UNNotificationResponse*> *notificationResponses;
    @synchronized (_enqueuedNotificationResponses) {
        notificationResponses = [_enqueuedNotificationResponses copy];
        [_enqueuedNotificationResponses removeAllObjects];
    }
    
    for (UNNotificationResponse *notificationResponse in notificationResponses) {
        [BatchPush handleUserNotificationCenter:UNUserNotificationCenter.currentNotificationCenter
                 didReceiveNotificationResponse:notificationResponse];
    }
}

@end
