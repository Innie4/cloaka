import { LandingPage } from "@/components/marketing/landing-page";
import { getLandingData } from "@/lib/api";

export default async function HomePage() {
  const data = await getLandingData();

  return <LandingPage data={data} />;
}
