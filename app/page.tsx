import { isAdminPreview } from "@/lib/admin_auth";
import HyprogressTracker from "./HyprogressTracker";

export default async function Page()
{
	const is_admin = await isAdminPreview();
	return <HyprogressTracker adminPreview={is_admin}/>;
}
