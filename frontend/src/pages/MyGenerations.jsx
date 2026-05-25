import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { DownloadIcon, ImageIcon, Loader2Icon, SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'
import SoftBackdrop from '../components/SoftBackdrop'
import { context } from '../Context/Context'

const API_BASE = 'http://localhost:5000'

const downloadImage = async (imageUrl, title) => {
    const safeName =
        (title || 'thumbnail').replace(/[^\w\s-]/g, '').trim().slice(0, 80) || 'thumbnail'
    const res = await fetch(imageUrl)
    if (!res.ok) throw new Error('Could not download image.')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${safeName}.png`
    link.click()
    URL.revokeObjectURL(url)
}

const formatDate = (iso) => {
    if (!iso) return ''
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    } catch {
        return ''
    }
}

const MyGenerations = () => {
    const { user } = useContext(context)
    const navigate = useNavigate()
    const [thumbnails, setThumbnails] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloadingId, setDownloadingId] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            toast.error('Please login to view your generations.')
            navigate('/login')
            return
        }

        const fetchList = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${API_BASE}/api/thumbnail/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json()
                if (res.status === 401) {
                    toast.error('Session expired. Please login again.')
                    navigate('/login')
                    return
                }
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to load thumbnails.')
                }
                setThumbnails(data.thumbnails || [])
            } catch (err) {
                toast.error(err.message || 'Could not load your generations.')
            } finally {
                setLoading(false)
            }
        }

        fetchList()
    }, [navigate, user])

    const handleDownload = async (e, thumb) => {
        e.stopPropagation()
        setDownloadingId(thumb.id)
        try {
            await downloadImage(thumb.image_url, thumb.title)
            toast.success('Download started.')
        } catch {
            toast.error('Download failed.')
        } finally {
            setDownloadingId(null)
        }
    }

    return (
        <>
            <SoftBackdrop />
            <div className="pt-24 min-h-screen">
                <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-center"
                    >
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100 md:text-3xl">
                                My Generations
                            </h1>
                        </div>
                    </motion.div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-4 py-24">
                            <Loader2Icon className="size-10 animate-spin text-zinc-400" />
                            <p className="text-sm text-zinc-400">Loading your thumbnails…</p>
                        </div>
                    )}

                    {!loading && thumbnails.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center">
                            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/10">
                                <ImageIcon className="size-8 text-zinc-400" />
                            </div>
                            <p className="font-medium text-zinc-200">No thumbnails yet</p>
                            <p className="mt-1 text-sm text-zinc-400">
                                Generate your first thumbnail and it will appear here.
                            </p>
                            <Link
                                to="/generate"
                                className="mt-6 inline-flex rounded-xl bg-linear-to-b from-pink-500 to-pink-600 px-5 py-2.5 text-sm font-medium text-white hover:from-pink-600 hover:to-pink-700"
                            >
                                Go to Generate
                            </Link>
                        </div>
                    )}

                    {!loading && thumbnails.length > 0 && (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {thumbnails.map((thumb, i) => (
                                <motion.article
                                    key={thumb.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => navigate(`/generate/${thumb.id}`)}
                                    className="group cursor-pointer overflow-hidden rounded-2xl border border-white/12 bg-white/8 shadow-xl transition hover:border-pink-500/40 hover:bg-white/10"
                                >
                                    <div className="relative aspect-video overflow-hidden bg-black/30">
                                        <img
                                            src={thumb.image_url}
                                            alt={thumb.title}
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => handleDownload(e, thumb)}
                                            disabled={downloadingId === thumb.id}
                                            className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-medium text-zinc-100 backdrop-blur-sm transition hover:bg-black/80 disabled:opacity-50"
                                        >
                                            {downloadingId === thumb.id ? (
                                                <Loader2Icon className="size-3.5 animate-spin" />
                                            ) : (
                                                <DownloadIcon className="size-3.5" />
                                            )}
                                            Download
                                        </button>
                                    </div>
                                    <div className="space-y-1 p-4">
                                        <h2 className="line-clamp-2 font-semibold text-zinc-100">
                                            {thumb.title}
                                        </h2>
                                        <p className="text-xs text-zinc-400">
                                            {thumb.style} · {thumb.aspect_ratio} ·{' '}
                                            {formatDate(thumb.created_at)}
                                        </p>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}

export default MyGenerations
