import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react';
import SoftBackdrop from '../components/SoftBackdrop';
import AspectRatioSelector from '../components/AspectRatioSelector';
import { colorSchemes } from '../assets/assets';
import StyleSelector from '../components/StyleSelector';
import ColorSchemeSelector from '../components/ColorSchemeSelector';
import PreviewPanel from '../components/PreviewPanel';
import { context } from '../Context/Context';
import { toast } from 'sonner';

const Generate = () => {
    const { id } = useParams()

    const {user} = useContext(context);
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [colorSchemeId, setColorSchemeId] = useState(colorSchemes[0].id);
    const [style, setStyle] = useState('Bold & Graphic');
    const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

    const generateThumbnail = async () => {

        if (!user || !user.id || !localStorage.getItem('token')) {
            toast.error('Please login to generate thumbnail.');
            navigate('/login');
            return;
        }

        if (!title.trim() || !aspectRatio || !style || !colorSchemeId) {
            alert('Please fill title, style, color scheme and aspect ratio.');
            return;
        }

        setLoading(true);
        setLoadingStage('enhancing');
        try {
            const enhanceTimer = setTimeout(() => {
                setLoadingStage('generating');
            }, 4000);

            const response = await fetch('https://thumblify-zcvr.onrender.com/api/thumbnail/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    title: title.trim(),
                    additionalDetails: additionalDetails.trim(),
                    aspectRatio,
                    style,
                    colorScheme: colorSchemeId,
                }),
            });

            clearTimeout(enhanceTimer);

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate thumbnail');
            }

            const imageUrl = data.image_url;
            if (!imageUrl) {
                throw new Error('Server did not return image URL.');
            }
            setThumbnail({
                image_url: imageUrl,
                persisted: data.persisted ?? true,
                title: data.title || title.trim(),
                aspect_ratio: data.aspect_ratio || aspectRatio,
                style: data.style || style,
                color_scheme: data.color_scheme || colorSchemeId,
                prompt_used: data.prompt_used || '',
            });
        } catch (error) {
            alert(error.message || 'Something went wrong while generating thumbnail');
        } finally {
            setLoading(false);
            setLoadingStage('');
        }
    };

    const fetchThumbnail = async () => {
        if (!id) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to view this thumbnail.');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`https://thumblify-zcvr.onrender.com/api/thumbnail/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/login');
                return;
            }
            if (!res.ok) {
                throw new Error(data.error || 'Thumbnail not found.');
            }

            setThumbnail({
                image_url: data.image_url,
                persisted: true,
                title: data.title,
                aspect_ratio: data.aspect_ratio,
                style: data.style,
                color_scheme: data.color_scheme,
                prompt_used: data.prompt_used,
            });
            setAspectRatio(data.aspect_ratio || '16:9');
            setColorSchemeId(data.color_scheme || colorSchemes[0].id);
            setStyle(data.style || 'Bold & Graphic');
            setAdditionalDetails(data.additional_details || '');
            setTitle(data.title || '');
        } catch (err) {
            toast.error(err.message || 'Could not load thumbnail.');
            navigate('/my-generations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchThumbnail();
        }
    }, [id]);


    return (
        <>
            <SoftBackdrop />
            <div className='pt-24 min-h-screen'>
                <main className='max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8 pb-28 lg:pb-8'>
                    <div className='grid lg:grid-cols-[400px_1fr] gap-8'>
                        {/* Left Panel */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 30 }}
                            className={`space-y-6 ${id && "pointer-events-none"}`}
                        >
                            <div className='p-6 rounded-2xl bg-white/8 border border-white/12 shadow-xl space-y-6'>
                                <div>
                                    <h2 className='text-xl font-bold text-zinc-100 mb-1'>Create Your Thumbnail</h2>
                                    <p className='text-sm text-zinc-400'>AI enhances your prompt with props, icons, and visuals — then generates the image</p>
                                </div>

                                <div className='space-y-5'>
                                    {/* Title */}
                                    <div className='space-y-2'>
                                        <label className='block text-sm font-medium'>Title or Topic</label>
                                        <input type="text" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder='e.g. "10 Tips For Better Sleep"' className='w-full px-4 py-3 rounded-lg border border-white/12 bg-black/20 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500' />
                                        <div className='flex justify-end'>
                                            <span className='text-xs text-zinc-400'>{title.length}/100</span>
                                        </div>
                                    </div>

                                    {/* AspectRatioSelector */}
                                    <AspectRatioSelector aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />

                                    {/* StyleSelector */}
                                    <StyleSelector style={style} setStyle={setStyle} styleDropdownOpen={styleDropdownOpen} setStyleDropdownOpen={setStyleDropdownOpen} />

                                    {/* ColorSchemeSelector */}
                                    <ColorSchemeSelector colorSchemeId={colorSchemeId} setColorSchemeId={setColorSchemeId} />

                                    {/* Additional Details */}
                                    <div className='space-y-2'>
                                        <label className='block text-sm font-medium'>Additional Prompt <span
                                            className='text-zinc-400 text-xs'> (optional)</span></label>
                                        <textarea placeholder='Add specific elements, brands, or mood (e.g. laptop, charts, shocked face)...' rows={3}
                                            value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)}
                                            className='w-full px-4 py-3 rounded-lg border border-white/12 
                                        bg-black/20 text-zinc-100 placeholder:text-zinc-400 focus:outline-none 
                                        focus:ring-2 focus:ring-pink-500 resize-none'></textarea>
                                    </div>

                                </div>
                                {/* Button */}
                                {
                                    !id && (
                                        <button
                                            onClick={generateThumbnail}
                                            disabled={loading}
                                            className='text-[15px] w-full py-3.5 rounded-xl font-medium bg-linear-to-b from-pink-500 to-pink-600 hover:from-pink-700 disabled:cursor-not-allowed transition-colors'
                                        >
                                            {loading ? "Generating..." : "Generate Thumbnail"}
                                        </button>
                                    )
                                }
                            </div>
                        </motion.div>

                        {/* RIGHT PANEL */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.1 }}
                        >
                            <div className="p-6 rounded-2xl bg-white/8 border border-white/10 shadow-x1">
                                <h2 className="text-1g font-semibold text-zinc-100 mb-4">Preview</h2>
                                <PreviewPanel
                                    thumbnail={thumbnail}
                                    loading={loading}
                                    loadingStage={loadingStage}
                                    aspectRatio={aspectRatio}
                                />
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </>
    )
}

export default Generate
