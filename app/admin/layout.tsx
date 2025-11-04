export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: Root layout already renders <html> and <body> and provides ThemeProvider.
  // Admin layout should not render another <html>/<body> to avoid hydration errors.
  return <>{children}</>;
}
