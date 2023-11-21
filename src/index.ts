#!/usr/bin/env node
import jsYaml from "js-yaml";
import fs from "node:fs/promises";
import path from "node:path";
import yargs from "yargs";
import { ingredient, recipeSchema } from "./schema.js";
import * as mdi from "./mdi.js";
import consola from "consola";
import pacote from "pacote";
import * as generator from "./generator.js";

const main = async () => {
  const args = await yargs(process.argv.slice(2)).options({
    recipe: {
      type: "string",
      description: "The path of recipe file.",
      demandOption: true,
      alias: "r",
    },
    output: {
      type: "string",
      description: "The path of output directory.",
      demandOption: true,
      alias: "o",
    },
  }).argv;

  const recipeFile = await fs.readFile(args.recipe);

  const recipe = recipeSchema.parse(jsYaml.load(recipeFile.toString()));

  const mdiPath = await mdi.getPath();
  if (mdiPath.exists) {
    consola.info(`MDI already downloaded: ${mdiPath.path}`);
  } else {
    consola.info("MDI not found, downloading...");
    await pacote.extract("@material-design-icons/svg@latest", mdiPath.path);
    consola.info(`Downloaded: ${mdiPath.path}`);
  }
  for (const [file, recipes] of Object.entries(recipe)) {
    consola.info(`${file}:`);
    let i = 0;
    const svgs: [string, string][] = [];
    for (const [name, ingredients] of Object.entries(
      typeof recipes === "string"
        ? {
            _: recipes,
          }
        : recipes
    )) {
      i++;
      const [, base, sub] = ingredients.match(ingredient) ?? [];
      if (name === "_") {
        consola.info(`  ${base} + ${sub}`);
      } else {
        consola.info(`  ${name}: ${base} + ${sub}`);
      }
      const basePath = await mdi.findIcon(mdiPath.path, "outlined", base);
      const subPath = await mdi.findIcon(mdiPath.path, "filled", sub);
      if (!basePath) {
        consola.error(`Icon not found: ${base} (base icon in #${i})`);
        return 1;
      }
      if (!subPath) {
        consola.error(`Icon not found: ${sub} (sub icon in #${i})`);
        return 1;
      }

      const svg = await generator.generate(basePath, subPath);
      svgs.push([name, svg]);
    }
    const outPath = path.join(args.output, file);
    let svg: string;
    if (svgs.length === 1 && svgs[0][0] === "_") {
      svg = svgs[0][1];
    } else {
      const symbols = svgs.map(
        ([name, svg]) =>
          `<symbol id="${name}" viewBox="0 0 ${generator.size} ${generator.size}">${svg}</symbol>`
      );
      svg = symbols.join("");
    }
    await fs.writeFile(
      outPath,
      `<?xml version="1.0" standalone="yes"?>
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${generator.size} ${generator.size}">
         ${svg}
       </svg>
       `.replace(/\n +/g, "\n")
    );
  }

  consola.info("Done.");

  return 0;
};

main().then(process.exit);
