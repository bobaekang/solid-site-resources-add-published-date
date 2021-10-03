# Append `published_at` data to solidjs.com Resources

This repo contains simple [Deno](https://deno.land/#installation) scripts to append `published_at` value to solidjs.com resources.

## Directions

1. Clone and `cd` into this repo
2. Copy the following resource data files from [`solidjs/solid-site/src/pages/Resources/`](https://github.com/solidjs/solid-site/tree/master/src/pages) to `input/`
   - `Articles.data.ts`
   - `Podcasts.data.ts`
   - `Videos.data.ts`
3. Run `deno run --allow-net --allow-read --allow-write mod.ts`
   - Updated source files will be created in `output/`

## Limitations

The current setup assumes that the way publisehd date information for each resource is encoded in the fetched HTML follows certain patterns. See the `switch` statement in `utils.ts > parseDatePublished()` for these patterns. If this assumption is not met, the `published_at` value will be set to `undefined`.

The current setup also assumes that each resource data object found in the input source files has the following shape:

- Its last property is for `categories`
- It has no `published_at` value

If these assumptions are not met, incorrect published date values will potentially be added to resource data.

## File structure

```
.
├── .vscode/        - vscode workspace settings (to enable Deno extension)
├── input/          - folder to put resource data files
├── output/         - folder to write updated resource data files to
├── .prettierrc     - copied from solidjs/solid-site
├── README.md
├── main.ts         - main script
└── utils.ts
```
