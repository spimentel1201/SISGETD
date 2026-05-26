// Servicio Mock temporal para RabbitMQ
export const publishMessage = async (queue, message) => {
  console.log(`[RabbitMQ Mock] Mensaje enviado a la cola '${queue}':`, message);
  return true;
};
