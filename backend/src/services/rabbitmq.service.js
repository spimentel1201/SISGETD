import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  if (channel) return channel;
  
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  try {
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    
    // Escuchar cierres de conexión
    connection.on('error', (err) => {
      console.error('[RabbitMQ] Error de conexión:', err);
      connection = null;
      channel = null;
    });
    
    connection.on('close', () => {
      console.log('[RabbitMQ] Conexión cerrada.');
      connection = null;
      channel = null;
    });
    
    return channel;
  } catch (error) {
    console.error('[RabbitMQ] Error de conexión:', error.message);
    throw error;
  }
};

/**
 * Publica un mensaje en RabbitMQ en formato compatible con Celery
 */
export const publishMessage = async (queue, message) => {
  try {
    const ch = await connectRabbitMQ();
    
    // Si el mensaje es para procesar expedientes, lo enviamos en el formato que Celery espera para la tarea "ocr.procesar"
    if (queue === 'expedientes.procesar') {
      const taskId = uuidv4();
      const celeryQueue = 'celery'; // Cola por defecto de Celery
      
      // Estructura del cuerpo que Celery espera: [args, kwargs, embed]
      const celeryBody = [
        [message.expediente_id, message.archivo_url], // args
        {}, // kwargs
        {
          callbacks: null,
          errbacks: null,
          chain: null,
          chord: null
        }
      ];
      
      // Propiedades del mensaje de Celery
      const options = {
        contentType: 'application/json',
        contentEncoding: 'utf-8',
        headers: {
          id: taskId,
          task: 'ocr.procesar',
          lang: 'py',
          retval: null,
          argsrepr: JSON.stringify([message.expediente_id, message.archivo_url]),
          kwargsrepr: '{}',
          origin: 'node-backend'
        },
        deliveryMode: 2 // Persistente
      };
      
      await ch.assertQueue(celeryQueue, { durable: true });
      ch.sendToQueue(celeryQueue, Buffer.from(JSON.stringify(celeryBody)), options);
      console.log(`[RabbitMQ] Tarea Celery 'ocr.procesar' enviada con ID: ${taskId}`);
      return true;
    }
    
    // Fallback genérico para otros mensajes
    await ch.assertQueue(queue, { durable: true });
    ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log(`[RabbitMQ] Mensaje enviado a la cola '${queue}':`, message);
    return true;
  } catch (error) {
    console.error(`[RabbitMQ] Error al publicar en la cola '${queue}':`, error.message);
    return false;
  }
};
