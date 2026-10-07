import { redirect } from "next/navigation";

export default function RedirectToAddProduct() {
  redirect("/admin-products/add");
}
