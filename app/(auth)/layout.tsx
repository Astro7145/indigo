export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen flex-1 items-center justify-center">{children}</div>;
}
