export const metadata = {
  title: "AIthon Turismo Ushuaia",
  description: "Guía de turismo alternativo para cruceristas en Ushuaia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
