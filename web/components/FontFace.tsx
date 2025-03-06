import { createGlobalStyle } from 'styled-components'

interface FontFaceProps {
  baseUrl: string
}

const FontFace = createGlobalStyle<FontFaceProps>`
  @font-face {
    font-family: 'VT323';
    font-style: normal;
    font-weight: normal;
    src: local('VT323'), local('VT323-Regular'),
         url(${(props) => props.baseUrl}/fonts/VT323/VT323-Regular.woff2) format('woff2'),
         url(${(props) => props.baseUrl}/fonts/VT323/VT323-Regular.woff) format('woff');
  }
`

export default FontFace
