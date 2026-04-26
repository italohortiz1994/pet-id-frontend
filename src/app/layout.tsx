import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/logout/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSessionToken } from "@/lib/api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pet ID",
  description: "Painel para cadastro, consulta e manutencao de pets.",
};

const themeScript = `
  try {
    var theme = window.localStorage.getItem("pet-id-theme");
    var isLight = theme === "light";
    document.documentElement.dataset.theme = isLight ? "light" : "dark";
    document.documentElement.classList.toggle("theme-light", isLight);
  } catch {}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoggedIn = Boolean(await getSessionToken());

  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <div className="aurora" aria-hidden="true" />
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <header className="glass-panel site-header mb-6 flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/" className="text-lg font-semibold tracking-[0.2em] uppercase">
                Pet ID
              </Link>
              
            </div>

            <nav className="desktop-nav site-nav-menu text-sm" aria-label="Menu principal">
              <Link href="/" className="nav-link">
                Dashboard
              </Link>
              <details className="nav-dropdown">
                <summary className="nav-link nav-dropdown-trigger cursor-pointer list-none">
                  Serviços
                  <span aria-hidden="true" className="flex items-center justify-center">v</span>
                </summary>
                <div className="nav-dropdown-menu">
                  <Link href="/feed">Feed dos pets</Link>
                  <Link href="/amigos">Amigos pets</Link>
                  <Link href="/pets">Pets cadastrados</Link>
                  <Link href="/pets/new">Cadastrar pet</Link>
                  <Link href="/veterinarios">Veterinários</Link>
                  <Link href="/veterinarios/new">Cadastrar veterinário</Link>
                  <Link href="/tutores/new">Cadastrar tutor</Link>
                </div>
              </details>
              {isLoggedIn ? (
                <form action={logoutAction}>
                  <button type="submit" className="nav-link nav-button">
                    Sair
                  </button>
                </form>
              ) : (
                <Link href="/login" className="nav-link">
                  Entrar
                </Link>
              )}
              <Link href="/pets/new" className="nav-link nav-link--primary">
                Novo pet
              </Link>
              <ThemeToggle />
            </nav>

            <details className="mobile-nav">
              <summary className="nav-link site-nav-trigger cursor-pointer list-none" aria-label="Abrir menu">
                <span className="hamburger-icon" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="sr-only">Menu</span>
              </summary>
              <nav className="site-nav-menu text-sm" aria-label="Menu mobile">
                <Link href="/" className="nav-link">
                  Dashboard
                </Link>
                <details className="nav-dropdown">
                  <summary className="nav-link nav-dropdown-trigger cursor-pointer list-none">
                    Servicos
                    <span aria-hidden="true" className="flex items-center justify-center">v</span>
                  </summary>
                  <div className="nav-dropdown-menu">
                    <Link href="/feed">Feed dos pets</Link>
                    <Link href="/amigos">Amigos pets</Link>
                    <Link href="/pets">Pets cadastrados</Link>
                    <Link href="/pets/new">Cadastrar pet</Link>
                    <Link href="/veterinarios">Veterinarios</Link>
                    <Link href="/veterinarios/new">Cadastrar veterinario</Link>
                    <Link href="/tutores/new">Cadastrar tutor</Link>
                  </div>
                </details>
                {isLoggedIn ? (
                  <form action={logoutAction}>
                    <button type="submit" className="nav-link nav-button">
                      Sair
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="nav-link">
                    Entrar
                  </Link>
                )}
                <Link href="/pets/new" className="nav-link nav-link--primary">
                  Novo pet
                </Link>
                <ThemeToggle />
              </nav>
            </details>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
