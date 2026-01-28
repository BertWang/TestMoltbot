import "dotenv/config";
import { processNoteWithGemini } from "../src/lib/gemini";
import { prisma } from "../src/lib/prisma";
import path from "path";

async function main() {
  const imagePath = path.join(process.cwd(), "public/uploads/sample.png");
  console.log(`Processing image: ${imagePath}`);

  try {
    // 1. Process with AI
    console.log("SENDING TO GEMINI...");
    const aiResult = await processNoteWithGemini(imagePath, "image/png");
    console.log("AI PROCESSING COMPLETE.");
    console.log("Confidence:", aiResult.confidence);
    console.log("Tags:", aiResult.tags);

    // 2. Save to DB
    console.log("SAVING TO DATABASE...");
    const note = await prisma.note.create({
      data: {
        imageUrl: "/uploads/sample.png",
        rawOcrText: aiResult.rawOcr,
        refinedContent: aiResult.refinedContent,
        summary: aiResult.summary,
        tags: aiResult.tags.join(","), // Store as CSV string
        confidence: aiResult.confidence,
        ocrProvider: "gemini-1.5-flash",
        status: "COMPLETED",
        fileKey: "local-sample",
      },
    });

    console.log("NOTE SAVED SUCCESSFULLY!");
    console.log("ID:", note.id);
    console.log("Refined Content Preview:\n", note.refinedContent?.substring(0, 100) + "...");

  } catch (e) {
    console.error("Pipeline failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
