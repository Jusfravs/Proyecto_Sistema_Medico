/**
 * SCRIPT DE GENERACIÓN AUTOMÁTICA DE GOOGLE FORM - VECTRA CURE
 * 
 * Instrucciones:
 * 1. Entra a https://script.google.com/
 * 2. Clic en "Nuevo proyecto"
 * 3. Pega este código y presiona Ejecutar (▶️)
 * 4. Acepta los permisos para crear el formulario en tu Google Drive
 */

function crearFormularioCitacionMedica() {
  var form = FormApp.create('Estudio de Mercado: Plataforma de Citas Médicas');
  
  form.setDescription(
    'Agradecemos tu tiempo para responder esta breve encuesta (toma menos de 2 minutos). ' +
    'Tus respuestas nos ayudarán a desarrollar una plataforma web innovadora para facilitar ' +
    'la búsqueda y agendamiento de citas con especialistas médicos, odontológicos y veterinarios cercanos a ti.'
  );

  form.setAllowResponseEdits(false);

  // Pregunta 1
  form.addMultipleChoiceItem()
    .setTitle('1. ¿En qué rango de edad te encuentras?')
    .setChoiceValues(['18 a 25 años', '26 a 35 años', '36 a 45 años', '46 años o más'])
    .setRequired(true);

  // Pregunta 2
  form.addMultipleChoiceItem()
    .setTitle('2. ¿Qué sistema de salud utilizas principalmente para tus atenciones?')
    .setChoiceValues(['Sistema público', 'Seguro médico privado', 'Consultorios o clínicas privadas (pago directo)', 'Mixto (Público y Privado)'])
    .setRequired(true);

  // Pregunta 3
  form.addMultipleChoiceItem()
    .setTitle('3. ¿Con qué frecuencia asistes a consultas médicas, odontológicas o veterinarias?')
    .setChoiceValues(['Mensualmente', 'Cada 3 a 6 meses', 'Una vez al año', 'Solo en casos de emergencia'])
    .setRequired(true);

  // Pregunta 4
  form.addMultipleChoiceItem()
    .setTitle('4. ¿Cómo sueles encontrar a un nuevo especialista cuando lo necesitas?')
    .setChoiceValues(['Recomendación de familiares o amigos', 'Búsqueda en internet o redes sociales', 'A través del directorio de mi seguro médico', 'Ya tengo médicos fijos y no busco nuevos'])
    .setRequired(true);

  // Pregunta 5
  form.addMultipleChoiceItem()
    .setTitle('5. ¿Cuál es tu mayor molestia al momento de buscar y agendar una cita?')
    .setChoiceValues(['Tiempos de espera largos para conseguir un turno', 'No tener referencias claras de la calidad del doctor', 'Dificultad para saber los precios de antemano', 'El proceso de contactar por teléfono o mensajes'])
    .setRequired(true);

  // Pregunta 6
  form.addMultipleChoiceItem()
    .setTitle('6. ¿Qué tan útil sería una plataforma web que te muestre en un mapa a los especialistas cercanos a ti?')
    .setChoiceValues(['Muy útil', 'Algo útil', 'Poco útil', 'Nada útil'])
    .setRequired(true);

  // Pregunta 7
  form.addMultipleChoiceItem()
    .setTitle('7. ¿Qué factor sería el más decisivo para elegir a un médico dentro de esta plataforma?')
    .setChoiceValues(['Calificaciones y reseñas de otros pacientes', 'Cercanía a tu ubicación actual', 'Precio visible de la consulta', 'Disponibilidad para agendar el mismo día'])
    .setRequired(true);

  // Pregunta 8
  form.addMultipleChoiceItem()
    .setTitle('8. ¿Te sentirías cómodo agendando una cita 100% online sin tener que hablar con una persona?')
    .setChoiceValues(['Sí, me parece la opción más rápida y cómoda', 'Sí, siempre que la página me transmita seguridad', 'No, prefiero confirmar detalles por WhatsApp', 'No, prefiero llamar por teléfono directamente'])
    .setRequired(true);

  // Pregunta 9
  form.addMultipleChoiceItem()
    .setTitle('9. ¿Qué método de pago preferirías utilizar para pagar la consulta dentro de la plataforma?')
    .setChoiceValues(['Tarjeta de crédito o débito', 'Transferencia bancaria directa', 'Billetera digital (PayPal, Apple Pay, etc.)', 'Prefiero pagar en efectivo directamente en el consultorio'])
    .setRequired(true);

  // Pregunta 10
  form.addMultipleChoiceItem()
    .setTitle('10. ¿Estarías dispuesto a pagar un pequeño recargo en la plataforma a cambio de la facilidad de encontrar y agendar rápido?')
    .setChoiceValues(['Sí, si el servicio me ahorra tiempo y esfuerzo', 'Sí, pero únicamente en situaciones de emergencia', 'No, solo pagaría el costo exacto de la consulta médica', 'No utilizaría la plataforma si me cobra un recargo'])
    .setRequired(true);

  Logger.log('========================================================');
  Logger.log('✅ Formulario creado con éxito');
  Logger.log('📝 Enlace de Edición: ' + form.getEditUrl());
  Logger.log('🔗 Enlace Público: ' + form.getPublishedUrl());
  Logger.log('========================================================');
}
