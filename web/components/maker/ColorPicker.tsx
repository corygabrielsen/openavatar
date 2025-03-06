import { GithubPicker } from 'react-color'

interface ColorPickerProps {
  onSwatchHover: (color: { hex: string }) => void
  onChangeComplete: (color: { hex: string }) => void
  onClose: () => void
}

const ColorPicker = ({ onSwatchHover, onChangeComplete, onClose }: ColorPickerProps) => {
  return (
    <div
      id="colorPicker"
      style={{ padding: '0.5em', height: 'fit-content', width: 'fit-content' }}
      onMouseLeave={onClose}
    >
      <GithubPicker onSwatchHover={onSwatchHover} onChangeComplete={onChangeComplete} />
    </div>
  )
}

export default ColorPicker
