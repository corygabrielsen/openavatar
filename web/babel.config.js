module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      'styled-components',
      {
        // ssr: true: Enables server-side rendering support for
        // styled-components. This ensures consistent styling between
        // client-side and server-side rendering.
        ssr: true,
        // displayName: true: When enabled, this option gives your styled
        // components more readable class names, which is helpful during
        // development and debugging.
        displayName: true,
        // preprocess: false: Disables the use of a custom preprocessor for
        // styled-components' CSS. In this specific case, the default behavior
        // of styled-components is sufficient for the intended use, and adding
        // a custom preprocessor would only introduce unnecessary complexity.
        preprocess: false,
      },
    ],
  ],
}
