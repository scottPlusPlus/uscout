import { installGlobals } from "@remix-run/node";
import "@testing-library/jest-dom/extend-expect";
import { PrismockClient } from "prismock";
import { overrideDbInstance } from "~/db.server";

installGlobals();
beforeEach(() => {
    overrideDbInstance(new PrismockClient());
  });
  