import { redirect } from "@remix-run/node";
import { getCollection } from "~/models/collection.server";

//nit to force rebuild... 3...

export async function loader() {

  const startupCollection = await getCollection("startup");
  if (!startupCollection){
    return redirect("/login");
  }

  return redirect("/c/startup");
}
