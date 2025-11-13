// src/features/ProgressSystem.js
class ProgressSystem {
    constructor(cyclopsBot) {
        this.cyclopsBot = cyclopsBot;
        this.currentStep = 1;
        this.steps = [
            { level: 1, name: 'Categoría', icon: '🔍', description: 'Selección del tipo de problema' },
            { level: 2, name: 'Subcategoría', icon: '📂', description: 'Especificación del área' },
            { level: 3, name: 'Problema', icon: '❓', description: 'Identificación del problema exacto' },
            { level: 4, name: 'Diagnóstico', icon: '💡', description: 'Análisis y soluciones' }
        ];
        
        this.init();
    }
    
    init() {
        console.log('🔄 Sistema de Progreso Visual v2.3.0 inicializado');
        this.bindEvents();
        this.updateProgress(1);
        this.createProgressInfo();
    }
    
    bindEvents() {
        // Escuchar cambios en el nivel de refinamiento
        document.addEventListener('refinementLevelChanged', (event) => {
            this.updateProgress(event.detail.level);
        });
        
        // Escuchar reset del sistema
        document.addEventListener('systemReset', () => {
            this.resetProgress();
        });
        
        // Escuchar inicio de diagnóstico
        document.addEventListener('diagnosisStarted', () => {
            this.updateProgress(4);
        });
        
        // Escuchar finalización de diagnóstico
        document.addEventListener('diagnosisCompleted', () => {
            this.completeProgress();
        });
    }
    
    updateProgress(level) {
        const previousStep = this.currentStep;
        this.currentStep = level;
        
        console.log(`📊 Progreso actualizado: ${previousStep} → ${level}`);
        
        // Actualizar elementos visuales
        this.updateStepElements();
        this.updateProgressBar();
        this.updateProgressInfo();
        this.animateTransition(previousStep);
        
        // Efectos de partículas en transiciones importantes
        if (level > previousStep) {
            this.createParticleEffect(previousStep, level);
        }
    }
    
    updateStepElements() {
        const steps = document.querySelectorAll('.progress-step');
        
        steps.forEach((step, index) => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            
            // Remover todas las clases de estado
            step.classList.remove('active', 'completed', 'error', 'warning');
            
            // Aplicar clases según el estado
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }
    
    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        if (!progressFill) return;
        
        const percentage = ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
        progressFill.style.width = `${percentage}%`;
        
        console.log(`📈 Barra de progreso: ${percentage.toFixed(1)}%`);
    }
    
    updateProgressInfo() {
        let progressInfo = document.querySelector('.progress-info');
        if (!progressInfo) {
            progressInfo = this.createProgressInfo();
        }
        
        const percentage = ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
        const currentStepInfo = this.steps[this.currentStep - 1];
        
        progressInfo.innerHTML = `
            <span class="progress-percentage">${percentage.toFixed(0)}%</span> 
            • Paso ${this.currentStep} de ${this.steps.length}: ${currentStepInfo.description}
        `;
    }
    
    createProgressInfo() {
        const progressContainer = document.querySelector('.progress-container');
        if (!progressContainer) return null;
        
        const progressInfo = document.createElement('div');
        progressInfo.className = 'progress-info';
        progressContainer.appendChild(progressInfo);
        
        return progressInfo;
    }
    
    animateTransition(previousStep) {
        const activeStep = document.querySelector('.progress-step.active');
        if (activeStep) {
            // Reset animation
            activeStep.style.animation = 'none';
            setTimeout(() => {
                activeStep.style.animation = 'pulseStep 0.6s ease';
            }, 10);
        }
        
        // Efecto de brillo en la sección de progreso
        const progressSection = document.querySelector('.progress-section');
        if (progressSection) {
            progressSection.style.background = 'linear-gradient(135deg, var(--dark) 0%, #1a1a3a 100%)';
            setTimeout(() => {
                progressSection.style.background = 'linear-gradient(135deg, var(--dark) 0%, #151530 100%)';
            }, 300);
        }
    }
    
    createParticleEffect(fromStep, toStep) {
        const fromElement = document.querySelector(`.progress-step[data-step="${fromStep}"] .step-icon`);
        const toElement = document.querySelector(`.progress-step[data-step="${toStep}"] .step-icon`);
        
        if (!fromElement || !toElement) return;
        
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Crear partículas de transición
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createParticle(fromRect, toRect);
            }, i * 100);
        }
    }
    
    createParticle(fromRect, toRect) {
        const particle = document.createElement('div');
        particle.className = 'progress-particle';
        
        // Posición inicial
        const startX = fromRect.left + fromRect.width / 2;
        const startY = fromRect.top + fromRect.height / 2;
        
        // Posición final
        const endX = toRect.left + toRect.width / 2;
        const endY = toRect.top + toRect.height / 2;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        document.querySelector('.progress-section').appendChild(particle);
        
        // Animación
        setTimeout(() => {
            particle.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
            particle.style.opacity = '1';
            particle.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.5)`;
        }, 10);
        
        // Remover partícula
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
    
    resetProgress() {
        console.log('🔄 Reiniciando sistema de progreso');
        this.currentStep = 1;
        this.updateProgress(1);
        
        // Efecto visual de reset
        const progressSection = document.querySelector('.progress-section');
        if (progressSection) {
            progressSection.style.opacity = '0.7';
            setTimeout(() => {
                progressSection.style.opacity = '1';
            }, 300);
        }
    }
    
    completeProgress() {
        console.log('✅ Progreso completado');
        this.updateProgress(4);
        
        // Efecto de finalización
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach(step => {
            step.classList.add('completed');
        });
        
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.background = 'linear-gradient(90deg, var(--success), var(--accent))';
        }
    }
    
    setErrorState(stepNumber) {
        const step = document.querySelector(`.progress-step[data-step="${stepNumber}"]`);
        if (step) {
            step.classList.add('error');
        }
    }
    
    setWarningState(stepNumber) {
        const step = document.querySelector(`.progress-step[data-step="${stepNumber}"]`);
        if (step) {
            step.classList.add('warning');
        }
    }
    
    // Método para obtener el progreso actual
    getCurrentProgress() {
        return {
            currentStep: this.currentStep,
            totalSteps: this.steps.length,
            percentage: ((this.currentStep - 1) / (this.steps.length - 1)) * 100,
            currentStepName: this.steps[this.currentStep - 1]?.name || 'Desconocido',
            currentStepDescription: this.steps[this.currentStep - 1]?.description || ''
        };
    }
    
    // Método para forzar un paso específico (útil para debugging)
    setStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.steps.length) {
            this.updateProgress(stepNumber);
            return true;
        }
        return false;
    }
    
    // Método para obtener estadísticas del progreso
    getProgressStats() {
        const progress = this.getCurrentProgress();
        return {
            ...progress,
            timeEstimate: this.calculateTimeEstimate(),
            nextStep: this.steps[this.currentStep] || null,
            isComplete: this.currentStep === this.steps.length
        };
    }
    
    calculateTimeEstimate() {
        const estimates = [1, 2, 3, 5]; // minutos estimados por paso
        const remainingSteps = this.steps.length - this.currentStep;
        return estimates.slice(this.currentStep - 1).reduce((a, b) => a + b, 0);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressSystem;
}