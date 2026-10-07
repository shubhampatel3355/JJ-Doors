import BlogDetails from "@/components/blog/BlogDetails";
import Cta from "@/components/homes/home-7/Cta";
import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";
import { blogs } from "@/data/blogs";

export async function generateStaticParams() {
  return blogs.map((elm) => ({
    id: `${elm.id}`,
  }));
}

export async function generateMetadata(props) {
  const params = await props.params;
  const blog = blogs.find((b) => b.id == params.id);
  return {
    title: blog ? `${blog.title} || JJ Doors` : "Blog Details || JJ Doors - Insights & Guides",
    description: blog?.excerpt || "Expert advice and guides on door selection, timber quality, and craftsmanship from JJ Doors.",
  };
}

export default async function BlogPageDetails(props) {
  const params = await props.params;
  return (
    <>
      <Header3 />
      <BlogDetails blogId={params.id} />
      <Cta />
      <Footer6 />
    </>
  );
}
