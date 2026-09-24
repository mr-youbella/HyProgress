import HyprogressTracker from "../../HyprogressTracker";

export default async function PlayerPage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
	const { username } = await params;
	const query = await searchParams;
	const isAdminPreview = query.from === "admin";

	return <HyprogressTracker initialUsername={username} adminPreview={isAdminPreview} />;
}
