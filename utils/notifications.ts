import * as Notifications from 'expo-notifications';

export async function setupNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge:  false,
      shouldShowBanner: true,
      shouldShowList: true,
    } as any),
  });
}

export async function sendDangerAlert(daysAway: number, shortfall: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚨 Danger Window in ' + daysAway + ' days',
      body:  `Projected shortfall of ₹${shortfall.toLocaleString('en-IN')}. Tap to see your one-tap fix.`,
      data:  { screen: 'forecast' },
    },
    trigger: null, // fire immediately
  });
}

export async function scheduleDailyBriefing(safeToSpend: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Good morning 👋',
      body:  `Safe to spend today: ₹${safeToSpend.toLocaleString('en-IN')}`,
    },
    trigger: { hour: 9, minute: 0, repeats: true } as any,
  });
}

export async function sendDoomAlert(count: number, total: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌀 ' + count + ' impulse purchases detected',
      body:  `₹${total} in micro-spends. Tap for a breathing reset.`,
      data:  { screen: 'doom' },
    },
    trigger: null,
  });
}
