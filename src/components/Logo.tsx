import logoAsset from "@/assets/arsalan-logo.asset.json";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src={logoAsset.url} alt="Arsalan Academy — Unlock Your Future" className={className} />;
}