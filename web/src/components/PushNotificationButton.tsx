'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

interface PushNotificationButtonProps {
  truthId?: string;
  className?: string;
}

export default function PushNotificationButton({ truthId, className = '' }: PushNotificationButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        alert('Bildirim izni gerekli');
        setIsLoading(false);
        return;
      }

      // Get VAPID public key
      const response = await fetch('/api/push/subscribe');
      const { vapidPublicKey } = await response.json();

      if (!vapidPublicKey) {
        alert('Push bildirimleri sunucuda yapilandirilmamis');
        setIsLoading(false);
        return;
      }

      // Subscribe to push
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          truthId,
        }),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Bildirim aboneligi basarisiz');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove from server
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }

      setIsSubscribed(false);
    } catch (error) {
      console.error('Unsubscribe error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert VAPID key to Uint8Array
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
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

  if (!isSupported) {
    return null;
  }

  if (permission === 'denied') {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 text-gray-500 cursor-not-allowed ${className}`}
        title="Bildirimler tarayici tarafindan engellendi"
      >
        <BellOff className="w-4 h-4" />
        <span className="text-sm">Engellendi</span>
      </button>
    );
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isSubscribed
          ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      <span className="text-sm">
        {isLoading ? 'Yukleniyor...' : isSubscribed ? 'Bildirimler Acik' : 'Bildirimleri Ac'}
      </span>
    </button>
  );
}
