import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Redirect to home page - interview generation will be handled differently
  // Users can select from available interviews
  redirect("/");
};

export default Page;
