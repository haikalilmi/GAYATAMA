import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "./(auth)/actions";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "ImpactQuest",
  description:
    "Complete verified social missions and track the impact you create.",
};

const themeScript = `(function(){try{var t=localStorage.getItem("iq-theme");var d=t?t==="dark":true;var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar user={user} logoutAction={logoutAction} />
          <div className="flex-1 min-w-0 md:pl-72">
            <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
