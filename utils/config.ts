import * as fs from "fs/promises";
import { resolve } from "path";

const path = resolve(__dirname, "../config.json");

export const config = JSON.parse(await fs.readFile(path, "utf-8"));
