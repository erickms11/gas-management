import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh }) => {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const THRESHOLD = 65;

  const handleForceUpdate = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }

      // 1. Atualizar e desregistrar Service Workers para limpar caches persistentes
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          try {
            await reg.update();
            await reg.unregister();
          } catch {
            // Continua mesmo se falhar
          }
        }
      }

      // 2. Limpar todos os caches do CacheStorage
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }

      // 3. Forçar recarregamento direto do servidor
      window.location.reload();
    } catch (err) {
      console.warn('Erro ao forçar atualização:', err);
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Ativa somente se estiver no topo da página
      if (window.scrollY <= 0) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      } else {
        isPullingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      if (diff > 0 && window.scrollY <= 0) {
        // Fórmula de resistência suave
        const distance = Math.min(100, Math.pow(diff, 0.82) * 1.5);
        setPullY(distance);

        // Feedback háptico ao atingir o limite
        if (distance >= THRESHOLD && pullY < THRESHOLD) {
          if ('vibrate' in navigator) {
            navigator.vibrate(15);
          }
        }
      } else {
        setPullY(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current || isRefreshing) return;
      isPullingRef.current = false;

      if (pullY >= THRESHOLD) {
        handleForceUpdate();
      } else {
        setPullY(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullY, isRefreshing]);

  if (pullY === 0 && !isRefreshing) return null;

  const isReady = pullY >= THRESHOLD;
  const rotation = Math.min(360, (pullY / THRESHOLD) * 360);

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        left: '50%',
        transform: `translateX(-50%) translateY(${isRefreshing ? 16 : pullY * 0.75}px)`,
        zIndex: 99999,
        pointerEvents: 'none',
        transition: isPullingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <div
        style={{
          background: isReady || isRefreshing
            ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.4) 0%, rgba(37, 99, 235, 0.5) 100%)'
            : 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isReady || isRefreshing
            ? '1px solid rgba(56, 189, 248, 0.65)'
            : '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: isReady || isRefreshing
            ? '0 8px 32px rgba(56, 189, 248, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.5)',
          borderRadius: '9999px',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#ffffff',
          fontSize: '0.82rem',
          fontWeight: 800,
        }}
      >
        <RefreshCw
          size={16}
          color={isReady || isRefreshing ? 'var(--primary)' : 'var(--text-muted)'}
          style={{
            transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.08s linear',
            animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
          }}
        />
        <span>
          {isRefreshing
            ? 'Atualizando aplicativo...'
            : isReady
            ? 'Solte para atualizar'
            : 'Puxe para carregar'}
        </span>
      </div>
    </div>
  );
};
