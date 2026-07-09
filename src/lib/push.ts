import { pushApi } from "./api";

export function isSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getPermission(): NotificationPermission {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribe(): Promise<boolean> {
  if (!isSupported()) throw new Error("[push] not supported");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const registration = await navigator.serviceWorker.ready.catch((e) => {
    throw new Error("[push] serviceWorker.ready failed: " + e);
  });

  const { publicKey } = await pushApi.getVapidPublicKey().catch((e) => {
    throw new Error("[push] getVapidPublicKey failed: " + e);
  });

  const applicationServerKey = urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  }).catch((e) => {
    throw new Error("[push] pushManager.subscribe failed: " + e);
  });

  const keys = subscription.toJSON().keys ?? {};
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  await pushApi.subscribe({
    endpoint: subscription.endpoint,
    p256dh: keys.p256dh ?? "",
    auth: keys.auth ?? "",
    userAgent: navigator.userAgent,
    timezone,
  }).catch((e) => {
    throw new Error("[push] backend subscribe failed: " + e);
  });

  localStorage.setItem("push.endpoint", subscription.endpoint);
  return true;
}

export async function unsubscribe(): Promise<void> {
  if (!isSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await Promise.all([
    subscription.unsubscribe(),
    pushApi.unsubscribe({ endpoint: subscription.endpoint }).catch(() => {}),
  ]);
  localStorage.removeItem("push.endpoint");
}

export async function silentSync(): Promise<void> {
  if (!isSupported() || getPermission() !== "granted") return;

  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration) return;

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const vapid = await pushApi.getVapidPublicKey().catch(() => null);
    if (!vapid) return;

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid.publicKey).buffer as ArrayBuffer,
    }).catch(() => null);

    if (!subscription) return;
  }

  const endpoint = subscription.endpoint;
  if (endpoint === localStorage.getItem("push.endpoint")) return;

  const keys = subscription.toJSON().keys ?? {};
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  await pushApi.subscribe({
    endpoint,
    p256dh: keys.p256dh ?? "",
    auth: keys.auth ?? "",
    userAgent: navigator.userAgent,
    timezone,
  }).catch(() => null);

  localStorage.setItem("push.endpoint", endpoint);
}

export async function getSubscription(): Promise<PushSubscription | null> {
  if (!isSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}
