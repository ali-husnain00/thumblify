import React from 'react'
import { colorSchemes } from '../assets/assets'

const ColorSchemeSelector = ({ colorSchemeId, setColorSchemeId }) => {
    return (
        <div className='space-y-3'>
            <label className='block text-sm font-medium
            text-zinc-200'>Color Scheme</label>
            <div className='grid grid-cols-4 gap-3 sm:grid-cols-5'>
                {colorSchemes.map((scheme) => (
                    <button key={scheme.id}
                        onClick={() => setColorSchemeId(scheme.id)}
                        className={`relative rounded-lg transition-all ${colorSchemeId === scheme.id && "ring-2 ring-pink-500"}`}
                        title={scheme.name}>
                        <div className='flex h-10 rounded-lg overflow-hidden'>
                            {scheme.colors.map((color, i) => (
                                <div key={i} className='flex-1' style={{ backgroundColor: color }} />
                            ))}
                        </div>
                    </button>
                ))}
            </div>
            <p className='text-xs text-zinc-400'>Selected: {colorSchemes.find((scheme) => scheme.id === colorSchemeId).name}</p>
        </div>
    )
}

export default ColorSchemeSelector