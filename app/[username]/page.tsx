import HyprogressTracker from "../HyprogressTracker";

export default async function PlayerPage({ params }: { params: Promise<{ username: string }> }) {
	const { username } = await params;

	return <HyprogressTracker initialUsername={username} />;
}
