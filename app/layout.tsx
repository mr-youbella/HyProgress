import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Hyprogress",
	description: "Turn your Hypixel Bedwars XP gap into a real, playable goal."
};

export default function RootLayout({ children }: { children: React.ReactNode })
{
	return (
		<html lang="en">
			<body className="bg-slate-950 text-slate-50">{children}</body>
		</html>
	);
}
