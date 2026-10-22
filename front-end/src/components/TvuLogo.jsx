import logo from '../assets/images/logo-tvu.png'

export default function TvuLogo({ size = 60 }) {
  return <img src={logo} alt="Đại học Trà Vinh" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', borderRadius: '50%', flexShrink: 0 }} />
}
