import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditSkillForm } from "@/components/edit-skill-form";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditSkillPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const { slug } = await params;

  const skill = await prisma.skill.findUnique({
    where: { slug },
    include: {
      files: { select: { filename: true, content: true } },
    },
  });

  if (!skill) notFound();

  // Only the author can edit
  if (skill.authorId !== session.user.id) {
    redirect(`/skills/${slug}`);
  }

  const skillContent = skill.files.find((f) => f.filename === "SKILL.md")?.content || "";

  return (
    <EditSkillForm
      id={skill.id}
      slug={skill.slug}
      name={skill.name}
      description={skill.description}
      longDescription={skill.longDescription || ""}
      category={skill.category}
      type={skill.type}
      price={skill.price}
      isFree={skill.isFree}
      installCmd={skill.installCmd || ""}
      sourceUrl={skill.sourceUrl}
      sourceType={skill.sourceType}
      compatibility={skill.compatibility}
      tags={skill.tags || ""}
      hidden={skill.hidden}
      skillContent={skillContent}
    />
  );
}
