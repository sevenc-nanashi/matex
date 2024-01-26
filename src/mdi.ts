import pacote from "pacote";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import consola from "consola";
import semver from "semver";

export type Style = "filled" | "outlined" | "round" | "sharp" | "twotone";
const home = os.homedir();
if (!home) {
  throw new Error("Failed to get home directory");
}
const mdiCachePath = path.join(home, ".cache", "matex", "mdi");
export const getVersion = async () => {
  const packument = await pacote.packument("@material-design-icons/svg");
  return packument["dist-tags"].latest;
};
export const getPath = async (): Promise<{
  exists: boolean;
  path: string;
}> => {
  try {
    const version = await getVersion();
    const cachedPath = path.join(mdiCachePath, version);
    const exists = !!(await fs.stat(cachedPath).catch(() => false));
    await fs.mkdir(cachedPath, { recursive: true });
    return {
      exists,
      path: cachedPath,
    };
  } catch (e) {
    consola.warn("Failed to get latest version of @material-design-icons/svg");
    consola.warn(e);

    const cachedVersions = await fs.readdir(mdiCachePath).catch(() => []);
    if (cachedVersions.length === 0) {
      throw new Error("No cached versions found");
    }

    const latest = cachedVersions
      .map((v) => semver.parse(v))
      .flatMap((v) => v || [])
      .sort((a, b) => {
        return semver.compare(a, b);
      })[0];
    if (!latest) {
      throw new Error("Failed to get latest cached version");
    }
    return {
      exists: true,
      path: path.join(mdiCachePath, latest.version),
    };
  }
};

export const findIcon = async (
  basePath: string,
  style: Style,
  name: string
): Promise<string | undefined> => {
  const iconPath = path.join(basePath, style, `${name}.svg`);
  try {
    await fs.stat(iconPath);
    return iconPath;
  } catch (e) {
    return undefined;
  }
};
