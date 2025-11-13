// script.js - CYCLOPSBOT v2.3.0 CON SISTEMA DE PROGRESO VISUAL
class CyclopsBotAvanzado {
    constructor() {
        this.supabaseUrl = 'https://nmpvbcfbrhtcfyovjzul.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcHZiY2Zicmh0Y2Z5b3ZqenVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQ0NjAsImV4cCI6MjA3ODYwMDQ2MH0.9-FalpRfqQmD_72ZDbVnBbN7EU7lwgzsX2zNWz8er_4';
        
        this.supabase = null;
        this.currentCategory = null;
        this.currentSubcategory = null;
        this.currentProblem = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.diagnosisActive = false;
        this.sessionId = this.generateSessionId();
        
        // Sistema de refinamiento
        this.refinementLevel = 0;
        this.maxButtonsPerLevel = 6;
        
        // Sistema de Progreso Visual - NUEVO en v2.3.0
        this.progressSystem = new ProgressSystem(this);
        
        this.initializeBot();
    }

    async initializeSupabase() {
        try {
            if (typeof supabase === 'undefined') {
                await this.loadSupabaseSDK();
            }
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            return true;
        } catch (error) {
            console.error('Error Supabase:', error);
            return false;
        }
    }

    loadSupabaseSDK() {
        return new Promise((resolve, reject) => {
            if (typeof supabase !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    async initializeBot() {
        await this.initializeSupabase();
        this.limpiarChat();
        this.addMessage('bot', '👁️ **CYCLOPSBOT v2.3.0 ACTIVADO**');
        this.addMessage('bot', '🎯 **Sistema de refinamiento progresivo + Progreso Visual**');
        
        await this.mostrarCategoriasPrincipales();
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        document.querySelectorAll('.cyber-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.closest('.cyber-btn').dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    // SISTEMA DE REFINAMIENTO PROGRESIVO CON PROGRESO VISUAL
    async mostrarCategoriasPrincipales() {
        this.refinementLevel = 1;
        this.setRefinementLevel(1); // Actualizar progreso visual
        
        const categoriasPrincipales = [
            { id: 'internet', nombre: 'Internet & Redes', icono: '🌐', subcategorias: ['wifi', 'velocidad', 'conexion', 'juegos', 'streaming'] },
            { id: 'hardware', nombre: 'Hardware & PC', icono: '💻', subcategorias: ['encendido', 'rendimiento', 'pantalla', 'sonido', 'perifericos'] },
            { id: 'software', nombre: 'Software & Sistema', icono: '🖥️', subcategorias: ['windows', 'programas', 'virus', 'actualizaciones', 'rendimiento'] },
            { id: 'movil', nombre: 'Dispositivos Móviles', icono: '📱', subcategorias: ['bateria', 'senal', 'pantalla', 'aplicaciones', 'rendimiento'] }
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
        this.setRefinementLevel(2); // Actualizar progreso visual
        
        this.addMessage('user', `📂 ${categoria.icono} ${categoria.nombre}`);
        this.addMessage('bot', `✅ **${categoria.nombre}** seleccionado.`);
        
        // Mostrar subcategorías
        const subcategorias = categoria.subcategorias.map(sub => ({
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
        this.setRefinementLevel(3); // Actualizar progreso visual
        
        this.addMessage('user', `🎯 ${subcategoria.icono} ${subcategoria.nombre}`);
        this.addMessage('bot', `🔍 **Buscando problemas de ${subcategoria.nombre.toLowerCase()}...**`);

        await this.mostrarProblemasRefinados(categoriaPadre.id, subcategoria.id);
    }

    async mostrarProblemasRefinados(categoria, subcategoria) {
        try {
            // Buscar problemas que coincidan con la categoría y subcategoría
            const { data: problemas, error } = await this.supabase
                .from('problemas')
                .select('id, descripcion, identificador, keywords, prioridad')
                .eq('categoria', categoria)
                .eq('activo', true)
                .order('prioridad', { ascending: false });

            if (error) throw error;

            if (!problemas || problemas.length === 0) {
                this.addMessage('bot', '❌ No se encontraron problemas.');
                this.mostrarCategoriasPrincipales();
                return;
            }

            // Filtrar problemas por subcategoría usando keywords
            const problemasFiltrados = problemas.filter(problema => 
                problema.keywords && problema.keywords.some(keyword => 
                    keyword.toLowerCase().includes(subcategoria.toLowerCase())
                )
            ).slice(0, this.maxButtonsPerLevel);

            const problemasParaMostrar = problemasFiltrados.length > 0 ? 
                problemasFiltrados : problemas.slice(0, this.maxButtonsPerLevel);

            if (problemasParaMostrar.length === 0) {
                this.addMessage('bot', '❌ No hay problemas específicos. Mostrando todos...');
                await this.mostrarTodosLosProblemas(problemas);
                return;
            }

            this.mostrarBotonesRefinamiento(
                problemasParaMostrar.map(p => ({
                    id: p.id,
                    nombre: p.descripcion,
                    icono: '🔧'
                })),
                '❓ **Selecciona el problema exacto:**',
                (problema) => this.seleccionarProblemaRefinado(problema, problemas)
            );

            // Si hay más problemas, mostrar opción para ver todos
            if (problemas.length > this.maxButtonsPerLevel) {
                const botonesArea = document.getElementById('botonesArea');
                const verTodosBtn = this.crearBoton(
                    '📋 Ver todos los problemas',
                    () => this.mostrarTodosLosProblemas(problemas),
                    'secondary'
                );
                botonesArea.appendChild(verTodosBtn);
            }

        } catch (error) {
            console.error('Error cargando problemas:', error);
            this.addMessage('bot', '❌ Error al cargar problemas.');
            this.mostrarCategoriasPrincipales();
        }
    }

    async mostrarTodosLosProblemas(problemas) {
        this.refinementLevel = 3;
        
        this.mostrarBotonesRefinamiento(
            problemas.map(p => ({
                id: p.id,
                nombre: p.descripcion,
                icono: '🔧'
            })),
            '📋 **Todos los problemas disponibles:**',
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

        // Disparar evento de inicio de diagnóstico para el progreso visual
        document.dispatchEvent(new CustomEvent('diagnosisStarted'));

        // Cargar preguntas y soluciones completas
        try {
            const { data: problemaDetallado, error } = await this.supabase
                .from('problemas')
                .select('preguntas, soluciones')
                .eq('id', problemaCompleto.id)
                .single();

            if (error) throw error;

            this.currentProblem.preguntas = problemaDetallado.preguntas;
            this.currentProblem.soluciones = problemaDetallado.soluciones;
            
            await this.hacerSiguientePregunta();

        } catch (error) {
            console.error('Error cargando diagnóstico:', error);
            this.addMessage('bot', '❌ Error al cargar el diagnóstico.');
            await this.mostrarProblemasRefinados(this.currentCategory, this.currentSubcategory);
        }
    }

    // MÉTODO PRINCIPAL PARA MOSTRAR BOTONES CON REFINAMIENTO
    mostrarBotonesRefinamiento(items, mensaje, onClickCallback) {
        this.limpiarBotones();
        this.addMessage('bot', mensaje);

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

        // Botón para volver atrás (excepto en nivel 0)
        if (this.refinementLevel > 1) {
            const volverBoton = this.crearBoton(
                '↩️ Volver atrás',
                () => this.volverAtras(),
                'secondary'
            );
            botonesArea.appendChild(volverBoton);
        }
    }

    volverAtras() {
        const previousLevel = this.refinementLevel;
        this.refinementLevel = Math.max(1, this.refinementLevel - 1);
        this.setRefinementLevel(this.refinementLevel); // Actualizar progreso visual
        
        if (this.refinementLevel === 1) {
            this.volverACategorias();
        } else if (this.refinementLevel === 2) {
            this.mostrarCategoriasPrincipales();
        } else {
            // Volver a subcategorías
            this.mostrarProblemasRefinados(this.currentCategory, this.currentSubcategory);
        }
    }

    // MÉTODO ACTUALIZADO PARA SINCRONIZAR PROGRESO VISUAL
    setRefinementLevel(level) {
        this.refinementLevel = level;
        
        // Disparar evento personalizado para el sistema de progreso
        const event = new CustomEvent('refinementLevelChanged', {
            detail: { level: level }
        });
        document.dispatchEvent(event);
        
        this.updateUI();
    }

    // MÉTODOS AUXILIARES PARA REFINAMIENTO
    getSubcategoryDisplayName(subcategoria, categoria) {
        const nombres = {
            'wifi': 'Problemas de WiFi',
            'velocidad': 'Velocidad de Internet',
            'conexion': 'Conexión y Redes',
            'juegos': 'Juegos Online',
            'streaming': 'Streaming y Video',
            'encendido': 'Encendido y Arranque',
            'rendimiento': 'Rendimiento y Lentitud',
            'pantalla': 'Pantalla y Gráficos',
            'sonido': 'Audio y Sonido',
            'perifericos': 'Periféricos',
            'windows': 'Windows y Sistema',
            'programas': 'Programas y Aplicaciones',
            'virus': 'Virus y Seguridad',
            'actualizaciones': 'Actualizaciones',
            'bateria': 'Batería y Energía',
            'senal': 'Señal y Conectividad',
            'aplicaciones': 'Aplicaciones y Apps'
        };
        return nombres[subcategoria] || subcategoria;
    }

    getSubcategoryIcon(subcategoria) {
        const icons = {
            'wifi': '📶', 'velocidad': '⚡', 'conexion': '🔗', 'juegos': '🎮', 'streaming': '📺',
            'encendido': '🔌', 'rendimiento': '🚀', 'pantalla': '🖥️', 'sonido': '🔊', 'perifericos': '🖱️',
            'windows': '🪟', 'programas': '📱', 'virus': '🛡️', 'actualizaciones': '🔄',
            'bateria': '🔋', 'senal': '📡', 'aplicaciones': '📲'
        };
        return icons[subcategoria] || '🔧';
    }

    // MÉTODOS RESTANTES (actualizados para integración con progreso visual)
    async hacerSiguientePregunta() {
        if (!this.currentProblem.preguntas || this.currentQuestionIndex >= this.currentProblem.preguntas.length) {
            await this.mostrarSoluciones();
            return;
        }

        const pregunta = this.currentProblem.preguntas[this.currentQuestionIndex];
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

        if (this.currentProblem.soluciones && this.currentProblem.soluciones.length > 0) {
            this.currentProblem.soluciones.forEach((solucion, index) => {
                this.addMessage('bot', `${index + 1}. ${solucion}`);
            });
        } else {
            this.addMessage('bot', '⚠️ No hay soluciones específicas disponibles.');
        }

        // Disparar evento de finalización para el progreso visual
        document.dispatchEvent(new CustomEvent('diagnosisCompleted'));

        await this.registrarConsulta();
        await this.actualizarEstadisticasProblema(this.currentProblem.id);
        this.mostrarBotonesFinales();
        this.diagnosisActive = false;
        this.updateStats();
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
        document.getElementById('botonesArea').innerHTML = '';
    }

    limpiarChat() {
        document.getElementById('chatMessages').innerHTML = '';
    }

    addMessage(sender, content) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.style.padding = '6px 8px';
        messageDiv.style.marginBottom = '4px';
        messageDiv.style.background = sender === 'bot' ? 'rgba(0, 243, 255, 0.05)' : 'rgba(255, 0, 255, 0.05)';
        messageDiv.style.borderRadius = '6px';
        messageDiv.style.border = `1px solid ${sender === 'bot' ? 'rgba(0, 243, 255, 0.2)' : 'rgba(255, 0, 255, 0.2)'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.style.fontSize = '0.8rem';
        contentDiv.style.lineHeight = '1.2';
        
        content.split('\n').forEach(paragraph => {
            if (paragraph.trim()) {
                const p = document.createElement('p');
                p.innerHTML = paragraph;
                p.style.margin = '2px 0';
                contentDiv.appendChild(p);
            }
        });
        
        messageDiv.appendChild(contentDiv);
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
        
        // Disparar evento de reset para el progreso visual
        document.dispatchEvent(new CustomEvent('systemReset'));
    }

    async registrarConsulta() {
        try {
            await this.supabase
                .from('consultas_usuarios')
                .insert({
                    session_id: this.sessionId,
                    pregunta_usuario: `Problema: ${this.currentCategory} - ${this.currentProblem.identificador}`,
                    respuesta_bot: this.currentProblem.soluciones ? this.currentProblem.soluciones.join(' | ') : 'Sin soluciones',
                    categoria_detectada: this.currentCategory,
                    problema_id: this.currentProblem.id,
                    preguntas_realizadas: this.currentQuestionIndex
                });
        } catch (error) {
            console.error('Error registrando consulta:', error);
        }
    }

    async actualizarEstadisticasProblema(problemaId) {
        try {
            await this.supabase
                .rpc('incrementar_consultas', { problema_id: problemaId });
        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
        }
    }

    async updateStats() {
        try {
            const problemsCount = document.getElementById('problemsCount');
            const diagnosticsCount = document.getElementById('diagnosticsCount');

            const { data: problemas } = await this.supabase
                .from('problemas')
                .select('id', { count: 'exact' })
                .eq('activo', true);

            const { data: consultas } = await this.supabase
                .from('consultas_usuarios')
                .select('id', { count: 'exact' })
                .eq('session_id', this.sessionId);

            if (problemas) problemsCount.textContent = problemas.length;
            if (consultas) diagnosticsCount.textContent = consultas.length;

        } catch (error) {
            console.error('Error actualizando stats:', error);
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'start': this.nuevoDiagnostico(); break;
            case 'reset': this.resetBot(); break;
            case 'help': this.mostrarAyuda(); break;
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
}

// Inicialización mejorada con manejo de errores
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 Iniciando CyclopsBot v2.3.0...');
        new CyclopsBotAvanzado();
        
        // Efectos de partículas mínimos
        function createParticles() {
            const particlesContainer = document.querySelector('.particles-background');
            if (!particlesContainer) return;
            
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + 'vw';
                particle.style.animationDelay = Math.random() * 10 + 's';
                particle.style.animationDuration = (Math.random() * 6 + 6) + 's';
                particlesContainer.appendChild(particle);
            }
        }
        
        createParticles();
        
        console.log('✅ CyclopsBot v2.3.0 inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar CyclopsBot:', error);
        
        // Mostrar mensaje de error al usuario
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        <p>❌ <strong>Error de inicialización</strong></p>
                        <p>No se pudo cargar CyclopsBot. Por favor, recarga la página.</p>
                        <p><small>Detalle: ${error.message}</small></p>
                    </div>
                </div>
            `;
        }
    }
});