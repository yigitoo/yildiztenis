import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { MessageTable } from "@/components/admin/message-table";

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = messages.map(m => ({
    ...m,
    createdAt: format(m.createdAt, "d MMM yyyy, HH:mm", { locale: tr }),
  }));

  return (
    <>
      <PageHeader
        title="Mesajlar"
        description="İletişim formundan gelen tüm mesajlar."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "Mesajlar" },
        ]}
      />
      <MessageTable messages={serialized} />
    </>
  );
}
