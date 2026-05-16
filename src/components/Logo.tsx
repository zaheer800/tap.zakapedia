import { Link } from 'react-router-dom'

interface LogoProps {
  linkTo?: string
  className?: string
}

// Dark backgrounds — negative margins pull in the PNG's built-in whitespace
export function Logo({ linkTo, className = '' }: LogoProps) {
  const content = (
    <div className={`flex items-center select-none ${className}`}>
      <span className="font-display italic text-2xl font-bold text-brand-text leading-none">Tap.</span>
      <img
        src="/ZakapediaLogo_White_Cropped.png"
        alt="Zakapedia"
        style={{
          height: '34px',
          width: 'auto',
          marginTop: '-10px',
          marginBottom: '-10px',
          marginLeft: '5px',
          marginRight: '30px',
        }}
      />
    </div>
  )
  if (linkTo) return <Link to={linkTo}>{content}</Link>
  return content
}

// Light backgrounds (dashboard)
export function LogoCompact({ linkTo, className = '' }: LogoProps) {
  const content = (
    <div className={`flex items-center select-none ${className}`}>
      <span className="font-display italic text-xl font-bold text-gray-900 leading-none mr-2">Tap.</span>
      <img
        src="/ZakapediaLogo_New.png"
        alt="Zakapedia"
        style={{
          height: '64px',
          width: 'auto',
          marginTop: '-18px',
          marginBottom: '-18px',
          marginLeft: '-10px',
          marginRight: '-6px',
        }}
      />
    </div>
  )
  if (linkTo) return <Link to={linkTo}>{content}</Link>
  return content
}

// Footer attribution
export function ZakapediaAttribution() {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-brand-faint tracking-widest uppercase">A product by</p>
      <a
        href="https://www.zakapedia.in"
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-80 hover:opacity-100 transition-opacity"
        style={{ display: 'block', overflow: 'hidden', height: '48px' }}
      >
        <img
          src="/ZakapediaLogo_New_White.png"
          alt="Zakapedia"
          style={{
            height: '140px',
            width: 'auto',
            marginTop: '-45px',
            marginLeft: '2px',
            marginRight: '-20px',
          }}
        />
      </a>
    </div>
  )
}
