import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const dentistaPassword = await bcrypt.hash("dentista123", 10);
  const recepcionPassword = await bcrypt.hash("recepcion123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@clinicadental.com" },
    update: {},
    create: {
      email: "admin@clinicadental.com",
      password: adminPassword,
      nombre: "Carlos",
      apellido: "Mendoza",
      role: "ADMIN",
    },
  });

  const dentista1 = await prisma.user.upsert({
    where: { email: "dentista@clinicadental.com" },
    update: {},
    create: {
      email: "dentista@clinicadental.com",
      password: dentistaPassword,
      nombre: "María",
      apellido: "García",
      role: "DENTISTA",
    },
  });

  const dentista2 = await prisma.user.upsert({
    where: { email: "dentista2@clinicadental.com" },
    update: {},
    create: {
      email: "dentista2@clinicadental.com",
      password: dentistaPassword,
      nombre: "Roberto",
      apellido: "Fernández",
      role: "DENTISTA",
    },
  });

  const recepcionista = await prisma.user.upsert({
    where: { email: "recepcion@clinicadental.com" },
    update: {},
    create: {
      email: "recepcion@clinicadental.com",
      password: recepcionPassword,
      nombre: "Ana",
      apellido: "López",
      role: "RECEPCIONISTA",
    },
  });

  console.log("Users created:", { admin: admin.email, dentista1: dentista1.email, dentista2: dentista2.email, recepcionista: recepcionista.email });

  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { ci: "4523678" },
      update: {},
      create: { nombre: "Juan", apellido: "Pérez", ci: "4523678", telefono: "71234567", email: "juan.perez@email.com", fechaNacimiento: new Date("1990-05-15"), direccion: "Av. Bolívar #123, Tarija", alergias: "Penicilina" },
    }),
    prisma.patient.upsert({
      where: { ci: "6789012" },
      update: {},
      create: { nombre: "María", apellido: "Rodríguez", ci: "6789012", telefono: "72345678", email: "maria.rod@email.com", fechaNacimiento: new Date("1985-08-22"), direccion: "Calle Sucre #456, Tarija" },
    }),
    prisma.patient.upsert({
      where: { ci: "3456789" },
      update: {},
      create: { nombre: "Pedro", apellido: "Mamani", ci: "3456789", telefono: "73456789", fechaNacimiento: new Date("1978-12-01"), direccion: "Zona Central, Tarija", alergias: "Látex, Lidocaína" },
    }),
    prisma.patient.upsert({
      where: { ci: "8901234" },
      update: {},
      create: { nombre: "Sofía", apellido: "Vargas", ci: "8901234", telefono: "74567890", email: "sofia.v@email.com", fechaNacimiento: new Date("2000-03-10"), direccion: "Barrio San Luis, Tarija" },
    }),
    prisma.patient.upsert({
      where: { ci: "1234567" },
      update: {},
      create: { nombre: "Carlos", apellido: "Quispe", ci: "1234567", telefono: "75678901", fechaNacimiento: new Date("1995-07-20"), direccion: "Villa Fátima, Tarija", notas: "Paciente nervioso, necesita sedación" },
    }),
    prisma.patient.upsert({
      where: { ci: "5678901" },
      update: {},
      create: { nombre: "Laura", apellido: "Chávez", ci: "5678901", telefono: "76789012", email: "laura.ch@email.com", fechaNacimiento: new Date("1992-11-05"), direccion: "Mercado Campesino, Tarija" },
    }),
    prisma.patient.upsert({
      where: { ci: "9012345" },
      update: {},
      create: { nombre: "Diego", apellido: "Torres", ci: "9012345", telefono: "77890123", fechaNacimiento: new Date("1988-01-30"), direccion: "Zona Sur, Tarija" },
    }),
  ]);

  console.log(`${patients.length} patients created`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = [];
  const statuses = ["PENDIENTE", "CONFIRMADA", "EN_CURSO", "COMPLETADA", "CANCELADA"] as const;

  for (let i = 0; i < 12; i++) {
    const dayOffset = Math.floor(i / 3) - 1;
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);

    const hour = 8 + (i % 5) * 2;
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(hour + 1, 0, 0, 0);

    const dentist = i % 2 === 0 ? dentista1 : dentista2;
    const patient = patients[i % patients.length];
    const status = dayOffset < 0 ? "COMPLETADA" : dayOffset === 0 ? statuses[i % 3] : "PENDIENTE";

    appointments.push(
      prisma.appointment.create({
        data: {
          fecha: date,
          horaInicio: startTime,
          horaFin: endTime,
          motivo: ["Limpieza dental", "Revisión general", "Extracción", "Obturación", "Endodoncia", "Control ortodoncia"][i % 6],
          pacienteId: patient.id,
          dentistaId: dentist.id,
          estado: status,
        },
      })
    );
  }

  await Promise.all(appointments);
  console.log(`${appointments.length} appointments created`);

  const records = await Promise.all([
    prisma.clinicalRecord.create({
      data: { pacienteId: patients[0].id, dentistaId: dentista1.id, diagnostico: "Caries en pieza 16", tratamiento: "Obturación con resina compuesta", piezaDental: 6, observaciones: "Paciente toleró bien el procedimiento" },
    }),
    prisma.clinicalRecord.create({
      data: { pacienteId: patients[0].id, dentistaId: dentista1.id, diagnostico: "Gingivitis leve", tratamiento: "Limpieza dental profunda", observaciones: "Se recomienda mejorar técnica de cepillado" },
    }),
    prisma.clinicalRecord.create({
      data: { pacienteId: patients[1].id, dentistaId: dentista2.id, diagnostico: "Pulpitis irreversible en pieza 36", tratamiento: "Endodoncia", piezaDental: 22, observaciones: "Requiere corona posterior" },
    }),
    prisma.clinicalRecord.create({
      data: { pacienteId: patients[2].id, dentistaId: dentista1.id, diagnostico: "Fractura dental pieza 11", tratamiento: "Reconstrucción con composite", piezaDental: 8 },
    }),
    prisma.clinicalRecord.create({
      data: { pacienteId: patients[3].id, dentistaId: dentista2.id, diagnostico: "Terceros molares impactados", tratamiento: "Extracción quirúrgica planificada", observaciones: "Programar cirugía con sedación" },
    }),
    prisma.clinicalRecord.create({
      data: { pacienteId: patients[4].id, dentistaId: dentista1.id, diagnostico: "Caries múltiples", tratamiento: "Plan de tratamiento: obturaciones en piezas 14, 15, 24", observaciones: "Paciente con alto riesgo cariogénico" },
    }),
  ]);

  console.log(`${records.length} clinical records created`);

  const toothRecords = await Promise.all([
    prisma.toothRecord.upsert({ where: { pacienteId_numeroPieza: { pacienteId: patients[0].id, numeroPieza: 6 } }, update: {}, create: { pacienteId: patients[0].id, numeroPieza: 6, estado: "OBTURADO", notas: "Obturación con resina" } }),
    prisma.toothRecord.upsert({ where: { pacienteId_numeroPieza: { pacienteId: patients[0].id, numeroPieza: 14 } }, update: {}, create: { pacienteId: patients[0].id, numeroPieza: 14, estado: "CARIES" } }),
    prisma.toothRecord.upsert({ where: { pacienteId_numeroPieza: { pacienteId: patients[1].id, numeroPieza: 22 } }, update: {}, create: { pacienteId: patients[1].id, numeroPieza: 22, estado: "ENDODONCIA", notas: "Requiere corona" } }),
    prisma.toothRecord.upsert({ where: { pacienteId_numeroPieza: { pacienteId: patients[2].id, numeroPieza: 8 } }, update: {}, create: { pacienteId: patients[2].id, numeroPieza: 8, estado: "OBTURADO", notas: "Reconstrucción" } }),
    prisma.toothRecord.upsert({ where: { pacienteId_numeroPieza: { pacienteId: patients[2].id, numeroPieza: 16 } }, update: {}, create: { pacienteId: patients[2].id, numeroPieza: 16, estado: "EXTRAIDO" } }),
  ]);

  console.log(`${toothRecords.length} tooth records created`);
  console.log("\nSeed completed!");
  console.log("\nCredenciales de acceso:");
  console.log("  Admin:         admin@clinicadental.com / admin123");
  console.log("  Dentista 1:    dentista@clinicadental.com / dentista123");
  console.log("  Dentista 2:    dentista2@clinicadental.com / dentista123");
  console.log("  Recepcionista: recepcion@clinicadental.com / recepcion123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
