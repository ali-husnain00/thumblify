import React from 'react'
import { aspectRatios } from '../assets/assets'
import { RectangleHorizontal, RectangleVertical, Square } from 'lucide-react'

const AspectRatioSelector = ({ aspectRatio, setAspectRatio }) => {

    const iconMap = {
        '16:9': <RectangleHorizontal/>,
        '1:1': <Square/>,
        '9:16': <RectangleVertical/>,
    }

  return (
    <div className='space-y-3 dark'>
        <label className='block text-sm font-medium'>Aspect Ratio</label>
        <div className='flex flex-wrap gap-2'>
            {aspectRatios.map((ratio) => {
                const selected = aspectRatio === ratio;
                return (
                    <button key={ratio} type='button' className={`flex items-center gap-2 rounded-md px-5 py-2.5 text-sm transition border border-white/10 ${selected ? "bg-white/10" : "hover:bg-white/6"}`} onClick={() => setAspectRatio(ratio)}>
                        {iconMap[ratio]}
                        <span className='tracking-widest'>{ratio}</span>
                    </button>
                )
            })}
            </div>
        </div>
    )
}

export default AspectRatioSelector;