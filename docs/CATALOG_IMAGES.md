# Fotos do catálogo sem a marca do fabricante

As fotos demonstrativas foram retocadas para remover os logotipos visíveis da Gocase, incluindo relevos, etiquetas laterais, patches de couro, gargalos e ferragens. Os produtos, suas variantes e as cores do catálogo foram mantidos.

- **169 fotos principais:** edição com a ferramenta integrada `image_gen`, uma imagem por edição, preservando o produto e reconstruindo a textura local onde havia a marca.
- **104 miniaturas:** derivadas da foto limpa do mesmo produto e da mesma cor. Isso evita reproduzir a marca nas referências pequenas.
- **4 fotos de suplementos:** mantidas, pois não são produtos Gocase.

Os arquivos usados pelo frontend estão em `public/images/products`; as cópias para processamento de IA estão em `server/assets/catalog`. Os nomes dos arquivos e as URLs do catálogo foram preservados para manter compatibilidade com projetos salvos.

## Prompt de edição

O prompt abaixo foi adaptado ao nome de cada produto e às áreas onde a marca aparecia. Em garrafas e mochilas, também foram indicadas explicitamente as marcas do gargalo e das etiquetas.

> Retouch this exact product catalog photograph. Remove all Gocase brand lettering and wordmarks, including small debossed or embossed marks on the main product, narrow side tags on both sides, leather labels, zippers, handles, caps and neck rings. Preserve blank tags and patches and reconstruct matching local surface texture. Preserve the exact product shape, dimensions, proportions, original framing, original color, material, lighting, shadows, all accessories and background. Do not crop, zoom, move, recolor or redesign the product. No new logos or text. Edit only the branding.

Os prompts de geração de mockups e de kits na aplicação também pedem para manter os produtos sem a marca original do fabricante e preservar somente a arte enviada pelo usuário.

A origem das fotografias continua registrada em [catalog-sources.json](catalog-sources.json). O tratamento visual não muda os avisos de [assets de terceiros](../THIRD_PARTY_ASSETS.md).
