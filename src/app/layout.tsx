import "./../styles/globals.css";

export const metadata = { title: "JobCost Tracker", description: "Adler Hydro Vac" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <a href="/">JobCost Tracker</a>
          <a href="/new">New Job</a>
          <a href="/admin">Admin</a>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
