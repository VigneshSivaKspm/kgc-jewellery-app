// A decorative "haram" (layered necklace) rendered in gold + silver gradients.
// Pure SVG, no external images, so it always loads and stays crisp on any screen.
export default function JewelArt({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 720 300"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldChain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0C96B" />
          <stop offset="50%" stopColor="#C9922A" />
          <stop offset="100%" stopColor="#8A6416" />
        </linearGradient>
        <linearGradient id="silverChain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2F4F6" />
          <stop offset="50%" stopColor="#C9CDD3" />
          <stop offset="100%" stopColor="#8B909A" />
        </linearGradient>
        <radialGradient id="pendant" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FCEFC7" />
          <stop offset="55%" stopColor="#F0C96B" />
          <stop offset="100%" stopColor="#8A6416" />
        </radialGradient>
      </defs>

      {/* outer silver strand */}
      <path
        d="M20,10 C160,150 560,150 700,10"
        fill="none"
        stroke="url(#silverChain)"
        strokeWidth="3"
        strokeDasharray="1 13"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* middle gold strand */}
      <path
        d="M60,10 C200,170 520,170 660,10"
        fill="none"
        stroke="url(#goldChain)"
        strokeWidth="3.5"
        strokeDasharray="1 11"
        strokeLinecap="round"
      />

      {/* inner gold strand carrying the pendants */}
      <path
        id="innerStrand"
        d="M110,10 C230,190 490,190 610,10"
        fill="none"
        stroke="url(#goldChain)"
        strokeWidth="4"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />

      {/* small gold beads along the inner strand */}
      {[130, 190, 250, 470, 530, 590].map((cx, i) => (
        <circle
          key={cx}
          cx={cx}
          cy={i < 3 ? 60 + i * 22 : 60 + (5 - i) * 22}
          r="5.5"
          fill="url(#goldChain)"
        />
      ))}

      {/* center pendant — a stylised haram medallion */}
      <g transform="translate(360,178)">
        <polygon
          points="0,-26 24,-8 15,22 -15,22 -24,-8"
          fill="url(#pendant)"
          stroke="#8A6416"
          strokeWidth="1.5"
        />
        <circle cx="0" cy="-4" r="7" fill="#FFF7E1" opacity="0.85" />
        <circle cx="0" cy="34" r="6" fill="url(#goldChain)" />
      </g>

      {/* two smaller side pendants */}
      <g transform="translate(255,132)">
        <circle r="11" fill="url(#pendant)" stroke="#8A6416" strokeWidth="1.2" />
      </g>
      <g transform="translate(465,132)">
        <circle r="11" fill="url(#pendant)" stroke="#8A6416" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
