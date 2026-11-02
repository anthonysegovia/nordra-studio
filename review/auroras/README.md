# Banco de auroras

Desde la raíz del worktree ejecuta `node node_modules/vite/bin/vite.js --config review/auroras/vite.config.mjs --host 127.0.0.1 --port 5276 --strictPort` y abre [el banco local](http://127.0.0.1:5276/review/auroras/).

Las teclas 1, 2 y 3 alternan Serena, Activa y Corona. Los botones también admiten teclado. Cada variante conserva el encuadre del banco y el reloj de la escena al cambiar.

Para repetir la medición, ejecuta `node review/auroras/capture.mjs` con el servidor activo, Chrome y FFmpeg disponibles. El script genera capturas, MP4 de diez segundos y las mediciones en `muestras`. A 1440 × 900 y DPR 1, mide el tiempo de dibujar la escena completa y sincroniza la GPU mediante lectura de un píxel. Descarta las primeras cinco muestras y conserva 120 por variante antes de iniciar la grabación.

| Variante | Mediana | Percentil 95 |
| --- | ---: | ---: |
| Serena | 5,8 ms | 9,1 ms |
| Activa | 4,9 ms | 10,1 ms |
| Corona | 5,1 ms | 9,1 ms |

La configuración de Vite del banco sustituye los shaders en memoria para esta revisión. Las entradas comerciales siguen usando la escena de producción.
