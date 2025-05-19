const path = import.meta.dir + "/../config.json";

export const config = JSON.parse(await Bun.file(path).text());
