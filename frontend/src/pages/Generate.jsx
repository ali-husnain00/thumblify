import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SoftBackdrop from '../components/SoftBackdrop';
import AspectRatioSelector from '../components/AspectRatioSelector';
import { colorSchemes, dummyThumbnails } from '../assets/assets';
import StyleSelector from '../components/StyleSelector';
import ColorSchemeSelector from '../components/ColorSchemeSelector';
import PreviewPanel from '../components/PreviewPanel';

const Generate = () => {
    const { id } = useParams()

    const [title, setTitle] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [colorSchemeId, setColorSchemeId] = useState(colorSchemes[0].id);
    const [style, setStyle] = useState('Bold & Graphic');
    const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
    const [titlePosition, setTitlePosition] = useState({ xPct: 50, yPct: 88 });
    const [titleFontScale, setTitleFontScale] = useState(1);
    const [titleTextStyle, setTitleTextStyle] = useState({
        fill: '#ffffff',
        outline: '#000000',
        outlineWidth: 2,
    });

    const stylePrompts = {
        'Bold & Graphic': 'eye-catching scene, vibrant colors, expressive subject or reaction, dramatic lighting, high contrast, click-worthy composition, graphic punch without any lettering',
        'Tech/Futuristic': 'futuristic environment, sleek modern shapes, glowing accents, holographic effects, cyber-tech mood, sharp lighting, abstract tech visuals only',
        'Minimalist': 'minimalist scene, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat look, clear focal point',
        'Photorealistic': 'photorealistic scene, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
        'Illustrated': 'illustrated scene, stylized characters or objects, bold outlines, vibrant colors, cartoon or vector art look, no captions',
    };

    const colorSchemeDescriptions = {
        vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
        sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
        forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
        neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
        purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
        monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
        ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
        pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
    };

    /** Visual prompt for the AI background only; title is rendered as a draggable overlay in the UI. */
    const buildBackgroundOnlyPrompt = (extra, styleBlock, colorBlock) => {
        const subject =
            extra?.trim() ||
            'one strong central subject that matches the topic, clear focal point, uncluttered areas suitable for a headline overlay';

        return [
            'Professional YouTube-style thumbnail background, broadcast-safe framing, generous clean margins.',
            `Subject and scene: ${subject}`,
            `Art direction (visual only, no text): ${styleBlock}`,
            `Color palette: ${colorBlock}`,
            'High detail, sharp focus, cinematic lighting.',
        ].join(' ');
    };

    const generateThumbnail = async () => {
        if (!title.trim() || !aspectRatio || !style || !colorSchemeId) {
            alert('Please fill title, style, color scheme and aspect ratio.');
            return;
        }

        const stylePrompt = stylePrompts[style] || style;
        const colorPrompt = colorSchemeDescriptions[colorSchemeId] || colorSchemeId;
        const finalPrompt = buildBackgroundOnlyPrompt(additionalDetails, stylePrompt, colorPrompt);
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/thumbnail/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    additionalDetails: additionalDetails.trim(),
                    aspectRatio,
                    style,
                    colorScheme: colorSchemeId,
                    prompt: finalPrompt,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate thumbnail');
            }

            setTitlePosition({ xPct: 50, yPct: 88 });
            const dataUrl = data.image_data_url
            if (!dataUrl) {
                throw new Error('Server did not return image data.')
            }
            setThumbnail({
                image_url: dataUrl,
                persisted: false,
                title: data.title || title.trim(),
                aspect_ratio: data.aspect_ratio || aspectRatio,
                style: data.style || style,
                color_scheme: data.color_scheme || colorSchemeId,
                prompt_used: data.prompt_used || finalPrompt,
            });
        } catch (error) {
            alert(error.message || 'Something went wrong while generating thumbnail');
        } finally {
            setLoading(false);
        }
    }

    const fetchThumbnail = async () => {
        if (!id) return;
        const thumbnail = dummyThumbnails.find((thumb) => thumb._id === id);
        setThumbnail({ ...thumbnail, persisted: true });
        setAspectRatio(thumbnail.aspect_ratio);
        setColorSchemeId(thumbnail.color_scheme);
        setStyle(thumbnail.style);
        setAdditionalDetails(thumbnail.prompt_used);
        setTitle(thumbnail.title);
        setTitlePosition({ xPct: 50, yPct: 88 });
        setLoading(false);
    }

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
                        <div className={`space-y-6 ${id && "pointer-events-none"}`}>
                            <div className='p-6 rounded-2xl bg-white/8 border border-white/12 shadow-xl space-y-6'>
                                <div>
                                    <h2 className='text-xl font-bold text-zinc-100 mb-1'>Create Your Thumbnail</h2>
                                    <p className='text-sm text-zinc-400'>Describe your vision and let AI bring it to life</p>
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
                                        <textarea placeholder='Add any specific elements, mood or style preferences...' rows={3}
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
                        </div>

                        {/* RIGHT PANEL */}
                        <div>
                            <div className="p-6 rounded-2xl bg-white/8 border border-white/10 shadow-x1">
                                <h2 className="text-1g font-semibold text-zinc-100 mb-4">Preview</h2>
                                <PreviewPanel
                                    thumbnail={thumbnail}
                                    loading={loading}
                                    aspectRatio={aspectRatio}
                                    overlayTitle={title.trim()}
                                    titlePosition={titlePosition}
                                    onTitlePositionChange={setTitlePosition}
                                    titleFontScale={titleFontScale}
                                    onTitleFontScaleChange={setTitleFontScale}
                                    titleTextStyle={titleTextStyle}
                                    onTitleTextStyleChange={setTitleTextStyle}
                                    apiBaseUrl="http://localhost:5000"
                                    onSaved={(imageUrl) => {
                                        setThumbnail((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      image_url: imageUrl,
                                                      persisted: true,
                                                  }
                                                : prev,
                                        )
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}

export default Generate