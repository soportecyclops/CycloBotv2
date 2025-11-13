// src/utils/helpers.js

// Utilidades generales para CyclopsBot v2.3.0

class Helpers {
    static generateId(prefix = '') {
        return prefix + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const value = start + (range * easeOutQuart);
            
            element.textContent = Math.round(value);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    static createParticle(x, y, color = '#00f3ff') {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            left: ${x}px;
            top: ${y}px;
        `;
        
        document.body.appendChild(particle);
        
        // Animación
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let opacity = 1;
        const animate = () => {
            opacity -= 0.02;
            particle.style.opacity = opacity;
            particle.style.transform = `translate(${vx * (1 - opacity) * 50}px, ${vy * (1 - opacity) * 50}px) scale(${opacity})`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        animate();
    }
    
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
    
    static getRandomColor() {
        const colors = ['#00f3ff', '#ff00ff', '#00ff88', '#ffaa00', '#aa00ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    static checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    static saveToStorage(key, data) {
        if (this.checkLocalStorage()) {
            try {
                localStorage.setItem(`cyclopsbot_${key}`, JSON.stringify(data));
                return true;
            } catch (e) {
                console.warn('No se pudo guardar en localStorage:', e);
                return false;
            }
        }
        return false;
    }
    
    static loadFromStorage(key) {
        if (this.checkLocalStorage()) {
            try {
                const data = localStorage.getItem(`cyclopsbot_${key}`);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.warn('No se pudo cargar desde localStorage:', e);
                return null;
            }
        }
        return null;
    }
    
    static removeFromStorage(key) {
        if (this.checkLocalStorage()) {
            try {
                localStorage.removeItem(`cyclopsbot_${key}`);
                return true;
            } catch (e) {
                console.warn('No se pudo eliminar de localStorage:', e);
                return false;
            }
        }
        return false;
    }
}

// Utilidades específicas para el sistema de progreso
class ProgressHelpers {
    static calculateStepPercentage(currentStep, totalSteps) {
        return ((currentStep - 1) / (totalSteps - 1)) * 100;
    }
    
    static getStepColor(step, totalSteps) {
        const percentage = this.calculateStepPercentage(step, totalSteps);
        const hue = (percentage / 100) * 120; // Verde (0) a Amarillo (120)
        return `hsl(${hue}, 100%, 50%)`;
    }
    
    static createStepTransition(fromStep, toStep) {
        return {
            from: fromStep,
            to: toStep,
            timestamp: Date.now(),
            duration: 500 // ms
        };
    }
}

// Exportar para uso global
window.CyclopsHelpers = Helpers;
window.ProgressHelpers = ProgressHelpers;