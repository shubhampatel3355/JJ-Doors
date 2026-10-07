import MarqueeComponent from "@/components/common/Marquee";

import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";

import Breadcumb2 from "@/components/shop/Breadcumb2";

import ShopDetails from "@/components/shop/ShopDetails";
import { products } from "@/data/products";
export const metadata = {
  title: "Shop Details || JJ Doors - Premium Door Collections",
};

export async function generateStaticParams() {
  return products.map((elm) => ({
    id: `${elm.id}`,
  }));
}
export default async function page({ params }) {
  const { id } = await params;

  const product = products.filter((p) => p.id == id)[0] || products[0];
  return (
    <>
      <Header3 transparent={true} />
      <Breadcumb2 />
      <ShopDetails product={product} />
      <MarqueeComponent />
      <Footer6 />
    </>
  );
}
