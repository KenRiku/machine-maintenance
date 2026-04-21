import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const PARTS = [
  {
    name: "Spindle Bearing · 6205-2RS",
    sku: "BRG-6205",
    description:
      "Sealed deep-groove ball bearing rated for 22,000 RPM. Standard fitment across most CNC lathes and mills.",
    price: 34.5,
    category: "Bearings",
    compatibleTypes: ["CNC", "Lathe", "Mill"],
  },
  {
    name: "Way Oil · ISO VG 68 (1 gal)",
    sku: "LUB-VG68",
    description:
      "High-tack machine-way lubricant with anti-wear additive. Prevents stick-slip on ways and slides.",
    price: 28.75,
    category: "Lubricants",
    compatibleTypes: ["CNC", "Lathe", "Mill", "Press"],
  },
  {
    name: "Coolant Filter · 10-micron",
    sku: "FIL-COOL10",
    description:
      "Pleated filter cartridge for CNC coolant recirculation. Captures swarf and fines.",
    price: 18.0,
    category: "Filters",
    compatibleTypes: ["CNC", "Lathe", "Mill"],
  },
  {
    name: "Hydraulic Oil · AW 46 (5 gal)",
    sku: "LUB-AW46",
    description:
      "Anti-wear hydraulic oil for industrial press and injection systems. R&O inhibited.",
    price: 69.0,
    category: "Lubricants",
    compatibleTypes: ["Press", "Packaging", "Robot"],
  },
  {
    name: "V-Belt · A60",
    sku: "BLT-A60",
    description: "Classic A-section V-belt, 60 inch length. Wrapped construction.",
    price: 14.5,
    category: "Drive",
    compatibleTypes: ["Compressor", "Pump", "Conveyor"],
  },
  {
    name: "Conveyor Roller · 2.5in OD",
    sku: "CON-ROL25",
    description:
      "Gravity conveyor roller with sealed bearings, 2.5in OD, 16in between frames.",
    price: 41.0,
    category: "Conveyor",
    compatibleTypes: ["Conveyor", "Packaging"],
  },
  {
    name: "Pressure Switch · 0-150 PSI",
    sku: "SW-PRS150",
    description: "Adjustable pressure switch, 1/4 NPT, SPDT. Air or hydraulic.",
    price: 52.0,
    category: "Electrical",
    compatibleTypes: ["Compressor", "Press", "Pump"],
  },
  {
    name: "HEPA Filter · H13",
    sku: "FIL-HEPA13",
    description: "H13 pleated HEPA filter for facility HVAC and clean-air handlers.",
    price: 88.0,
    category: "Filters",
    compatibleTypes: ["HVAC", "Packaging"],
  },
  {
    name: "Safety Relay · 24VDC dual-channel",
    sku: "REL-SAF24",
    description:
      "SIL 3 dual-channel safety relay for e-stop and light curtain circuits.",
    price: 124.0,
    category: "Electrical",
    compatibleTypes: ["CNC", "Press", "Robot", "Packaging"],
  },
  {
    name: "Robot Gripper Finger (pair)",
    sku: "ROB-FNG1",
    description:
      "Urethane-tipped replacement finger set for pneumatic parallel gripper.",
    price: 76.0,
    category: "Robotics",
    compatibleTypes: ["Robot"],
  },
  {
    name: "Servo Motor Brake Kit",
    sku: "SRV-BRK1",
    description:
      "Electromagnetic holding brake kit for mid-size servo motors. Includes coil, rotor, and hardware.",
    price: 198.0,
    category: "Drive",
    compatibleTypes: ["CNC", "Robot", "Mill", "Lathe"],
  },
  {
    name: "Pump Mechanical Seal · 1in",
    sku: "PMP-SEAL1",
    description:
      "Cartridge mechanical seal, 1in shaft, silicon-carbide faces. Water / chemical compatible.",
    price: 112.0,
    category: "Pump",
    compatibleTypes: ["Pump", "Boiler"],
  },
  {
    name: "Boiler Gauge Glass Kit",
    sku: "BLR-GG1",
    description: "Replacement borosilicate gauge glass with gaskets and guards.",
    price: 44.0,
    category: "Boiler",
    compatibleTypes: ["Boiler"],
  },
  {
    name: "HVAC Belt · B45",
    sku: "BLT-B45",
    description: "B-section belt for air handler drives, 45 inch length.",
    price: 16.5,
    category: "Drive",
    compatibleTypes: ["HVAC"],
  },
  {
    name: "Press Ram Bushing",
    sku: "PRS-BSH1",
    description:
      "Bronze oil-impregnated ram bushing for small to medium hydraulic presses.",
    price: 88.0,
    category: "Press",
    compatibleTypes: ["Press"],
  },
  {
    name: "Collet · ER32 3/8in",
    sku: "TOL-ER32-3-8",
    description:
      "Precision ER32 collet, 3/8 inch bore, <0.0004in TIR. For milling spindles.",
    price: 22.0,
    category: "Tooling",
    compatibleTypes: ["CNC", "Mill"],
  },
  {
    name: "Air Dryer Element",
    sku: "AIR-DRY1",
    description:
      "Replacement desiccant cartridge for plant compressed air dryers.",
    price: 149.0,
    category: "Filters",
    compatibleTypes: ["Compressor"],
  },
  {
    name: "Packaging Sealing Wire · 10in",
    sku: "PKG-WIR10",
    description: "Replacement nichrome sealing wire for continuous heat sealers.",
    price: 9.75,
    category: "Packaging",
    compatibleTypes: ["Packaging"],
  },
  {
    name: "Industrial E-stop Button",
    sku: "ELC-ESTOP1",
    description:
      "Red mushroom e-stop, twist-release, 22mm mount, 2-NC contact block.",
    price: 34.0,
    category: "Electrical",
    compatibleTypes: ["CNC", "Lathe", "Mill", "Press", "Robot", "Packaging", "Conveyor"],
  },
  {
    name: "Grease · EP2 Lithium (400g cart)",
    sku: "LUB-EP2",
    description:
      "Extreme-pressure lithium grease cartridge for general bearing and slide lubrication.",
    price: 11.0,
    category: "Lubricants",
    compatibleTypes: [
      "CNC",
      "Lathe",
      "Mill",
      "Press",
      "Conveyor",
      "Pump",
      "Compressor",
      "Robot",
      "Packaging",
    ],
  },
  {
    name: "Compressor Intake Filter",
    sku: "FIL-COMP1",
    description:
      "Replacement paper intake filter for rotary screw and piston compressors.",
    price: 24.0,
    category: "Filters",
    compatibleTypes: ["Compressor"],
  },
  {
    name: "Lathe Tool Holder · CNMG",
    sku: "TOL-CNMG1",
    description:
      "80° diamond insert tool holder, right-hand, for OD turning operations.",
    price: 58.0,
    category: "Tooling",
    compatibleTypes: ["Lathe", "CNC"],
  },
];

const MACHINES = [
  {
    name: "Lathe Alpha",
    type: "CNC",
    model: "L-3000",
    manufacturer: "Haas",
    serialNumber: "SN-HLA-001A",
    location: "Floor A · Bay 2",
    notes: "Primary roughing lathe. Runs 3 shifts. Spindle overhaul Q4.",
    status: "OPERATIONAL",
  },
  {
    name: "Mill Bravo",
    type: "Mill",
    model: "VF-2",
    manufacturer: "Haas",
    serialNumber: "SN-HM-0042",
    location: "Floor A · Bay 5",
    notes: "3-axis VMC. Tool changer intermittent — watch for slow returns.",
    status: "OPERATIONAL",
  },
  {
    name: "Hydraulic Press #3",
    type: "Press",
    model: "PH-250",
    manufacturer: "Dake",
    serialNumber: "SN-DK-250-03",
    location: "Floor B · Bay 1",
    notes: "250-ton H-frame press. Operator Gary is the only one who trusts it.",
    status: "MAINTENANCE",
  },
  {
    name: "Conveyor East",
    type: "Conveyor",
    model: "BC-24-GR",
    manufacturer: "Hytrol",
    serialNumber: "SN-HY-9971",
    location: "Shipping",
    notes: "24in gravity conveyor, 40ft run. Roller replacement last Nov.",
    status: "OPERATIONAL",
  },
  {
    name: "Compressor Main",
    type: "Compressor",
    model: "GA30",
    manufacturer: "Atlas Copco",
    serialNumber: "SN-AC-GA30-1",
    location: "Mechanical Room",
    notes: "30kW rotary screw. Plant air backbone — do not let this fail.",
    status: "OPERATIONAL",
  },
  {
    name: "Packaging Line 2",
    type: "Packaging",
    model: "PL-88",
    manufacturer: "Bosch",
    serialNumber: "SN-BO-PL88-2",
    location: "Floor C",
    notes: "Continuous heat sealer downstream of case erector.",
    status: "OPERATIONAL",
  },
  {
    name: "Robot Arm R1",
    type: "Robot",
    model: "UR10e",
    manufacturer: "Universal Robots",
    serialNumber: "SN-UR-R1-001",
    location: "Floor A · Cell 3",
    notes: "Pick-and-place cell feeding Mill Bravo.",
    status: "OPERATIONAL",
  },
  {
    name: "Boiler Room Pump",
    type: "Pump",
    model: "5500-A",
    manufacturer: "Grundfos",
    serialNumber: "SN-GR-5500A",
    location: "Boiler Room",
    notes: "Circulation pump for hot-water heating loop.",
    status: "DOWN",
  },
];

async function main() {
  // Upsert parts (reset catalog)
  for (const p of PARTS) {
    await prisma.part.upsert({
      where: { sku: p.sku },
      update: p,
      create: p,
    });
  }
  console.log(`✓ Seeded ${PARTS.length} parts`);

  const DEMO_EMAIL = "demo@mechtrak.app";
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  let orgId: string;
  let userId: string;
  if (existing) {
    orgId = existing.orgId;
    userId = existing.id;
    console.log(`✓ Demo user already exists (${DEMO_EMAIL})`);
  } else {
    const org = await prisma.organization.create({
      data: { name: "Northside Manufacturing" },
    });
    orgId = org.id;
    const user = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        name: "Sam Reyes",
        passwordHash: await bcrypt.hash("mechtrak2025", 10),
        orgId,
        role: "MANAGER",
      },
    });
    userId = user.id;
    console.log(`✓ Created demo org & user (${DEMO_EMAIL} / mechtrak2025)`);
  }

  // Skip recreating machines if they already exist for this org
  const machineCount = await prisma.machine.count({ where: { orgId } });
  if (machineCount > 0) {
    console.log(`✓ ${machineCount} machines already in demo org, skipping`);
    return;
  }

  for (const m of MACHINES) {
    const machine = await prisma.machine.create({
      data: { ...m, orgId },
    });

    // Add 1-2 schedules per machine
    const schedules = [
      {
        title: "Monthly visual inspection",
        description:
          "Walk-around: leaks, noise, vibration, guarding, lockout points. Log anything abnormal.",
        intervalDays: 30,
      },
      {
        title: "Quarterly lubrication & bearing check",
        description:
          "Grease bearings per OEM spec. Check for play/axial movement. Replace if any rough rotation.",
        intervalDays: 90,
      },
    ];
    for (const s of schedules) {
      const nextDueDate = new Date(
        Date.now() + Math.floor(Math.random() * s.intervalDays) * 86400000,
      );
      const schedule = await prisma.maintenanceSchedule.create({
        data: { machineId: machine.id, ...s, nextDueDate },
      });
      await prisma.workOrder.create({
        data: {
          machineId: machine.id,
          scheduleId: schedule.id,
          type: "PM",
          title: s.title,
          description: s.description,
          dueDate: nextDueDate,
          status: "OPEN",
        },
      });
    }

    // Completed service log
    await prisma.serviceLog.create({
      data: {
        machineId: machine.id,
        technicianId: userId,
        type: "PM",
        notes:
          "Routine inspection. Checked guards and LOTO points, greased main bearings, no abnormal wear.",
        partsUsed: "1x LUB-EP2",
        createdAt: new Date(Date.now() - 14 * 86400000),
      },
    });
  }
  console.log(`✓ Seeded ${MACHINES.length} machines with schedules & logs`);
  console.log("");
  console.log("Login with:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: mechtrak2025`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
