# 04. Arquitectura Técnica y Modelo de Base de Datos

**Proyecto:** Vectra Cure — Plataforma de Geolocalización y Agendamiento Médico  
**Módulo:** Stack Tecnológico, Scraping/Mapas, Modelo de Datos Relacional y Endpoints API

---

## 1. Stack Tecnológico

| Capa | Tecnología | Justificación y Rol |
| :--- | :--- | :--- |
| **Frontend** | **Flask + Jinja** | Renderizado del servidor para los flujos públicos, autenticación y panel administrativo. |
| **Estilos & UI** | **Bootstrap + CSS propio** | Implementación responsiva de los tokens definidos en el sistema de diseño. |
| **Mapas & Lugares** | **Google Maps API / Scraping de Lugares** | Extracción de fotos de consultorios, coordenadas geográficas, horarios y cálculo de distancias en km. |
| **Backend** | **Python 3 + Flask + SQLAlchemy** | Gestión de reservas, concurrencia de turnos, sesiones, tickets y persistencia relacional. |
| **Base de Datos** | **PostgreSQL 18** | Modelo relacional robusto con transacciones ACID para evitar doble reserva (*overbooking*). |

---

## 2. Modelo Relacional de Base de Datos (SQL Schema)

```sql
-- 1. Tabla de Usuarios (Pacientes, Especialistas y Administradores)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) DEFAULT 'PATIENT', -- 'PATIENT', 'DOCTOR', 'ADMIN'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Perfil del Especialista (Datos Profesionales y Geolocalización)
CREATE TABLE doctor_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(50) NOT NULL, -- 'Medicina General', 'Odontología', 'Dermatología', 'Veterinaria', 'Pediatría'
    license_number VARCHAR(50) NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    clinic_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    approx_price DECIMAL(10, 2) NOT NULL,
    rating_avg DECIMAL(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    photo_url VARCHAR(255),
    gallery_urls TEXT[], -- Array de fotos del consultorio (Google Maps Scrape)
    opening_hours VARCHAR(100) DEFAULT '09:00 - 18:30'
);

-- 3. Citas Médicas, Pagos y Tickets
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES doctor_profiles(id),
    patient_name VARCHAR(120) NOT NULL,
    patient_email VARCHAR(100) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    approx_price DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'PAYPAL_MOCK', 'CASH_DESK'
    payment_status VARCHAR(20) NOT NULL, -- 'PAID_SIMULATED', 'PENDING_AT_DESK', 'REFUNDED_SIMULATED'
    status VARCHAR(20) DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
    ticket_code VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reseñas y Calificaciones de Pacientes
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    patient_name VARCHAR(100) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Principales Endpoints de la API REST

### 📍 Especialistas y Mapa
* `GET /api/doctors?specialty={name}&sort={rating|distance|price}&lat={x}&lng={y}`
  * Retorna los especialistas cercanos con sus fotos, estrellas, distancia calculada y precio aproximado.
* `GET /api/doctors/:id`
  * Retorna la información extendida para el panel lateral (*Side Drawer*): galería de fotos, lista de precios detallados y reseñas de pacientes.

### 📅 Agendamiento y Reservas
* `POST /api/appointments`
  * Crea una nueva reserva, bloquea el horario, genera el código de ticket único y dispara las notificaciones simuladas (Email/WhatsApp).
* `GET /api/appointments/:ticket_code/download-ticket`
  * Genera y descarga el archivo Markdown (`.md`) estructurado como recibo de caja registradora.
* `POST /api/appointments/:id/cancel`
  * Cancela la cita y emite la simulación de reverso/reembolso si fue pagada digitalmente.
