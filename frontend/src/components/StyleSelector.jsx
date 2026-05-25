import {
    BriefcaseIcon,
    ChevronDownIcon,
    CpuIcon,
    Gamepad2Icon,
    ImageIcon,
    PenToolIcon,
    RadioIcon,
    SkullIcon,
    SparkleIcon,
    SquareIcon,
    ZapIcon,
} from 'lucide-react'
import React from 'react'
import { thumbnailStyles } from '../assets/assets'

const StyleSelector = ({ style, setStyle, styleDropdownOpen, setStyleDropdownOpen }) => {

    const styleDescriptions = {
        "Bold & Graphic": "Oversized title, stroke/shadow, punchy contrast",
        "Minimalist": "Short title, negative space, restrained palette",
        "Photorealistic": "DSLR realism, title in lower third",
        "Illustrated": "Vector art, title woven into composition",
        "Tech/Futuristic": "Neon edges, holographic, sleek sans title",
        "Cyberpunk": "Neon city, glitch, chrome typography",
        "Gaming": "HUD overlays, RGB energy, esports props",
        "Horror / Dark": "Moody shadows, thriller atmosphere",
        "Retro / Vaporwave": "80s grid, synth sunset, retro chrome",
        "Corporate": "Clean professional, trust icons, polished",
    }

    const styleIcons = {
        "Bold & Graphic": <SparkleIcon className="h-4 w-4" />,
        "Minimalist": <SquareIcon className="h-4 w-4" />,
        "Photorealistic": <ImageIcon className="h-4 w-4" />,
        "Illustrated": <PenToolIcon className="h-4 w-4" />,
        "Tech/Futuristic": <CpuIcon className="h-4 w-4" />,
        "Cyberpunk": <ZapIcon className="h-4 w-4" />,
        "Gaming": <Gamepad2Icon className="h-4 w-4" />,
        "Horror / Dark": <SkullIcon className="h-4 w-4" />,
        "Retro / Vaporwave": <RadioIcon className="h-4 w-4" />,
        "Corporate": <BriefcaseIcon className="h-4 w-4" />,
    }

    return (
        <div className='relative space-y-3 dark'>
            <label className='block text-sm font-medium text-zinc-200'>Thumbnail Style</label>
            <button
                onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                className="flex w-full items-center justify-between rounded-md border px-4
                py-3 text-left transition bg-white/8 border-white/10 text-zinc-200
    hover:bg-white/12">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                        {styleIcons[style]}
                        <span>{style}</span>
                    </div>
                    <p className="text-xs text-zinc-400">{styleDescriptions[style]}</p>
                </div>
                <ChevronDownIcon className={["h-5 w-5 text-zinc-400 transition-transform", styleDropdownOpen && "rotate-180"].join(" ")} />
            </button>

            {styleDropdownOpen && (
                <div className="absolute bottom-0 z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border
                 border-white/12 bg-black/20 backdrop-blur-3xl shadow-lg">
                    {thumbnailStyles.map((s) => (
                        <button key={s}
                            type='button'
                            onClick={() => { setStyle(s); setStyleDropdownOpen(false); }}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-black/30">
                            <div className='mt-0.5'>{styleIcons[s]}</div>
                            <div>
                                <p className='font-medium'>{s}</p>
                                <p className='text-xs text-zinc-400'>{styleDescriptions[s]}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default StyleSelector
