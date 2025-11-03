"use client";

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { FaceSmileIcon, TagIcon } from '@heroicons/react/24/outline';

// Custom paper-plane Share Icon (matches card icon)
const ShareIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
	<svg
		className={className}
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

interface Comment {
	id: string;
	user_id: string;
	content: string | null;
	created_at: string;
	author?: { full_name?: string; avatar_url?: string } | null;
	likes_count?: number;
	replies_count?: number;
	liked_by_me?: boolean;
}

interface CompletedDareLite {
	id: string;
	dare_id: string;
	media_urls: string[];
	caption?: string;
	location?: string;
	created_at: string;
	smile_count?: number;
	share_count?: number;
	completer?: { full_name?: string; avatar_url?: string } | null;
	dare?: {
		title: string;
		description?: string;
		hashtag?: string;
		vibe?: string;
		creator?: { full_name?: string; avatar_url?: string } | null;
	} | null;
}

export function CommentModal({
	open,
	onClose,
	completedDare,
	onSubmitComment,
	onEngagement,
	onOpenTagModal,
	onTryDare,
}: {
	open: boolean;
	onClose: () => void;
	completedDare: CompletedDareLite;
	onSubmitComment: (text: string) => Promise<void> | void;
	onEngagement: (type: string, content?: string) => void;
	onOpenTagModal?: () => void;
	onTryDare?: (dareId: string) => void;
}) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(false);
	const [posting, setPosting] = useState(false);
	const [text, setText] = useState('');
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [smileCount, setSmileCount] = useState<number>(completedDare.smile_count || 0);
	const [shareCount, setShareCount] = useState<number>(completedDare.share_count || 0);
	const [isSmiled, setIsSmiled] = useState(false);

	useEffect(() => {
		async function fetchComments() {
			if (!open) return;
			setLoading(true);
			try {
				const res = await fetch(`/api/dares/engagements/list?completed_dare_id=${completedDare.id}&limit=100`);
				const data = await res.json();
				if (res.ok) setComments((data.comments || []).map((c: Comment) => ({ ...c, likes_count: c.likes_count ?? 0, replies_count: c.replies_count ?? 0, liked_by_me: c.liked_by_me ?? false })));
				else setComments([]);
			} catch (e) {
				setComments([]);
			} finally {
				setLoading(false);
			}
		}
		fetchComments();
	}, [open, completedDare.id]);

	const handlePost = async () => {
		if (!text.trim()) return;
		setPosting(true);
		try {
			await onSubmitComment(text.trim());
			setText('');
			const res = await fetch(`/api/dares/engagements/list?completed_dare_id=${completedDare.id}&limit=100`);
			const data = await res.json();
			if (res.ok) setComments((data.comments || []).map((c: Comment) => ({ ...c, likes_count: c.likes_count ?? 0, replies_count: c.replies_count ?? 0, liked_by_me: c.liked_by_me ?? false })));
		} finally {
			setPosting(false);
		}
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev === 0 ? (completedDare.media_urls?.length || 1) - 1 : prev - 1));
	};

	const nextImage = () => {
		setCurrentImageIndex((prev) => ((completedDare.media_urls?.length || 1) > 0 ? (prev + 1) % (completedDare.media_urls.length) : 0));
	};

	const formatTimeAgo = (iso: string) => {
		const now = Date.now();
		const t = new Date(iso).getTime();
		const diff = Math.max(0, Math.floor((now - t) / 1000));
		if (diff < 60) return `${diff}s ago`;
		const m = Math.floor(diff / 60);
		if (m < 60) return `${m}m ago`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}h ago`;
		const d = Math.floor(h / 24);
		return `${d}d ago`;
	};

	const toggleLike = (id: string) => {
		setComments((prev) => prev.map((c) => c.id === id ? { ...c, liked_by_me: !c.liked_by_me, likes_count: (c.likes_count || 0) + (c.liked_by_me ? -1 : 1) } : c));
	};

	const handleSmile = () => {
		setIsSmiled(!isSmiled);
		setSmileCount((prev) => prev + (isSmiled ? -1 : 1));
		onEngagement('smile');
	};

	const handleShareEngagement = () => {
		setShareCount((prev) => prev + 1);
		onEngagement('share');
	};

	const handleTag = () => {
		if (onOpenTagModal) {
			onOpenTagModal();
		} else {
			onEngagement('tag');
		}
	};

	return (
		<Modal open={open} onClose={onClose} size="full" className="p-0" contentClassName="overflow-hidden">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-[90vh]">
				{/* Left: Media */}
				<div className="relative bg-black h-full group">
					{completedDare.media_urls?.length ? (
						<>
							<img src={completedDare.media_urls[currentImageIndex]} alt="Completed dare" className="absolute inset-0 w-full h-full object-contain" />
							{completedDare.media_urls.length > 1 && (
								<>
									<button onClick={prevImage} className="hidden md:flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 shadow-lg group-hover:flex" aria-label="Previous image">
										<svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 4.293a1 1 0 010 1.414L9.414 9H16a1 1 0 110 2H9.414l3.293 3.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
									</button>
									<button onClick={nextImage} className="hidden md:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 shadow-lg group-hover:flex" aria-label="Next image">
										<svg className="w-5 h-5 rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 4.293a1 1 0 010 1.414L9.414 9H16a1 1 0 110 2H9.414l3.293 3.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
									</button>
									<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
										{completedDare.media_urls.map((_, i) => (
											<button key={i} onClick={() => setCurrentImageIndex(i)} className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
										))}
									</div>
								</>
							)}
						</>
					) : (
						<div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">No media</div>
					)}
				</div>

				{/* Right */}
				<div className="h-full flex flex-col bg-white">
					{/* Sticky header */}
					<div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
						<div className="relative flex items-start justify-between">
							<div className="flex-1">
								<div className="relative">
									<div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center absolute left-0 top-0">
										{completedDare.dare?.creator?.avatar_url ? (
											<img src={completedDare.dare.creator.avatar_url} alt={completedDare.dare.creator.full_name || 'User'} className="w-full h-full object-cover" />
										) : (
											<span className="text-gray-600 font-medium">{completedDare.dare?.creator?.full_name?.charAt(0) || '?'}</span>
										)}
									</div>
									<div className="pl-11">
										<div className="text-sm font-semibold text-gray-900">{completedDare.dare?.creator?.full_name || 'Anonymous'}</div>
										<div className="mt-2 text-sm text-gray-800 font-semibold">{completedDare.dare?.title}</div>
									</div>
								</div>
							</div>
							{onTryDare && completedDare.dare_id && (
								<button
									onClick={() => onTryDare(completedDare.dare_id)}
									className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors whitespace-nowrap ml-4"
								>
									Accept Dare
								</button>
							)}
						</div>
					</div>

					{/* Scrollable middle (caption and comments) */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{completedDare.caption && (
							<div className="relative">
								{/* Completer avatar next to caption */}
								<div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center absolute left-0 top-0">
									{completedDare.completer?.avatar_url ? (
										<img src={completedDare.completer.avatar_url} alt={completedDare.completer.full_name || 'User'} className="w-full h-full object-cover" />
									) : (
										<span className="text-gray-600 text-xs font-medium">{completedDare.completer?.full_name?.charAt(0) || '?'}</span>
									)}
								</div>
								<div className="pl-11">
									{/* Completer name and location */}
									<div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
										<span>{completedDare.completer?.full_name || 'Anonymous'}</span>
										{completedDare.location && (
											<span className="text-xs font-normal text-gray-500">{completedDare.location}</span>
										)}
									</div>
									{/* Caption text */}
									<div className="text-sm text-gray-900 whitespace-pre-wrap">{completedDare.caption}</div>
								</div>
							</div>
						)}

						<div className="space-y-4">
							{loading ? (
								<div className="pl-11 text-sm text-gray-500">Loading comments...</div>
							) : comments.length === 0 ? (
								<div className="pl-11 text-sm text_gray-500">No comments yet.</div>
							) : (
								comments.map((c) => (
									<div key={c.id} className="space-y-1">
										<div className="relative">
											<div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify_center absolute left-0 top-0">
												{c.author?.avatar_url ? (
													<img src={c.author.avatar_url} alt={c.author.full_name || 'User'} className="w-full h-full object-cover" />
												) : (
													<span className="text-gray-600 text-xs font-medium">{c.author?.full_name?.charAt(0) || '?'}</span>
												)}
											</div>
											<div className="pl-11 pr-8">
												<div className="text-sm text-gray-900">
													<span className="font-semibold">{c.author?.full_name || 'Anonymous'}</span> <span className="text-gray-700">{c.content}</span>
												</div>
											</div>
											<button onClick={() => toggleLike(c.id)} aria-label="Like comment" className="absolute right-0 top-0 p-1 text-gray-600 hover:text-red-500">
												{c.liked_by_me ? <HeartSolidIcon className="w-5 h-5 text_red-500" /> : <HeartIcon className="w-5 h-5" />}
											</button>
										</div>
										<div className="pl-11 flex items-center gap-3 text-xs text-gray-500">
											<span title={new Date(c.created_at).toLocaleString()}>{formatTimeAgo(c.created_at)}</span>
											{(c.likes_count || 0) > 0 && <span>{c.likes_count} {c.likes_count === 1 ? 'like' : 'likes'}</span>}
											<button className="hover:underline">Reply</button>
											{(c.replies_count || 0) > 0 && <span>{c.replies_count} {c.replies_count === 1 ? 'reply' : 'replies'}</span>}
										</div>
									</div>
								))
							)}
						</div>
					</div>

					{/* Sticky footer styled like Instagram */}
					<div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white z-10 space-y-2">
						{/* Reactions row */}
						<div className="pr-2 flex items-center justify-between">
							<div className="flex items-center gap-5">
								<button onClick={handleSmile} className="flex items-center gap-1.5 text-gray-900 hover:scale-105 transition-transform" aria-label={isSmiled ? 'Remove smile' : 'Add smile'}>
									<FaceSmileIcon className={`w-6 h-6 ${isSmiled ? 'text-red-500' : ''}`} />
								</button>
								<button onClick={handleShareEngagement} className="flex items-center gap-1.5 text-gray-900 hover:scale-105 transition-transform" aria-label="Share">
									<ShareIcon className="w-6 h-6" />
								</button>
								<button onClick={handleTag} className="flex items-center gap-1.5 text-gray-900 hover:scale-105 transition-transform" aria-label="Tag someone">
									<TagIcon className="w-6 h-6" />
								</button>
							</div>
							<div />
						</div>
						{/* Metrics row */}
						<div className="text-sm font-semibold text-gray-900">
							{smileCount > 0 ? `${smileCount.toLocaleString()} ${smileCount === 1 ? 'smile' : 'smiles'}` : ''}
						</div>
						<div className="text-xs text-gray-500" title={new Date(completedDare.created_at).toLocaleString()}>
							{formatTimeAgo(completedDare.created_at)}
						</div>
						{/* Composer */}
						<div className="pt-2 border-t border-gray-100 flex items-center gap-2">
							<input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..." className="flex-1 border-none outline-none text-sm placeholder-gray-500" />
							<button onClick={handlePost} disabled={posting || !text.trim()} className={`text-sm font-semibold ${posting || !text.trim() ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-600 hover:text-yellow-700'}`}>
								Post
							</button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
