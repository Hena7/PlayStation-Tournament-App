import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDuplicateRounds() {
  try {
    console.log("Starting to clean duplicate rounds...");

    // Find all tournaments
    const tournaments = await prisma.tournament.findMany({
      select: { id: true },
    });

    for (const tournament of tournaments) {
      console.log(`Processing tournament ${tournament.id}...`);

      // Find duplicate rounds for this tournament
      const rounds = await prisma.round.findMany({
        where: { tournament_id: tournament.id },
        orderBy: { round_number: "asc" },
      });

      const seenRounds = new Map();
      const duplicates = [];

      for (const round of rounds) {
        if (seenRounds.has(round.round_number)) {
          duplicates.push(round);
        } else {
          seenRounds.set(round.round_number, round);
        }
      }

      if (duplicates.length > 0) {
        console.log(
          `Found ${duplicates.length} duplicate rounds for tournament ${tournament.id}:`
        );
        duplicates.forEach((dup) =>
          console.log(`  Round ${dup.round_number} (ID: ${dup.id})`)
        );

        // Delete duplicate rounds (keep the one with smallest ID)
        for (const dup of duplicates) {
          await prisma.round.delete({
            where: { id: dup.id },
          });
          console.log(
            `Deleted duplicate round ${dup.round_number} (ID: ${dup.id})`
          );
        }
      } else {
        console.log(`No duplicates found for tournament ${tournament.id}`);
      }
    }

    console.log("Finished cleaning duplicate rounds.");
  } catch (error) {
    console.error("Error cleaning duplicate rounds:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicateRounds();
