"use client";

import { Download, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DuplicateWorkshopButton } from "./duplicate-workshop-button";
import { DeleteWorkshopButton } from "./delete-workshop-button";

export function WorkshopActions({ workshopId, workshopTitle }: { workshopId: string; workshopTitle: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" render={<Link href={`/admin/workshops/${workshopId}`} />}>
        Düzenle
        <ArrowUpRight size={14} />
      </Button>
      <DuplicateWorkshopButton workshopId={workshopId} />
      <Button variant="ghost" size="sm" render={<a href={`/api/admin/export?workshopId=${workshopId}&scope=all&type=xlsx`} />}>
        <Download size={14} />
      </Button>
      <DeleteWorkshopButton workshopId={workshopId} workshopTitle={workshopTitle} />
    </div>
  );
}

export function WorkshopActionsMobile({ workshopId, workshopTitle }: { workshopId: string; workshopTitle: string }) {
  return (
    <div className="mt-3 flex gap-1">
      <Button variant="ghost" size="sm" render={<Link href={`/admin/workshops/${workshopId}`} />}>
        Düzenle
        <ArrowUpRight size={14} />
      </Button>
      <DuplicateWorkshopButton workshopId={workshopId} />
      <Button variant="ghost" size="sm" render={<a href={`/api/admin/export?workshopId=${workshopId}&scope=all&type=xlsx`} />}>
        <Download size={14} />
      </Button>
      <DeleteWorkshopButton workshopId={workshopId} workshopTitle={workshopTitle} />
    </div>
  );
}
