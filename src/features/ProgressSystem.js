// src/features/ProgressSystem.js - VERSIÓN SIMPLIFICADA
class ProgressSystem {
    constructor(cyclopsBot) {
        this.cyclopsBot = cyclopsBot;
        this.currentStep = 1;
        this.steps = [
            { level: 1, name: 'Categoría', icon: '🔍' },
            { level: 2, name: 'Subcategoría', icon: '📂' },
            { level: 3, name: 'Problema', icon: '❓' },
            { level: 4, name: 'Diagnóstico', icon: '💡' }
        ];
        
        this.init();
    }
    
    init() {
        console.log('🔄 Sistema de Progreso Visual inicializado');
        this.updateProgress(1);
    }
    
    updateProgress(level) {
        this.currentStep = level;
        this.updateStepElements();
        this.updateProgressBar();
        console.log(`📊 Progreso actualizado al nivel: ${level}`);
    }
    
    updateStepElements() {
        const steps = document.querySelectorAll('.progress-step');
        
        steps.forEach((step, index) => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            step.classList.remove('active', 'completed');
            
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
    }
    
    resetProgress() {
        this.currentStep = 1;
        this.updateProgress(1);
    }
}

// Hacer disponible globalmente
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressSystem;
}
