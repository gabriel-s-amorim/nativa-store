import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import { useParams } from "wouter";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  if (slug !== "bolsas") {
    return <NotFound />;
  }

  return <Home initialCategory="Bolsas" />;
}
