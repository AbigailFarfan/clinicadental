-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DENTISTA', 'RECEPCIONISTA');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "ToothStatus" AS ENUM ('SANO', 'CARIES', 'OBTURADO', 'EXTRAIDO', 'CORONA', 'ENDODONCIA', 'PROTESIS', 'IMPLANTE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RECEPCIONISTA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "direccion" TEXT,
    "alergias" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "notas" TEXT,
    "estado" "AppointmentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "dentistaId" TEXT NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_records" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnostico" TEXT NOT NULL,
    "tratamiento" TEXT NOT NULL,
    "observaciones" TEXT,
    "piezaDental" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "dentistaId" TEXT NOT NULL,

    CONSTRAINT "clinical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tooth_records" (
    "id" TEXT NOT NULL,
    "numeroPieza" INTEGER NOT NULL,
    "estado" "ToothStatus" NOT NULL DEFAULT 'SANO',
    "notas" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pacienteId" TEXT NOT NULL,

    CONSTRAINT "tooth_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_ci_key" ON "patients"("ci");

-- CreateIndex
CREATE INDEX "appointments_fecha_idx" ON "appointments"("fecha");

-- CreateIndex
CREATE INDEX "appointments_dentistaId_fecha_idx" ON "appointments"("dentistaId", "fecha");

-- CreateIndex
CREATE INDEX "appointments_pacienteId_idx" ON "appointments"("pacienteId");

-- CreateIndex
CREATE INDEX "clinical_records_pacienteId_idx" ON "clinical_records"("pacienteId");

-- CreateIndex
CREATE INDEX "clinical_records_dentistaId_idx" ON "clinical_records"("dentistaId");

-- CreateIndex
CREATE UNIQUE INDEX "tooth_records_pacienteId_numeroPieza_key" ON "tooth_records"("pacienteId", "numeroPieza");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_dentistaId_fkey" FOREIGN KEY ("dentistaId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_records" ADD CONSTRAINT "clinical_records_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_records" ADD CONSTRAINT "clinical_records_dentistaId_fkey" FOREIGN KEY ("dentistaId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
