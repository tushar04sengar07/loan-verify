export interface NotificationPayload {
  recipientId: string;
  recipientPhone?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendFCMNotification(
  messaging: any,
  fcmToken: string,
  payload: NotificationPayload
): Promise<boolean> {
  if (!messaging || !fcmToken) {
    console.log(`[FCM-SIMULATION] To ${payload.recipientId}: "${payload.title}" — ${payload.body}`);
    return true;
  }

  try {
    await messaging.send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
    return true;
  } catch (err) {
    console.error('Failed to send FCM notification:', err);
    return false;
  }
}

export async function sendSMSAlert(
  phone: string,
  message: string
): Promise<boolean> {
  console.log(`[SMS-DISPATCH] To: ${phone} | Text: "${message}"`);
  return true;
}
