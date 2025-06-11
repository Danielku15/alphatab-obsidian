# Obsidian alphaTab Plugin

This is a starter/template plugin for integrating alphaTab with Obsidian (https://obsidian.md).
It shows how to handle aspects like the background worker, font loading, soundfont loading and general file loading. 

This is a very minimal example to get started for a real plugin. 

See https://github.com/CoderLine/alphaTab/discussions/1933

## What's special. 

There are some bits to know on how to integrate alphaTab with Obsidian:

1. Obsidian doesn't serve plugin files via a URL schema but you can access the filesystem within the vault via special APIs. 
2. This plugins do not use ESM, all code relies on UMD. 
3. We copy the UMD alphaTab file to the plugin directory (via `esbuild-plugin-copy`) to have it available. Then the plugin loads the file and creates a Blob URI for further use via [`scriptFile`](https://www.alphatab.net/docs/reference/settings/core/scriptfile/).
4. For the Bravura SmuFL font file we use [`smuflFontSources`](https://next.alphatab.net/docs/reference/settings/core/smuflfontsources/) with another Blob URI as source (only available in 1.6.0).
5. The SoundFont we also load from disk and load it via [`loadSoundFont`](https://alphatab.net/docs/reference/api/loadsoundfont).
6. We initialize the alphaTab colors using the Obsidian styles to integrate well with the look&feel of Obsidian. 