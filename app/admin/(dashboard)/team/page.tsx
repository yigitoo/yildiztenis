import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { TeamManager } from "@/components/admin/team-manager";

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Takım"
        description="Ana sayfadaki takım üyelerini yönetin."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "Takım" },
        ]}
      />
      <TeamManager members={members} />
    </>
  );
}
