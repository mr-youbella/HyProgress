import { isAdminPreview } from "@/lib/admin_auth";
import HyprogressTracker from "../../HyprogressTracker";

export default async function PlayerPage({ params }: { params: Promise<{ username: string }>; }) {
	const { username } = await params;
	const is_admin = await isAdminPreview();

	return <HyprogressTracker initialUsername={username} adminPreview={is_admin}/>;
}
