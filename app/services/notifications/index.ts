/**
 * Notifications Services
 * Epic 6: Push Notifications (푸시 알림)
 */

export {
  requestNotificationPermissions,
  getNotificationPermissionStatus,
  getExpoPushToken,
  getSavedPushToken,
  setupNotificationChannels,
  sendLocalNotification,
  scheduleNotification,
  getScheduledNotifications,
  cancelBenefitNotifications,
  cancelAllScheduledNotifications,
  setBadgeCount,
  clearBadgeCount,
  initializePushService,
  registerNotificationCategories,
} from './push-service';

export {
  saveNotification,
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationsByType,
  getNotificationsByDate,
  cleanupOldNotifications,
  createStoredNotification,
} from './notification-storage';

export {
  scheduleDeadlineAlerts,
  scheduleDeadlineAlertsForBenefits,
  getScheduledBenefitIds,
  getLastScheduleDate,
  shouldRefreshSchedule,
  cancelDeadlineAlerts,
  cancelAllDeadlineAlerts,
  getScheduledDeadlineAlertsCount,
  filterUpcomingDeadlines,
} from './deadline-scheduler';

export {
  detectNewBenefits,
  initializeKnownBenefits,
  getKnownBenefitCount,
  notifyNewBenefit,
  notifyNewBenefits,
  checkAndNotifyNewBenefits,
  canSendNotification,
  getRemainingNotifications,
  resetDailyNotificationCount,
  resetKnownBenefits,
} from './new-benefit-notifier';

export {
  notifyApplicationStatusChange,
  notifyApplicationApproved,
  notifyApplicationRejected,
  notifyApplicationSubmitted,
  shouldNotifyStatusChange,
  notifyReapplyGuidance,
  notifyAlternativeBenefits,
} from './result-notifier';
