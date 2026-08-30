import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "statsify.net"
			}
		]
	}
};

export default nextConfig;
