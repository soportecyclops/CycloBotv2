// script.js - CYCLOPSBOT v2.3.0 - VERSIÓN CORREGIDA
class CyclopsBotAvanzado {
    constructor() {
        this.currentCategory = null;
        this.currentSubcategory = null;
        this.currentProblem = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.diagnosisActive = false;
        this.sessionId = this.generateSessionId();
        this.diagnosticsCount = 0;
        
        // Sistema de refinamiento
        this.refinementLevel = 0;
        this.maxButtonsPerLevel = 6;
        
        // Base de datos de problemas organizada
        this.problemasPorCategoria = {
            'hardware': {
                'encendido': [
                    { id: 1, descripcion: 'Computadora no enciende o no arranca', icono: '🔌' },
                    { id: 2, descripcion: 'La computadora se apaga sola', icono: '⚡' },
                    { id: 3, descripcion: 'Problemas con la fuente de alimentación', icono: '🔋' }
                ],
                'rendimiento': [
                    { id: 4, descripcion: 'Memoria RAM insuficiente para aplicaciones', icono: '🧠' },
                    { id: 5, descripcion: 'La computadora funciona muy lenta', icono: '🐌' },
                    { id: 6, descripcion: 'Sobrecalentamiento del equipo', icono: '🔥' }
                ],
                'pantalla': [
                    { id: 7, descripcion: 'Pantalla en negro o sin señal', icono: '🖥️' },
                    { id: 8, descripcion: 'Píxeles muertos en la pantalla', icono: '🔳' },
                    { id: 9, descripcion: 'Problemas con la tarjeta gráfica', icono: '🎮' }
                ]
            },
            'software': {
                'windows': [
                    { id: 13, descripcion: 'Windows no inicia correctamente', icono: '🪟' },
                    { id: 14, descripcion: 'Pantalla azul de la muerte (BSOD)', icono: '💙' },
                    { id: 15, descripcion: 'Error de sistema operativo', icono: '❌' }
                ],
                'programas': [
                    { id: 16, descripcion: 'Programas que no se instalan', icono: '📥' },
                    { id: 17, descripcion: 'Aplicaciones que se cierran solas', icono: '🚪' },
                    { id: 18, descripcion: 'Software que no responde', icono: '⏳' }
                ],
                'virus': [
                    { id: 19, descripcion: 'Infección por virus o malware', icono: '🦠' },
                    { id: 20, descripcion: 'Rendimiento lento por software malicioso', icono: '🐢' },
                    { id: 21, descripcion: 'Pop-ups y anuncios no deseados', icono: '📢' }
                ]
            },
            'internet': {
                'wifi': [
                    { id: 25, descripcion: 'Conexión WiFi intermitente', icono: '📶' },
                    { id: 26, descripcion: 'No puedo conectarme al WiFi', icono: '🚫' },
                    { id: 27, descripcion: 'Señal WiFi débil', icono: '📡' }
                ],
                'velocidad': [
                    { id: 28, descripcion: 'Internet muy lento', icono: '🐌' },
                    { id: 29, descripcion: 'Velocidad de descarga baja', icono: '⬇️' },
                    { id: 30, descripcion: 'Problemas con la velocidad de subida', icono: '⬆️' }
                ],
                'conexion': [
                    { id: 31, descripcion: 'No hay conexión a Internet', icono: '🌐' },
                    { id: 32, descripcion: 'Conexión por cable no funciona', icono: '🔌' },
                    { id: 33, descripcion: 'Problemas con el router/módem', icono: '📡' }
                ]
            },
            'movil': {
                'bateria': [
                    { id: 34, descripcion: 'Batería se agota muy rápido', icono: '🔋' },
                    { id: 35, descripcion: 'El dispositivo no carga', icono: '⚡' },
                    { id: 36, descripcion: 'Sobrecalentamiento de la batería', icono: '🔥' }
                ],
                'senal': [
                    { id: 37, descripcion: 'Problemas de señal móvil', icono: '📶' },
                    { id: 38, descripcion: 'No hay conexión de datos', icono: '📱' },
                    { id: 39, descripcion: 'Llamadas que se cortan', icono: '📞' }
                ],
                'aplicaciones': [
                    { id: 40, descripcion: 'Aplicaciones que no funcionan', icono: '📱' },
                    { id: 41, descripcion: 'El teléfono se reinicia solo', icono: '🔄' },
                    { id: 42, descripcion: 'Problemas de almacenamiento', icono: '💾' }
                ]
            }
        };

        // Inicializar sistema de progreso
        this.progressSystem = new ProgressSystem(this);
        
        this.initializeBot();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    initializeBot() {
        this.limpiarChat();
        this.mostrarCategoriasPrincipales();
        this.setupEventListeners();
        this.updateStats();
        
        // Mostrar barra de progreso después de inicializar
        setTimeout(() => {
            this.mostrarBarraProgreso();
        }, 100);
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.handleQuickAction('start');
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.handleQuickAction('reset');
        });
        
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.handleQuickAction('help');
        });
    }

    // SISTEMA DE PROGRESO VISUAL
    mostrarBarraProgreso() {
        const progressSection = document.getElementById('progress-section');
        if (progressSection) {
            progressSection.style.display = 'block';
        }
    }

    ocultarBarraProgreso() {
        const progressSection = document.getElementById('progress-section');
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    }

    actualizarProgreso(nivel) {
        if (this.progressSystem) {
            this.progressSystem.updateProgress(nivel);
        }
    }

    // SISTEMA DE REFINAMIENTO PROGRESIVO
    async mostrarCategoriasPrincipales() {
        this.refinementLevel = 1;
        this.actualizarProgreso(1);
        
        const categoriasPrincipales = [
            { id: 'hardware', nombre: 'Hardware & PC', icono: '💻', descripcion: 'Problemas físicos y componentes' },
            { id: 'software', nombre: 'Software & Sistema', icono: '🖥️', descripcion: 'Sistema operativo y programas' },
            { id: 'internet', nombre: 'Internet & Redes', icono: '🌐', descripcion: 'Conexión y redes' },
            { id: 'movil', nombre: 'Dispositivos Móviles', icono: '📱', descripcion: 'Teléfonos y tablets' }
        ];

        this.mostrarBotonesRefinamiento(
            categoriasPrincipales,
            '🔍 **Selecciona el tipo de problema:**',
            (categoria) => this.seleccionarCategoriaPrincipal(categoria)
        );
    }

    async seleccionarCategoriaPrincipal(categoria) {
        this.currentCategory = categoria.id;
        this.refinementLevel = 2;
        this.actualizarProgreso(2);
        
        this.addMessage('user', `📂 ${categoria.icono} ${categoria.nombre}`);
        
        // Obtener subcategorías para esta categoría
        const subcategorias = Object.keys(this.problemasPorCategoria[categoria.id] || {}).map(sub => ({
            id: sub,
            nombre: this.getSubcategoryDisplayName(sub, categoria.id),
            icono: this.getSubcategoryIcon(sub)
        }));

        this.mostrarBotonesRefinamiento(
            subcategorias,
            '🎯 **¿Qué aspecto específico?**',
            (subcat) => this.seleccionarSubcategoria(subcat, categoria)
        );
    }

    async seleccionarSubcategoria(subcategoria, categoriaPadre) {
        this.currentSubcategory = subcategoria.id;
        this.refinementLevel = 3;
        this.actualizarProgreso(3);
        
        this.addMessage('user', `🎯 ${subcategoria.icono} ${subcategoria.nombre}`);

        // Obtener problemas específicos para esta subcategoría
        const problemas = this.problemasPorCategoria[categoriaPadre.id]?.[subcategoria.id] || [];
        
        if (problemas.length === 0) {
            this.addMessage('bot', '❌ No se encontraron problemas para esta subcategoría.');
            return;
        }

        this.mostrarBotonesRefinamiento(
            problemas.map(p => ({
                id: p.id,
                nombre: p.descripcion,
                icono: p.icono
            })),
            '❓ **Selecciona el problema exacto:**',
            (problema) => this.seleccionarProblemaRefinado(problema, problemas)
        );
    }

    async seleccionarProblemaRefinado(problemaSeleccionado, problemasLista) {
        const problemaCompleto = problemasLista.find(p => p.id === problemaSeleccionado.id);
        
        this.currentProblem = problemaCompleto;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        
        this.addMessage('user', `❓ ${problemaCompleto.descripcion}`);
        this.addMessage('bot', '🎯 **Iniciando diagnóstico detallado...**');

        this.actualizarProgreso(4);

        // Simular preguntas de diagnóstico
        setTimeout(() => {
            this.hacerSiguientePregunta();
        }, 1000);
    }

    // MÉTODO PRINCIPAL PARA MOSTRAR BOTONES
    mostrarBotonesRefinamiento(items, mensaje, onClickCallback) {
        this.limpiarBotones();
        
        // Solo mostrar el mensaje si no es el inicial
        if (this.refinementLevel > 1) {
            this.addMessage('bot', mensaje);
        }

        const botonesArea = document.getElementById('botonesArea');
        
        // Usar grid para mejor organización
        const gridContainer = document.createElement('div');
        gridContainer.className = 'botones-grid';
        
        items.forEach(item => {
            const boton = this.crearBoton(
                `${item.icono} ${item.nombre}`,
                () => onClickCallback(item),
                'primary'
            );
            boton.className += ' boton-categoria';
            gridContainer.appendChild(boton);
        });
        
        botonesArea.appendChild(gridContainer);

        // Botón para volver atrás (excepto en nivel 1)
        if (this.refinementLevel > 1) {
            const volverBoton = this.crearBoton(
                '↩️ Volver atrás',
                () => this.volverAtras(),
                'secondary'
            );
            volverBoton.className += ' back-button';
            botonesArea.appendChild(volverBoton);
        }
    }

    volverAtras() {
        this.refinementLevel = Math.max(1, this.refinementLevel - 1);
        this.actualizarProgreso(this.refinementLevel);
        
        if (this.refinementLevel === 1) {
            this.volverACategorias();
        } else if (this.refinementLevel === 2) {
            this.mostrarCategoriasPrincipales();
        }
    }

    // MÉTODOS AUXILIARES PARA REFINAMIENTO
    getSubcategoryDisplayName(subcategoria, categoria) {
        const nombres = {
            'hardware': {
                'encendido': 'Encendido y Arranque',
                'rendimiento': 'Rendimiento y Velocidad',
                'pantalla': 'Pantalla y Gráficos',
                'perifericos': 'Periféricos y Accesorios'
            },
            'software': {
                'windows': 'Windows y Sistema',
                'programas': 'Programas y Aplicaciones',
                'virus': 'Virus y Seguridad',
                'actualizaciones': 'Actualizaciones'
            },
            'internet': {
                'wifi': 'WiFi y Red Inalámbrica',
                'velocidad': 'Velocidad de Internet',
                'conexion': 'Conexión y Redes'
            },
            'movil': {
                'bateria': 'Batería y Energía',
                'senal': 'Señal y Conectividad',
                'aplicaciones': 'Aplicaciones y Apps'
            }
        };
        return nombres[categoria]?.[subcategoria] || subcategoria;
    }

    getSubcategoryIcon(subcategoria) {
        const icons = {
            'encendido': '🔌', 'rendimiento': '🚀', 'pantalla': '🖥️', 'perifericos': '🖱️',
            'windows': '🪟', 'programas': '📱', 'virus': '🛡️', 'actualizaciones': '🔄',
            'wifi': '📶', 'velocidad': '⚡', 'conexion': '🔗',
            'bateria': '🔋', 'senal': '📡', 'aplicaciones': '📲'
        };
        return icons[subcategoria] || '🔧';
    }

    // MÉTODOS DE DIAGNÓSTICO
    async hacerSiguientePregunta() {
        const preguntas = [
            "¿El problema comenzó recientemente?",
            "¿Has intentado reiniciar el dispositivo?",
            "¿El problema ocurre constantemente o es intermitente?"
        ];

        if (this.currentQuestionIndex >= preguntas.length) {
            await this.mostrarSoluciones();
            return;
        }

        const pregunta = preguntas[this.currentQuestionIndex];
        this.addMessage('bot', `❓ **Pregunta ${this.currentQuestionIndex + 1}:** ${pregunta}`);
        
        this.mostrarBotonesRespuesta();
    }

    mostrarBotonesRespuesta() {
        this.limpiarBotones();
        
        const respuestas = [
            { texto: '✅ Sí', valor: 'sí' },
            { texto: '❌ No', valor: 'no' },
            { texto: '🤔 No sé', valor: 'no_se' }
        ];

        const botonesArea = document.getElementById('botonesArea');
        const gridContainer = document.createElement('div');
        gridContainer.className = 'botones-grid';
        
        respuestas.forEach(respuesta => {
            const boton = this.crearBoton(
                respuesta.texto,
                () => this.procesarRespuesta(respuesta.valor),
                respuesta.valor === 'sí' ? 'success' : 'danger'
            );
            gridContainer.appendChild(boton);
        });
        
        botonesArea.appendChild(gridContainer);
    }

    async procesarRespuesta(respuesta) {
        this.userAnswers.push(respuesta);
        this.addMessage('user', `💬 ${respuesta === 'sí' ? 'Sí' : respuesta === 'no' ? 'No' : 'No sé'}`);
        
        this.currentQuestionIndex++;
        await this.hacerSiguientePregunta();
    }

    async mostrarSoluciones() {
        this.addMessage('bot', '🎉 **¡Diagnóstico completado!**');
        this.addMessage('bot', '🔧 **Soluciones recomendadas:**');

        const soluciones = [
            "Verifica las conexiones de alimentación",
            "Actualiza los controladores del dispositivo",
            "Ejecuta el solucionador de problemas de Windows",
            "Consulta con un técnico especializado si el problema persiste"
        ];

        soluciones.forEach((solucion, index) => {
            this.addMessage('bot', `${index + 1}. ${solucion}`);
        });

        // Incrementar contador de diagnósticos
        this.diagnosticsCount++;
        this.updateStats();
        
        this.mostrarBotonesFinales();
        this.diagnosisActive = false;
    }

    mostrarBotonesFinales() {
        this.limpiarBotones();
        const botonesArea = document.getElementById('botonesArea');
        
        const botones = [
            { texto: '🔄 Nuevo diagnóstico', action: () => this.nuevoDiagnostico(), type: 'primary' },
            { texto: '⭐ Útil', action: () => this.calificarSolucion('util'), type: 'success' }
        ];

        botones.forEach(boton => {
            const elemento = this.crearBoton(boton.texto, boton.action, boton.type);
            botonesArea.appendChild(elemento);
        });
    }

    // MÉTODOS UTILITARIOS
    crearBoton(texto, onClick, tipo = 'primary') {
        const boton = document.createElement('button');
        boton.className = `cyber-btn ${tipo}`;
        boton.innerHTML = texto;
        boton.style.width = '100%';
        boton.style.padding = '8px';
        boton.style.fontSize = '0.75rem';
        boton.style.margin = '2px 0';
        boton.addEventListener('click', onClick);
        return boton;
    }

    limpiarBotones() {
        const botonesArea = document.getElementById('botonesArea');
        if (botonesArea) {
            botonesArea.innerHTML = '';
        }
    }

    limpiarChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
    }

    addMessage(sender, content) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = content;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        setTimeout(() => chatMessages.scrollTop = chatMessages.scrollHeight, 50);
    }

    async nuevoDiagnostico() {
        this.resetEstado();
        this.addMessage('bot', '🔄 **Nuevo diagnóstico...**');
        await this.mostrarCategoriasPrincipales();
    }

    volverACategorias() {
        this.resetEstado();
        this.addMessage('bot', '↩️ **Volviendo al inicio...**');
        this.mostrarCategoriasPrincipales();
    }

    resetEstado() {
        this.diagnosisActive = false;
        this.currentCategory = null;
        this.currentSubcategory = null;
        this.currentProblem = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.refinementLevel = 0;
        
        // Resetear progreso visual
        this.actualizarProgreso(1);
    }

    updateStats() {
        const problemsCount = document.getElementById('problemsCount');
        const diagnosticsCount = document.getElementById('diagnosticsCount');

        if (problemsCount) problemsCount.textContent = '42';
        if (diagnosticsCount) diagnosticsCount.textContent = this.diagnosticsCount;
    }

    handleQuickAction(action) {
        switch (action) {
            case 'start': 
                this.nuevoDiagnostico(); 
                break;
            case 'reset': 
                this.resetBot(); 
                break;
            case 'help': 
                this.mostrarAyuda(); 
                break;
        }
    }

    mostrarAyuda() {
        this.addMessage('bot', 'ℹ️ **SISTEMA DE REFINAMIENTO v2.3.0**');
        this.addMessage('bot', '1. **Selecciona categoría principal**');
        this.addMessage('bot', '2. **Elige subcategoría específica**');
        this.addMessage('bot', '3. **Selecciona problema exacto**');
        this.addMessage('bot', '4. **Responde preguntas de diagnóstico**');
        this.addMessage('bot', '');
        this.addMessage('bot', '👁️ **Barra de progreso visual:** Sigue tu avance en tiempo real');
    }

    resetBot() {
        this.limpiarChat();
        this.limpiarBotones();
        this.resetEstado();
        this.initializeBot();
    }

    calificarSolucion(calificacion) {
        this.addMessage('user', `⭐ Calificación: ${calificacion}`);
        this.addMessage('bot', '¡Gracias por tu feedback!');
    }
}

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 Iniciando CyclopsBot v2.3.0...');
        window.cyclopsBot = new CyclopsBotAvanzado();
        console.log('✅ CyclopsBot v2.3.0 inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar CyclopsBot:', error);
    }
});
