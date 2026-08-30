import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://hyprogress.vercel.app";
const SITE_NAME = "Hyprogress";
const SITE_DESCRIPTION = "Search any Hypixel Bedwars player and see exactly what it takes to reach their next level — broken down by wins, final kills, beds broken, and playtime.";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),

	title: {
		default: `${SITE_NAME} — Hypixel Bedwars XP Tracker`,
		template: `%s · ${SITE_NAME}`
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,

	keywords: [
		"Hypixel",
		"Bedwars",
		"Hypixel Bedwars",
		"XP tracker",
		"Hypixel level calculator",
		"Bedwars stats",
		"Bedwars XP calculator",
		"Minecraft stats tracker",
		"Hypixel stats checker",
		"Hyprogress"
	],

	authors: [{ name: "Youbella", url: SITE_URL }],
	creator: "Youbella",
	publisher: "Youbella",

	category: "technology",

	alternates: {
		canonical: SITE_URL
	},

	formatDetection: {
		telephone: false,
		email: false,
		address: false
	},

	icons: {
		icon: [
			{ url: "/logo.png", type: "image/png" }
		],
		shortcut: "/logo.png",
		apple: "/logo.png"
	},

	manifest: "/manifest.webmanifest",

	openGraph: {
		type: "website",
		locale: "en_US",
		url: SITE_URL,
		siteName: SITE_NAME,
		title: `${SITE_NAME} — Hypixel Bedwars XP Tracker`,
		description: "Know exactly what's left. Search a player and see a clear breakdown of what closes the gap to their next star.",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: `${SITE_NAME} — Hypixel Bedwars XP Tracker`
			}
		]
	},

	twitter: {
		card: "summary_large_image",
		title: `${SITE_NAME} — Hypixel Bedwars XP Tracker`,
		description: "Know exactly what's left to reach your next Bedwars level.",
		images: ["/og-image.png"]
	},

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1
		}
	},

	verification: {
		google: "rnlNX8zZkZDeOpPcLQEonRc0uYXRREWnZ2639zanKr8",
	},

	referrer: "origin-when-cross-origin"
};

export const viewport: Viewport = {
	themeColor: "#0B0B0F",
	colorScheme: "dark",
	width: "device-width",
	initialScale: 1
};

const structuredData = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	name: SITE_NAME,
	url: SITE_URL,
	description: SITE_DESCRIPTION,
	applicationCategory: "GameApplication",
	operatingSystem: "Any",
	offers: {
		"@type": "Offer",
		price: "0",
		priceCurrency: "USD"
	}
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
				/>
			</head>
			<body className="bg-[#0B0B0F] text-stone-100 antialiased">{children}</body>
		</html>
	);
}