// Seed standard roles for team projects
import prisma from "../db/prismaClient";

const standardRoles = [
    "Web Developer",
    "Mobile App Developer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "DevOps Engineer",
    "Data Scientist",
    "ML Engineer",
    "Product Manager",
    "QA Engineer",
    "Technical Writer",
    "Business Analyst",
    "Project Manager",
    "Graphic Designer"
];

export async function seedRoles() {
    try {
        console.log("🌱 Seeding standard roles...");

        for (const roleName of standardRoles) {
            await prisma.role.upsert({
                where: { name: roleName },
                update: {},
                create: { name: roleName }
            });
        }

        console.log(`✅ Seeded ${standardRoles.length} standard roles`);
    } catch (error) {
        console.error("❌ Error seeding roles:", error);
        // Don't throw - we don't want to crash the server if seeding fails
    }
}
