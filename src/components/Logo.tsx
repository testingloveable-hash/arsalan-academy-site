const logoSrc = "/assets/images/1784044475344.jpg";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src={logoSrc} alt="Arsalan Academy — Unlock Your Future" className={className} />;
}