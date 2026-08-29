import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://hyprogress.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "HyProgress — Hypixel Bedwars XP Tracker",
		template: "%s · HyProgress"
	},
	description: "Search any Hypixel Bedwars player and see exactly what it takes to reach their next level — broken down by wins, final kills, beds broken, and playtime.",
	keywords: ["Hypixel", "Bedwars", "XP tracker", "Hypixel level calculator", "Bedwars stats", "Minecraft", "HyProgress"],
	authors: [{ name: "Youbella" }],
	creator: "Youbella",
	icons: {
		icon: "/logo.png",
		shortcut: "/logo.png",
		apple: "/logo.png"
	},
	openGraph: {
		title: "HyProgress — Hypixel Bedwars XP Tracker",
		description: "Know exactly what's left. Search a player and see a clear breakdown of what closes the gap to their next star.",
		url: SITE_URL,
		siteName: "HyProgress",
		images: [{ url: "/logo.png", width: 512, height: 512, alt: "HyProgress" }],
		locale: "en_US",
		type: "website"
	},
	twitter: {
		card: "summary",
		title: "HyProgress — Hypixel Bedwars XP Tracker",
		description: "Know exactly what's left to reach your next Bedwars level.",
		images: ["/logo.png"]
	},
	robots: {
		index: true,
		follow: true
	}
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-[#0B0B0F] text-stone-100 antialiased">{children}</body>
		</html>
	);
}
