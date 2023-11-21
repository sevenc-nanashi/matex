# matex / Merge 2 Material Icons

Matex is a tool to merge 2 material icons to create icon like [Edit Note](https://fonts.google.com/icons?selected=Material+Symbols+Outlined:edit_note:FILL@0;wght@400;GRAD@0;opsz@24&icon.query=edit).

## Usage

1. Install this package:

```bash
npm install @sevenc-nanashi/matex
```

2. Write recipe file:

```yml
# matex.yml
with_symbols.svg:
  saveChecklist: save + done
  saveAudio: save + music_note
single.svg: check + shopping_cart
```

3. Run matex:

```bash
$ npx @sevenc-nanashi/matex --recipe matex.yml --output public
```

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
