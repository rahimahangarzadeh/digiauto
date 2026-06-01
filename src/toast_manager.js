/* Toast-Benachrichtigungen für Freigaben */

window.toastManager = {
  toasts: [],
  
  show: function(message, type = 'success', duration = 3000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type, visible: true };
    this.toasts.push(toast);
    this.render();
    
    // Auto-remove nach duration
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this.render();
    }, duration);
  },

  render: function() {
    // Entferne alten Container
    const old = document.getElementById('toast-container');
    if (old) old.remove();

    // Erstelle neuen Container
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      zIndex: 9999;
      display: flex;
      flexDirection: column;
      gap: 8px;
      pointerEvents: none;
    `;

    // Füge CSS-Animation ein (einmalig)
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-item {
          animation: slideIn 300ms ease-out;
        }
      `;
      document.head.appendChild(style);
    }

    // Füge alle Toasts hinzu
    this.toasts.forEach(toast => {
      const el = document.createElement('div');
      el.className = 'toast-item';
      const bgColor = toast.type === 'success' ? '#3f7a4a' : toast.type === 'error' ? '#a13232' : '#2d6fa3';
      el.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 12px 16px;
        borderRadius: 8px;
        fontSize: 13px;
        fontWeight: 500;
        boxShadow: 0 4px 12px rgba(0,0,0,0.15);
        pointerEvents: auto;
        maxWidth: 320px;
        wordWrap: break-word;
      `;
      el.textContent = toast.message;
      container.appendChild(el);
    });

    // WICHTIG: Append to body AFTER adding toasts
    if (this.toasts.length > 0) {
      document.body.appendChild(container);
    }
  }
};

