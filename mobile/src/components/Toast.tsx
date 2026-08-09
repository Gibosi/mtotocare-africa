import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, Platform } from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (type: ToastType, message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {},
});

export const useToast = () => useContext(ToastContext);

const COLORS: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: '#059669', icon: '✓' },
  error:   { bg: '#DC2626', icon: '✕' },
  info:    { bg: '#334155', icon: 'ℹ' },
  warning: { bg: '#D97706', icon: '⚠' },
};

let _id = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const remove = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
    const tm = timers.current[id];
    if (tm) { clearTimeout(tm); delete timers.current[id]; }
  }, []);

  const show = useCallback((type: ToastType, message: string) => {
    if (!message) return;
    const id = ++_id;
    setToasts((cur) => [...cur, { id, type, message }]);
    const ttl = type === 'error' ? 5000 : 3000;
    timers.current[id] = setTimeout(() => remove(id), ttl);
  }, [remove]);

  const showSuccess = useCallback((m: string) => show('success', m), [show]);
  const showError   = useCallback((m: string) => show('error', m), [show]);
  const showInfo    = useCallback((m: string) => show('info', m), [show]);
  const showWarning = useCallback((m: string) => show('warning', m), [show]);

  useEffect(() => {
    const t = timers.current;
    return () => { Object.values(t).forEach(clearTimeout); };
  }, []);

  return (
    <ToastContext.Provider value={{ show, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: Platform.select({ ios: 60, android: 40, default: 40 }),
          left: 0,
          right: 0,
          zIndex: 9999,
          alignItems: 'center',
        }}
      >
        {toasts.map((t) => {
          const c = COLORS[t.type];
          return (
            <Animated.View
              key={t.id}
              style={{
                backgroundColor: c.bg,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 10,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                maxWidth: '90%',
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 5,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, marginRight: 10, fontWeight: '700' }}>{c.icon}</Text>
              <Text style={{ color: '#fff', fontSize: 14, flex: 1 }}>{t.message}</Text>
              <Pressable onPress={() => remove(t.id)} hitSlop={10} style={{ marginLeft: 10, padding: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '700' }}>✕</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
};
