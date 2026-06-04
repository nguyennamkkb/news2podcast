import { prisma } from "@/lib/prisma";
import type { Script } from "@/lib/validators/script";

export async function saveScript(projectId: string, scriptData: Script) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      scriptData: JSON.stringify(scriptData),
      status: "COMPLETED",
      slideCount: scriptData.slides.length,
    },
  });
}

export async function createVersion(
  projectId: string,
  scriptData: Script,
  changelog?: string
) {
  return prisma.$transaction(async (tx) => {
    const lastVersion = await tx.scriptVersion.findFirst({
      where: { projectId },
      orderBy: { version: "desc" },
    });
    return tx.scriptVersion.create({
      data: {
        projectId,
        version: (lastVersion?.version || 0) + 1,
        scriptData: JSON.stringify(scriptData),
        changelog: changelog || null,
      },
    });
  });
}

export async function getVersions(projectId: string) {
  return prisma.scriptVersion.findMany({
    where: { projectId },
    orderBy: { version: "desc" },
  });
}
