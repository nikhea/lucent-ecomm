import React from 'react'

const sections = [
  {
    title: 'IN THE BOX',
    rows: [
      ['Headphones', 'Atlas Pro, hand-tuned at the factory'],
      ['Carrying case', 'Felted wool with magnetic closure'],
      ['Cables', 'USB-C charge cable, 3.5 mm audio cable'],
      ['Adapter', 'Airline 3.5 mm dual-plug adapter'],
    ],
  },
  {
    title: 'AUDIO',
    rows: [
      ['Drivers', '40 mm beryllium-coated dynamic'],
      ['Frequency response', '10 Hz - 40 kHz'],
      ['Impedance', '32 Ω, 110 dB SPL/mW'],
      ['Codecs', 'LDAC · aptX Adaptive · AAC · SBC'],
    ],
  },
  {
    title: 'BUILD & FIT',
    rows: [
      ['Frame', 'CNC-machined 6061 aluminum, brushed finish'],
      ['Ear pads', 'Replaceable memory foam, vegan leather'],
      ['Weight', '278 g · 9.8 oz'],
      ['Foldable', 'Flat-folding, gimballed yokes'],
    ],
  },
  {
    title: 'CONNECTIVITY',
    rows: [
      ['Wireless', 'Bluetooth 5.3, multipoint to 2 devices'],
      ['Wired', 'USB-C (24-bit/96 kHz) + 3.5 mm analog'],
      ['Battery', '40 h (ANC off), 30 h (ANC on)'],
      ['Charge time', 'Full: 90 min · Quick: 3 h in 5 min'],
    ],
  },
]

export function Specifications() {
  return (
    <div className="pt-10 mt-10 border-t border-white/10">
      <div className="text-xs tracking-widest text-white/50 mb-2">SPECIFICATIONS</div>
      <h2 className="text-2xl font-bold mb-6">Built Like A Pro Tool, Tuned For Daily Use</h2>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        {sections.map((sec) => (
          <div key={sec.title}>
            <div className="bg-white/[0.04] px-4 py-2 text-xs font-semibold tracking-widest">{sec.title}</div>
            {sec.rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 px-4 py-3 border-t border-white/10 text-sm">
                <div className="text-white/60">{k}</div>
                <div className="text-white">{v}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
