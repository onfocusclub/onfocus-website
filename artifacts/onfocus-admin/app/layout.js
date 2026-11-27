import "./globals.css";

export const metadata = {
  title: "Onfocus Admin | Events Management",
  description: "Official Admin Dashboard to add, edit, and delete Onfocus events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-zinc-900 font-sans">
        {children}
      </body>
    </html>
  );
}
