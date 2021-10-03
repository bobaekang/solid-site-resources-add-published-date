import { existsSync } from 'https://deno.land/std/fs/exists.ts';
import { extractLinks, fetchPublishedAt, appendPublishedAts } from './utils.ts';

const types = ['Articles', 'Podcasts', 'Videos'];

for (const type of types) {
  // read source file text
  const inputPath = `./input/${type}.data.ts`;
  if (!existsSync(inputPath)) {
    console.log(
      `NOTE: Input source file for resource type ${type} is not available at ${inputPath}. Skipping this resource type.`,
    );
  }
  const text = Deno.readTextFileSync(inputPath);

  // append published_at data
  const links = extractLinks(text);
  const publishedAts = await Promise.all(links.map(fetchPublishedAt));
  const updatedText = appendPublishedAts(text, publishedAts);

  // write updated file text
  const encoder = new TextEncoder();
  const data = encoder.encode(updatedText);
  const outputPath = `./output/${type}.data.ts`;
  if (!existsSync('./output')) Deno.mkdirSync('./output');
  Deno.writeFileSync(outputPath, data);
  console.log(
    `NOTE: Output source file for resource type ${type} is now available at ${outputPath}.`,
  );
}
