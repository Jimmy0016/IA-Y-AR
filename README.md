# Lengua y Literatura — Corrector Ortográfico con IA + AR

Página educativa interactiva que corrige ortografía en español usando **IA local con Ollama** (sin internet, sin API key) y muestra un **trofeo 3D en Realidad Aumentada** cuando el texto está perfecto.

---

## Características

- **IA local** — Usa Llama 3.1 (8B) corriendo en tu PC, sin enviar datos a ningún servidor
- **100% privado** — No necesita internet ni API key
- **Trofeo AR 3D** — Se desbloquea cuando el texto no tiene errores ortográficos
- **Explicaciones** — La IA explica por qué cada palabra está mal escrita
- **Reglas ortográficas** — Panel educativo con reglas del español

---

## Requisitos previos

### 1. Instalar Node.js
Descarga e instala desde [nodejs.org](https://nodejs.org) (versión 18 o superior)

### 2. Instalar Ollama
Descarga e instala desde [ollama.com/download](https://ollama.com/download)

### 3. Descargar el modelo de IA
Abre una terminal y ejecuta:
```bash
ollama pull llama3.1:8b
```
> El modelo pesa ~4.7GB, espera a que termine la descarga

---

## Cómo ejecutar

### Paso 1 — Iniciar Ollama
Abre una terminal y ejecuta:
```bash
ollama serve
```
> Déjala abierta en segundo plano

### Paso 2 — Instalar dependencias del proyecto
```bash
npm install
```

### Paso 3 — Iniciar la aplicación
```bash
npm start
```

### Paso 4 — Abrir en el navegador
Ve a [http://localhost:4200](http://localhost:4200)

---

## Cómo usar la app

1. Escribe un texto en español en el editor
2. Presiona el botón "Verificar ortografía"
3. La IA analiza el texto:
   - Si hay errores, muestra cada error con su corrección y explicación
   - Si está perfecto, aparece el trofeo 3D con confeti
4. Corrige los errores en el texto y vuelve a verificar

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| Angular 22 | Framework frontend |
| Ollama + Llama 3.1 8B | IA local para corrección ortográfica |
| Three.js | Trofeo 3D en Realidad Aumentada |
| TypeScript | Lenguaje principal |

---

## Solución de problemas

**Error: "No se pudo conectar con Ollama"**
- Asegúrate de que Ollama esté corriendo (`ollama serve`)
- Verifica que el modelo esté descargado (`ollama list`)

**El trofeo AR no aparece**
- Asegúrate de que tu navegador soporte WebGL (Chrome o Edge recomendados)

**La IA tarda mucho**
- Es normal la primera vez que se carga el modelo (~30 segundos)
- Las siguientes consultas son más rápidas
