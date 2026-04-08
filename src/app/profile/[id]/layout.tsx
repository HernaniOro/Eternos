import { profiles } from "@/data/profiles";

export function generateStaticParams() {
  return profiles.map((p) => ({ id: p.id }));
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
