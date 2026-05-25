import React, { useState } from 'react'
import { DownloadIcon, ImageIcon, Loader2Icon } from 'lucide-react'

const aspectClasses = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
}

const LOADING_MESSAGES = {
    enhancing: {
        title: 'Enhancing prompt with AI...',
        subtitle: 'Adding props, icons, and visual elements from your topic',
    },
    generating: {
        title: 'Generating your thumbnail...',
        subtitle: 'This may take 15–30 seconds',
    },
    '': {
        title: 'AI is creating your thumbnail...',
        subtitle: 'This may take 15–30 seconds',
    },
}

const PreviewPanel = ({ thumbnail, loading, loadingStage = '', aspectRatio }) => {
    const [downloadBusy, setDownloadBusy] = useState(false)

    const imageSrc = thumbnail?.image_url
    const loadingMsg = LOADING_MESSAGES[loadingStage] || LOADING_MESSAGES['']

    const handleDownload = async () => {
        if (!imageSrc || downloadBusy) return

        const safeName =
            (thumbnail?.title || 'thumbnail')
                .replace(/[^\w\s-]/g, '')
                .trim()
                .slice(0, 80) || 'thumbnail'

        setDownloadBusy(true)
        try {
            const res = await fetch(imageSrc)
            if (!res.ok) throw new Error('Could not fetch image for download.')
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${safeName}.png`
            link.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            alert(err?.message || 'Download failed.')
        } finally {
            setDownloadBusy(false)
        }
    }

    return (
        <div className="relative mx-auto w-full max-w-2xl">
            <div
                className={`relative overflow-hidden rounded-lg ${aspectClasses[aspectRatio] || aspectClasses['16:9']}`}
            >
                {loading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/25">
                        <Loader2Icon className="size-8 animate-spin text-zinc-400" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-zinc-200">
                                {loadingMsg.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">{loadingMsg.subtitle}</p>
                        </div>
                    </div>
                )}

                {!loading && imageSrc && (
                    <img
                        src={imageSrc}
                        alt={thumbnail?.title || 'Generated thumbnail'}
                        className="h-full w-full object-cover"
                    />
                )}

                {!loading && !imageSrc && (
                    <div className="absolute inset-0 m-2 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-white/20 bg-black/25">
                        <div className="flex size-20 items-center justify-center rounded-full bg-white/10">
                            <ImageIcon className="size-10 text-white opacity-50" />
                        </div>
                        <div className="px-4 text-center">
                            <p className="font-medium text-zinc-200">Generate your first thumbnail</p>
                            <p className="mt-1 text-xs text-zinc-400">
                                Fill out the form and click Generate to see your thumbnail here
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {imageSrc && !loading && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleDownload}
                        disabled={downloadBusy}
                        type="button"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-linear-to-b from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 active:scale-98 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 shadow-md shadow-pink-500/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
                    >
                        {downloadBusy ? (
                            <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                            <DownloadIcon className="size-4" />
                        )}
                        {downloadBusy ? 'Preparing…' : 'Download'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default PreviewPanel
