<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

# SwordGenius Grain Agriculture Backend

Sistema backend para monitoreo de sensores agrícolas, implementado en NestJS con MongoDB y comunicación en tiempo real mediante WebSockets y MQTT.

## Características del Sistema

- Autenticación de usuarios con JWT
- Gestión de sensores de granos
- Estadísticas y predicciones de movimiento
- Comunicación en tiempo real mediante WebSockets
- Integración con sensores IoT mediante MQTT
- Sistema de concurrencia avanzado

## MongoDB con Docker

```bash
# Iniciar MongoDB con Docker
docker-compose up -d
```

Esto inicia:
- MongoDB en localhost:27017
- Mongo Express (interfaz web) en http://localhost:8081

## Iniciar el backend

```bash
# Iniciar en modo desarrollo
npm run start:dev
```

# Sistema de Concurrencia

El backend implementa un sistema avanzado de concurrencia basado en el modelo de **Event-based Concurrency** optimizado para Node.js, utilizando cuatro primitivas principales:

## Primitivas de Concurrencia Implementadas

### 1. Mutex/Locks

Los mutex permiten la exclusión mutua al acceder a recursos compartidos, garantizando que solo un proceso pueda modificar datos críticos a la vez.

```typescript
// Ejemplo de uso
await concurrencyService.withMutex('database', async () => {
  // Operación que requiere acceso exclusivo
  await databaseOperation();
});
```

### 2. Semáforos

Los semáforos controlan el número máximo de operaciones concurrentes que pueden ejecutarse simultáneamente, evitando la sobrecarga del sistema.

```typescript
// Ejemplo de uso con límite de 5 operaciones concurrentes
const tasks = [task1, task2, task3, ...];
await concurrencyService.withConcurrencyLimit('database-queries', tasks);
```

### 3. Barreras de Sincronización

Las barreras permiten sincronizar múltiples procesos, haciendo que todos esperen hasta que cada uno alcance un punto determinado.

```typescript
// Ejemplo: Esperar a que 3 procesos lleguen a un punto de sincronización
const barrier = concurrencyService.getBarrier('statistics-sync');
await barrier.await(); // Espera a que todos los procesos lleguen
```

### 4. Worker Threads Pool

El pool de workers permite ejecutar tareas CPU-intensivas en hilos separados, evitando bloquear el event loop principal de Node.js.

```typescript
// Ejemplo: Ejecutar cálculo intensivo en worker thread
const result = await concurrencyService.runInWorker((data) => {
  // Cálculo intensivo aquí
  return complexCalculation(data);
}, inputData);
```

## Servicios Optimizados

Hemos optimizado los siguientes servicios con concurrencia:

1. **StatisticsService**: Procesamiento paralelo de cálculos estadísticos
2. **MqttClientService**: Manejo concurrente de mensajes de sensores
3. **GrainSensorService**: Procesamiento de datos de sensores con protección de recursos

## Pruebas Unitarias de Concurrencia

El sistema incluye pruebas unitarias completas para validar el funcionamiento de las primitivas de concurrencia:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas específicas
npm test -- -t 'Mutex'
npm test -- -t 'Semaphore'
npm test -- -t 'Barrier'
npm test -- -t 'WorkerPool'
```

### ¿Qué prueban estas pruebas?

- **Mutex**: Exclusión mutua, prevención de race conditions y liberación correcta de recursos
- **Semaphore**: Limitación de concurrencia y gestión de colas de espera
- **Barrier**: Sincronización entre múltiples procesos y manejo de generaciones
- **WorkerPool**: Ejecución de tareas en paralelo y limitación de concurrencia

## Estructura de Archivos del Sistema de Concurrencia

```
src/common/concurrency/
├── mutex.ts                 # Implementación de Mutex
├── semaphore.ts             # Implementación de Semáforo
├── barrier.ts               # Implementación de Barrera de sincronización
├── worker-pool.ts           # Implementación de Pool de Workers
├── concurrency.module.ts    # Módulo NestJS para concurrencia
├── concurrency.service.ts   # Servicio que integra todas las primitivas
└── tests/                   # Pruebas unitarias para cada primitiva
```

## Beneficios del Sistema de Concurrencia

1. **Mayor rendimiento**: Procesamiento paralelo de tareas CPU-intensivas
2. **Mejor escalabilidad**: Manejo eficiente de picos de carga
3. **Prevención de bloqueos**: El event loop principal no se bloquea
4. **Protección de datos**: Se evitan race conditions en accesos concurrentes
5. **Eficiencia en recursos**: Control de límites de uso de CPU y memoria

## Recomendaciones de Uso

- Ajustar los límites de concurrencia según las capacidades del servidor
- Monitorear el rendimiento para detectar posibles cuellos de botella
- Implementar manejo de errores adecuado en operaciones concurrentes
- Usar primitivas apropiadas según el tipo de recurso a proteger

## Referencias y Documentación

- [NestJS Documentation](https://docs.nestjs.com/)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Handling Concurrency in Node.js](https://blog.appsignal.com/2022/10/12/handling-concurrent-requests-in-nodejs.html)