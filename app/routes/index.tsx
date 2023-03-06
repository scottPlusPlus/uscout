import { redirect } from "@remix-run/node";

//nit to force rebuild

export async function loader() {
  return redirect("/c/startup");
}
