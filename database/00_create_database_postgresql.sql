-- Ejecutar conectado a la base de mantenimiento "postgres" en pgAdmin 4.
-- Si vectra_cure ya existe, omite este archivo.

CREATE DATABASE vectra_cure
  WITH ENCODING = 'UTF8'
  TEMPLATE = template0;
