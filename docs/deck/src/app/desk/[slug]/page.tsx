import { notFound } from "next/navigation";
import { DocumentPage } from "@/components/DocumentPage";
import { loadDocument } from "@/lib/library";

export default async function DeskDocument({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = loadDocument("desk", slug);
  if (!doc) notFound();
  return <DocumentPage slug={slug} {...doc} />;
}
