import bcrypt from "bcrypt";
import { prisma, pool } from "../src/config/prisma";
import { env } from "../src/config/envConfig";
import { logger } from "../src/utils/logger";
import { Weekday, DoctorStatus } from "../src/generated/prisma/enums";

// 12 Specialties
const SPECIALTIES = [
  "Dermatologist",
  "Cardiologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Gynecologist",
  "ENT Specialist",
  "Eye Specialist",
  "Gastroenterologist",
  "Medicine Specialist",
  "Psychiatrist",
  "Urologist",
];

// About 30 Diseases with lowercase aliases mapped to specialty name
const DISEASES: { name: string; aliases: string[]; specialty: string }[] = [
  // Dermatologist
  { name: "Skin Allergy", aliases: ["rash", "itching", "allergy"], specialty: "Dermatologist" },
  { name: "Acne", aliases: ["pimple"], specialty: "Dermatologist" },
  { name: "Eczema", aliases: [], specialty: "Dermatologist" },
  { name: "Fungal Infection", aliases: ["ringworm"], specialty: "Dermatologist" },
  { name: "Hair Fall", aliases: ["hair loss"], specialty: "Dermatologist" },

  // Cardiologist
  { name: "Chest Pain", aliases: ["heart pain"], specialty: "Cardiologist" },
  { name: "High Blood Pressure", aliases: ["hypertension", "bp"], specialty: "Cardiologist" },
  { name: "Palpitations", aliases: ["fast heartbeat"], specialty: "Cardiologist" },

  // Neurologist
  { name: "Migraine", aliases: ["headache"], specialty: "Neurologist" },
  { name: "Epilepsy", aliases: ["seizure"], specialty: "Neurologist" },
  { name: "Stroke", aliases: [], specialty: "Neurologist" },

  // Orthopedic Surgeon
  { name: "Back Pain", aliases: [], specialty: "Orthopedic Surgeon" },
  { name: "Knee Pain", aliases: ["joint pain"], specialty: "Orthopedic Surgeon" },
  { name: "Fracture", aliases: ["broken bone"], specialty: "Orthopedic Surgeon" },

  // Pediatrician
  { name: "Child Fever", aliases: [], specialty: "Pediatrician" },
  { name: "Cough in Children", aliases: [], specialty: "Pediatrician" },

  // Gynecologist
  { name: "Pregnancy Care", aliases: [], specialty: "Gynecologist" },
  { name: "PCOS", aliases: ["irregular periods"], specialty: "Gynecologist" },

  // ENT Specialist
  { name: "Ear Infection", aliases: ["earache"], specialty: "ENT Specialist" },
  { name: "Sinusitis", aliases: ["blocked nose"], specialty: "ENT Specialist" },
  { name: "Tonsillitis", aliases: ["sore throat"], specialty: "ENT Specialist" },

  // Eye Specialist
  { name: "Cataract", aliases: ["blurred vision"], specialty: "Eye Specialist" },
  { name: "Eye Infection", aliases: ["red eye"], specialty: "Eye Specialist" },

  // Gastroenterologist
  { name: "Gastric Pain", aliases: ["acidity", "gastritis", "ulcer"], specialty: "Gastroenterologist" },
  { name: "Jaundice", aliases: [], specialty: "Gastroenterologist" },

  // Medicine Specialist
  { name: "Fever", aliases: ["flu", "viral fever"], specialty: "Medicine Specialist" },
  { name: "Diabetes", aliases: ["sugar"], specialty: "Medicine Specialist" },

  // Psychiatrist
  { name: "Depression", aliases: ["anxiety", "stress"], specialty: "Psychiatrist" },

  // Urologist
  { name: "Kidney Stone", aliases: [], specialty: "Urologist" },
  { name: "Urine Infection", aliases: ["uti"], specialty: "Urologist" },
];

// 12 Chattogram Areas with realistic coordinates
const AREAS: { name: string; city: string; lat: number; lng: number }[] = [
  { name: "GEC Circle", city: "Chattogram", lat: 22.3594, lng: 91.8213 },
  { name: "Agrabad", city: "Chattogram", lat: 22.3262, lng: 91.8123 },
  { name: "Khulshi", city: "Chattogram", lat: 22.3664, lng: 91.8038 },
  { name: "Nasirabad", city: "Chattogram", lat: 22.3752, lng: 91.8215 },
  { name: "Panchlaish", city: "Chattogram", lat: 22.3688, lng: 91.8344 },
  { name: "Chawkbazar", city: "Chattogram", lat: 22.3562, lng: 91.8386 },
  { name: "Halishahar", city: "Chattogram", lat: 22.3204, lng: 91.7828 },
  { name: "Pahartali", city: "Chattogram", lat: 22.3627, lng: 91.7767 },
  { name: "Muradpur", city: "Chattogram", lat: 22.3789, lng: 91.8437 },
  { name: "Bayezid", city: "Chattogram", lat: 22.4011, lng: 91.8276 },
  { name: "Kotwali", city: "Chattogram", lat: 22.335, lng: 91.8335 },
  { name: "Oxygen", city: "Chattogram", lat: 22.4132, lng: 91.8364 },
];

// Sample doctor names
const DOCTOR_NAMES = [
  "Dr. Tanvir Ahmed",
  "Dr. Nusrat Jahan",
  "Dr. Mohammad Ali",
  "Dr. Fatima Khan",
  "Dr. Arifur Rahman",
  "Dr. Shahriar Kabir",
  "Dr. Mehjabin Chowdhury",
  "Dr. Kamrul Hasan",
  "Dr. Tasnim Ara",
  "Dr. Mahbubul Alam",
  "Dr. Sabina Yasmin",
  "Dr. Shamsul Huda",
  "Dr. Rashedul Islam",
  "Dr. Farzana Haque",
  "Dr. Kazi Moniruzzaman",
  "Dr. Shamim Ara Begum",
  "Dr. Anisur Rahman",
  "Dr. Shirin Akter",
  "Dr. Ziaul Karim",
  "Dr. Rehana Parvin",
  "Dr. Mokhlesur Rahman",
  "Dr. Dilruba Nasrin",
  "Dr. Nazmul Huda",
  "Dr. Afroza Sultana",
  "Dr. Mahmudul Hasan",
  "Dr. Rokeya Begum",
  "Dr. Golam Mostafa",
  "Dr. Salma Khatun",
  "Dr. Enamul Haque",
  "Dr. Nadia Sharmin",
  "Dr. Saiful Islam",
  "Dr. Jesmin Akhter",
  "Dr. Harun Ur Rashid",
  "Dr. Rubina Yasmin",
  "Dr. Aminul Islam",
  "Dr. Tahmina Akter",
  "Dr. Mizanur Rahman",
  "Dr. Farida Yeasmin",
  "Dr. Tariqul Islam",
  "Dr. Nasrin Sultana",
];

async function seed() {
  logger.info("Starting database seed...");

  // 1. Clean existing records in dependency order so seed is safe to run repeatedly
  await prisma.chamberSchedule.deleteMany();
  await prisma.chamber.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.disease.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.area.deleteMany();

  logger.info("Cleared previous data");

  // 2. Hash passwords once and reuse to keep the seed fast
  const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, env.BCRYPT_SALT_ROUNDS);
  const userPasswordHash = await bcrypt.hash("User@12345", env.BCRYPT_SALT_ROUNDS);
  const doctorPasswordHash = await bcrypt.hash("Doctor@12345", env.BCRYPT_SALT_ROUNDS);

  // 3. Create single Admin user
  await prisma.user.create({
    data: {
      name: "System Admin",
      email: env.ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  logger.info(`Seeded Admin account: ${env.ADMIN_EMAIL}`);

  // 4. Create Demo User (with saved location at GEC Circle)
  await prisma.user.create({
    data: {
      name: "Demo User",
      email: "user@demo.com",
      phone: "01700000001",
      passwordHash: userPasswordHash,
      role: "USER",
      profile: {
        create: {
          city: "Chattogram",
          area: "GEC Circle",
          lat: 22.3594,
          lng: 91.8213,
        },
      },
    },
  });
  logger.info("Seeded Demo User: user@demo.com");

  // 5. Seed Specialties
  const specialtyMap = new Map<string, string>();
  for (const name of SPECIALTIES) {
    const record = await prisma.specialty.create({ data: { name } });
    specialtyMap.set(name, record.id);
  }
  logger.info(`Seeded ${SPECIALTIES.length} specialties`);

  // 6. Seed Diseases
  for (const disease of DISEASES) {
    const specialtyId = specialtyMap.get(disease.specialty);
    if (!specialtyId) continue;

    await prisma.disease.create({
      data: {
        name: disease.name,
        aliases: disease.aliases,
        specialtyId,
      },
    });
  }
  logger.info(`Seeded ${DISEASES.length} diseases`);

  // 7. Seed Areas
  for (const area of AREAS) {
    await prisma.area.create({ data: area });
  }
  logger.info(`Seeded ${AREAS.length} areas`);

  // 8. Seed Demo Verified Doctor (Dermatologist, 2 chambers)
  const dermSpecialtyId = specialtyMap.get("Dermatologist")!;
  await prisma.user.create({
    data: {
      name: "Dr. Demo Dermatologist",
      email: "doctor@demo.com",
      phone: "01800000001",
      passwordHash: doctorPasswordHash,
      role: "DOCTOR",
      doctor: {
        create: {
          specialtyId: dermSpecialtyId,
          bmdcNumber: "A-99991",
          degrees: ["MBBS", "FCPS"],
          experienceYears: 8,
          bio: "Specialist dermatologist with 8 years of clinical experience.",
          status: DoctorStatus.VERIFIED,
          chambers: {
            create: [
              {
                name: "City Care Chamber",
                address: "GEC Circle, Chattogram",
                city: "Chattogram",
                area: "GEC Circle",
                lat: 22.3594,
                lng: 91.8213,
                phone: "01812345678",
                fee: 800,
                schedules: {
                  create: [
                    { day: Weekday.SAT, startTime: "17:00", endTime: "21:00" },
                    { day: Weekday.MON, startTime: "17:00", endTime: "21:00" },
                    { day: Weekday.WED, startTime: "17:00", endTime: "21:00" },
                  ],
                },
              },
              {
                name: "Agrabad Health Care",
                address: "Agrabad Commercial Area, Chattogram",
                city: "Chattogram",
                area: "Agrabad",
                lat: 22.3262,
                lng: 91.8123,
                phone: "01812345679",
                fee: 1000,
                schedules: {
                  create: [
                    { day: Weekday.SUN, startTime: "16:00", endTime: "20:00" },
                    { day: Weekday.TUE, startTime: "16:00", endTime: "20:00" },
                    { day: Weekday.THU, startTime: "16:00", endTime: "20:00" },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });
  logger.info("Seeded Demo Verified Doctor: doctor@demo.com");

  // 9. Seed Demo Pending Doctor (Cardiologist, no chambers yet)
  const cardioSpecialtyId = specialtyMap.get("Cardiologist")!;
  await prisma.user.create({
    data: {
      name: "Dr. Demo Pending",
      email: "pending@demo.com",
      phone: "01800000002",
      passwordHash: doctorPasswordHash,
      role: "DOCTOR",
      doctor: {
        create: {
          specialtyId: cardioSpecialtyId,
          bmdcNumber: "A-99992",
          degrees: ["MBBS", "MD (Cardiology)"],
          experienceYears: 5,
          bio: "Cardiologist awaiting verification.",
          status: DoctorStatus.PENDING,
        },
      },
    },
  });
  logger.info("Seeded Demo Pending Doctor: pending@demo.com");

  // 10. Seed 40 Sample Doctors:
  // - 34 VERIFIED, 5 PENDING, 1 REJECTED
  // - Spread across 12 specialties and 12 areas
  // - 1 to 2 chambers for verified doctors, realistic schedules
  const weekdayOptions: Weekday[][] = [
    [Weekday.SAT, Weekday.MON, Weekday.WED],
    [Weekday.SUN, Weekday.TUE, Weekday.THU],
    [Weekday.SAT, Weekday.SUN, Weekday.TUE, Weekday.THU],
    [Weekday.MON, Weekday.WED, Weekday.FRI],
  ];

  for (let i = 0; i < 40; i++) {
    const docIndex = i + 1;
    const pad = String(docIndex).padStart(2, "0");
    const name = DOCTOR_NAMES[i] || `Dr. Sample Doctor ${pad}`;
    const email = `doctor${pad}@sample.com`;
    const phone = `017100100${pad}`;
    const bmdcNumber = `A-100${pad}`;

    // Status split:
    // 0-33 (34 docs) -> VERIFIED
    // 34-38 (5 docs) -> PENDING
    // 39 (1 doc) -> REJECTED
    let status: DoctorStatus = DoctorStatus.VERIFIED;
    if (i >= 34 && i <= 38) {
      status = DoctorStatus.PENDING;
    } else if (i === 39) {
      status = DoctorStatus.REJECTED;
    }

    // Assign specialty in round-robin fashion
    const specialtyName = SPECIALTIES[i % SPECIALTIES.length];
    const specialtyId = specialtyMap.get(specialtyName)!;

    // Pick area for chamber
    const area = AREAS[i % AREAS.length];
    const degrees = ["MBBS", i % 2 === 0 ? "FCPS" : "MD"];
    const experienceYears = 3 + (i % 18);
    const fee = 500 + ((i * 100) % 1000); // Between 500 and 1400

    // Small offset for coordinates (~0.002 degrees)
    const latOffset = ((i % 5) - 2) * 0.0012;
    const lngOffset = (((i + 2) % 5) - 2) * 0.0012;

    const days = weekdayOptions[i % weekdayOptions.length];

    // Build chambers: Verified get 1 or 2 chambers, others get 0 or 1
    const chambersData = [];
    if (status === DoctorStatus.VERIFIED) {
      chambersData.push({
        name: `${area.name} Specialized Clinic`,
        address: `${area.name}, Road ${1 + (i % 10)}, Chattogram`,
        city: "Chattogram",
        area: area.name,
        lat: Number((area.lat + latOffset).toFixed(6)),
        lng: Number((area.lng + lngOffset).toFixed(6)),
        phone: `018200000${pad}`,
        fee,
        schedules: {
          create: days.map((day) => ({
            day,
            startTime: "17:00",
            endTime: "21:00",
          })),
        },
      });

      // Give some verified doctors a second chamber
      if (i % 3 === 0) {
        const secondArea = AREAS[(i + 4) % AREAS.length];
        chambersData.push({
          name: `${secondArea.name} Medical Chamber`,
          address: `${secondArea.name} Main Road, Chattogram`,
          city: "Chattogram",
          area: secondArea.name,
          lat: Number((secondArea.lat - latOffset).toFixed(6)),
          lng: Number((secondArea.lng - lngOffset).toFixed(6)),
          phone: `018300000${pad}`,
          fee: fee + 200,
          schedules: {
            create: [Weekday.FRI].map((day) => ({
              day,
              startTime: "09:00",
              endTime: "13:00",
            })),
          },
        });
      }
    }

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: doctorPasswordHash,
        role: "DOCTOR",
        doctor: {
          create: {
            specialtyId,
            bmdcNumber,
            degrees,
            experienceYears,
            bio: `${specialtyName} with ${experienceYears} years of practice in Chattogram.`,
            status,
            chambers: chambersData.length > 0 ? { create: chambersData } : undefined,
          },
        },
      },
    });
  }

  logger.info("Seeded 40 sample doctors (34 VERIFIED, 5 PENDING, 1 REJECTED)");
  logger.info("Seed completed successfully!");
}

seed()
  .catch((e) => {
    logger.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

