// Web Push Notification utilities for TratorShop

const API = process.env.REACT_APP_BACKEND_URL;

// Check if push notifications are supported
export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Check current permission status
export const getNotificationPermission = () => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'granted', 'denied', or 'default'
};

// Request permission and subscribe
export const subscribeToNotifications = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  // Register service worker
  const registration = await navigator.serviceWorker.register('/sw-push.js');
  await navigator.serviceWorker.ready;

  // Get VAPID public key from server
  const response = await fetch(`${API}/push/vapid-public-key`, {
    credentials: 'include'
  });
  const { publicKey } = await response.json();

  // Convert VAPID key to Uint8Array
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  });

  // Send subscription to server
  const subscribeResponse = await fetch(`${API}/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth'))
      }
    })
  });

  if (!subscribeResponse.ok) {
    throw new Error('Failed to subscribe on server');
  }

  return subscription;
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
  }

  // Remove from server
  await fetch(`${API}/push/unsubscribe`, {
    method: 'DELETE',
    credentials: 'include'
  });

  return true;
};

// Check if currently subscribed
export const isSubscribed = async () => {
  if (!isPushSupported()) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
};

// Send test notification
export const sendTestNotification = async () => {
  const response = await fetch(`${API}/push/test`, {
    method: 'POST',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to send test notification');
  }
  
  return true;
};

// Helper: Convert URL-safe base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper: Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default {
  isPushSupported,
  getNotificationPermission,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  isSubscribed,
  sendTestNotification
};
