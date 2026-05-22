import React, { useCallback, useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import { DownloadIcon, ImageIcon, Loader2Icon, SaveIcon } from 'lucide-react'

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

const PreviewPanel = ({
    thumbnail,
    loading,
    aspectRatio,
    overlayTitle,
    titlePosition,
    onTitlePositionChange,
    titleFontScale = 1,
    onTitleFontScaleChange,
    titleTextStyle = { fill: '#ffffff', outline: '#000000', outlineWidth: 2 },
    onTitleTextStyleChange,
    apiBaseUrl = 'http://localhost:5000',
    onSaved,
}) => {
    const containerRef = useRef(null)
    const draggingRef = useRef(false)
    const [downloadBusy, setDownloadBusy] = useState(false)
    const [saveBusy, setSaveBusy] = useState(false)

    const aspectClasses = {
        '16:9': 'aspect-video',
        '1:1': 'aspect-square',
        '9:16': 'aspect-[9/16]',
    }

    const scale = clamp(Number(titleFontScale) || 1, 0.45, 2)
    const fill = titleTextStyle?.fill ?? '#ffffff'
    const outline = titleTextStyle?.outline ?? '#000000'
    const outlineW = clamp(Number(titleTextStyle?.outlineWidth) ?? 2, 0, 5)

    const overlayFontStyle = {
        wordBreak: 'break-word',
        fontSize: `clamp(${0.7 * scale}rem, ${3.2 * scale}vw, ${2 * scale}rem)`,
        color: fill,
        ...(outlineW > 0
            ? {
                  WebkitTextStroke: `${outlineW}px ${outline}`,
                  paintOrder: 'stroke fill',
              }
            : {
                  textShadow: `0 0 10px ${outline}99, 0 2px 4px ${outline}`,
              }),
    }

    const updatePositionFromClient = useCallback(
        (clientX, clientY) => {
            const el = containerRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const xPct = ((clientX - rect.left) / rect.width) * 100
            const yPct = ((clientY - rect.top) / rect.height) * 100
            onTitlePositionChange({
                xPct: clamp(xPct, 4, 96),
                yPct: clamp(yPct, 4, 96),
            })
        },
        [onTitlePositionChange],
    )

    const onOverlayPointerDown = (e) => {
        if (!thumbnail?.image_url || loading) return
        draggingRef.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        updatePositionFromClient(e.clientX, e.clientY)
    }

    const onOverlayPointerMove = (e) => {
        if (!draggingRef.current) return
        updatePositionFromClient(e.clientX, e.clientY)
    }

    const onOverlayPointerUp = (e) => {
        draggingRef.current = false
        try {
            e.currentTarget.releasePointerCapture(e.pointerId)
        } catch {
            /* already released */
        }
    }

    const exportPreviewBlob = useCallback(async () => {
        const el = containerRef.current
        if (!el) throw new Error('Preview is not ready.')

        const imgEl = el.querySelector('img')
        if (!imgEl || !imgEl.complete || imgEl.naturalWidth === 0) {
            throw new Error('Image is still loading. Try again in a moment.')
        }

        const ow = Math.max(1, el.offsetWidth)
        const oh = Math.max(1, el.offsetHeight)
        const nw = imgEl.naturalWidth
        const nh = imgEl.naturalHeight
        const prFromW = nw / ow
        const prFromH = nh / oh
        const pixelRatio = Math.min(4, Math.max(1, Math.min(prFromW, prFromH)))

        const blob = await toBlob(el, {
            pixelRatio,
            cacheBust: true,
            skipFonts: false,
        })
        if (!blob) throw new Error('Could not create image file.')
        return blob
    }, [])

    const handleDownload = async () => {
        if (!thumbnail?.image_url || downloadBusy) return
        const text = (overlayTitle || thumbnail.title || '').trim()
        if (!text) {
            alert('Add a title before downloading.')
            return
        }

        setDownloadBusy(true)
        try {
            const blob = await exportPreviewBlob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            const safe = text.replace(/[^\w\s-]/g, '').trim().slice(0, 80) || 'thumbnail'
            link.download = `${safe}.png`
            link.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            alert(
                err?.message ||
                    'Download failed. If images are from another domain, ensure CORS headers allow export.',
            )
        } finally {
            setDownloadBusy(false)
        }
    }

    const handleSaveToServer = async () => {
        if (!thumbnail?.image_url || saveBusy || !onSaved) return
        const text = (overlayTitle || thumbnail.title || '').trim()
        if (!text) {
            alert('Add a title before saving.')
            return
        }

        setSaveBusy(true)
        try {
            const blob = await exportPreviewBlob()
            const form = new FormData()
            form.append('file', blob, 'thumbnail.png')

            const res = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/thumbnail/save`, {
                method: 'POST',
                body: form,
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                throw new Error(data.error || 'Save failed.')
            }
            if (!data.image_url) {
                throw new Error('Server did not return image URL.')
            }
            onSaved(data.image_url)
        } catch (err) {
            alert(err?.message || 'Could not save thumbnail.')
        } finally {
            setSaveBusy(false)
        }
    }

    const imageSrc = thumbnail?.image_url
    const isDataUrl = typeof imageSrc === 'string' && imageSrc.startsWith('data:')
    const isUnsaved = Boolean(imageSrc && isDataUrl)
    const showOverlay = Boolean(overlayTitle?.trim() && imageSrc && !loading)
    const showToolbar = Boolean(imageSrc && !loading)

    return (
        <div className="relative mx-auto w-full max-w-2xl">
            <div
                ref={containerRef}
                className={`relative overflow-hidden rounded-lg ${aspectClasses[aspectRatio]}`}
            >
                {loading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/25">
                        <Loader2Icon className="size-8 animate-spin text-zinc-400" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-zinc-200">
                                AI is creating your background...
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">This may take 10–20 seconds</p>
                        </div>
                    </div>
                )}

                {!loading && imageSrc && (
                    <div className="relative h-full w-full">
                        <img
                            src={imageSrc}
                            alt=""
                            {...(isDataUrl ? {} : { crossOrigin: 'anonymous' })}
                            className="h-full w-full object-cover"
                        />
                        {showOverlay && (
                            <div
                                aria-label="Draggable title"
                                className="absolute z-10 max-w-[92%] cursor-grab touch-none select-none active:cursor-grabbing"
                                style={{
                                    left: `${titlePosition.xPct}%`,
                                    top: `${titlePosition.yPct}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                onPointerDown={onOverlayPointerDown}
                                onPointerMove={onOverlayPointerMove}
                                onPointerUp={onOverlayPointerUp}
                                onPointerCancel={onOverlayPointerUp}
                            >
                                <p
                                    className="text-center font-black leading-tight tracking-tight"
                                    style={overlayFontStyle}
                                >
                                    {overlayTitle}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!loading && !imageSrc && (
                    <div className="absolute inset-0 m-2 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-white/20 bg-black/25">
                        <div className="flex size-20 items-center justify-center rounded-full bg-white/10">
                            <ImageIcon className="size-10 text-white opacity-50" />
                        </div>
                        <div className="px-4 text-center">
                            <p className="font-medium text-zinc-200">Generate your first thumbnail</p>
                            <p className="mt-1 text-xs text-zinc-400">
                                Fill out the form and click Generate — then drag your title on the preview
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {showToolbar && (
                <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-black/20 px-4 py-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                            <span className="font-medium text-zinc-200">Title color</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={fill}
                                    onChange={(e) =>
                                        onTitleTextStyleChange?.((s) => ({
                                            ...s,
                                            fill: e.target.value,
                                        }))
                                    }
                                    className="h-9 w-12 cursor-pointer rounded border border-white/20 bg-transparent p-0"
                                />
                                <span className="font-mono text-xs text-zinc-500">{fill}</span>
                            </div>
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                            <span className="font-medium text-zinc-200">Outline color</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={outline}
                                    onChange={(e) =>
                                        onTitleTextStyleChange?.((s) => ({
                                            ...s,
                                            outline: e.target.value,
                                        }))
                                    }
                                    className="h-9 w-12 cursor-pointer rounded border border-white/20 bg-transparent p-0"
                                />
                                <span className="font-mono text-xs text-zinc-500">{outline}</span>
                            </div>
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                            <span className="font-medium text-zinc-200">Outline width</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min={0}
                                    max={5}
                                    step={0.5}
                                    value={outlineW}
                                    onChange={(e) =>
                                        onTitleTextStyleChange?.((s) => ({
                                            ...s,
                                            outlineWidth: Number(e.target.value),
                                        }))
                                    }
                                    className="h-2 w-full min-w-0 cursor-pointer accent-pink-500"
                                />
                                <span className="w-8 shrink-0 text-xs text-zinc-400">{outlineW}px</span>
                            </div>
                        </label>
                    </div>

                    <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                        <span className="font-medium text-zinc-200">Title size</span>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={0.45}
                                max={2}
                                step={0.05}
                                value={scale}
                                onChange={(e) => onTitleFontScaleChange(Number(e.target.value))}
                                className="h-2 w-full min-w-[120px] cursor-pointer accent-pink-500"
                            />
                            <span className="w-10 shrink-0 tabular-nums text-xs text-zinc-400">
                                {Math.round(scale * 100)}%
                            </span>
                        </div>
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                        {isUnsaved && onSaved && (
                            <button
                                onClick={handleSaveToServer}
                                disabled={loading || saveBusy || downloadBusy}
                                type="button"
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 sm:order-first sm:mr-auto"
                            >
                                <SaveIcon className="size-4" />
                                {saveBusy ? 'Saving…' : 'Save to library'}
                            </button>
                        )}
                        <button
                            onClick={handleDownload}
                            disabled={loading || downloadBusy || saveBusy}
                            type="button"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-linear-to-b from-pink-500 to-pink-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-pink-600 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <DownloadIcon className="size-4" />
                            {downloadBusy ? 'Preparing…' : 'Download with title'}
                        </button>
                    </div>
                </div>
            )}

            {/* {showToolbar && overlayTitle?.trim() && (
                <p className="mt-2 text-center text-xs text-zinc-500">
                    {isUnsaved
                        ? 'Download or save after editing — preview matches export. Unsaved backgrounds are not stored on the server yet.'
                        : 'Download matches the preview (same layout as on screen).'}
                </p>
            )} */}
        </div>
    )
}

export default PreviewPanel
