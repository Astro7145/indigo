'use client';

import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import CommentSection from '@/src/components/post/CommentSection';
import PostMoreMenu from '@/src/components/post/PostMoreMenu';
import type { Comment } from '@/src/types/comment';
import type { Post } from '@/src/types/post';

const CURRENT_USER_ID = 99;

const POST: Post = {
  id: 1,
  teamId: '1',
  userId: 1,
  title: '할 일은 많은데 우선순위를 어떻게 정하시나요?',
  content: `요즘 할 일이 너무 많아서 어디서부터 손대야 할지 모르겠어요 😅
여러분은 중요도나 긴급도를 기준으로 나누시나요, 아니면 그냥 순서대로 하시나요?

추천 방법이 있다면 공유해 주세요!`,
  image: null,
  viewCount: 281,
  createdAt: '2025-05-22T10:00:00Z',
  updatedAt: '2025-05-22T10:00:00Z',
  writer: { id: 1, name: '체다치즈', image: null },
  commentCount: 3,
};

const COMMENTS: Comment[] = [
  {
    id: 1,
    teamId: '1',
    userId: 10,
    postId: 1,
    parentId: null,
    content: '오후엔 집중력이 떨어져서 오전에 어려운 일을 끝내두면 하루가 훨씬 편해요',
    likeCount: 0,
    isLiked: false,
    createdAt: '2025-05-22T11:00:00Z',
    updatedAt: '2025-05-22T11:00:00Z',
    writer: { id: 10, name: '고양이', image: null },
  },
  {
    id: 2,
    teamId: '1',
    userId: CURRENT_USER_ID,
    postId: 1,
    parentId: null,
    content: '우선 순위를 정해서 순서대로 하는 편이에요',
    likeCount: 0,
    isLiked: false,
    createdAt: '2025-05-22T12:00:00Z',
    updatedAt: '2025-05-22T12:00:00Z',
    writer: { id: CURRENT_USER_ID, name: '체다치즈', image: null },
  },
  {
    id: 3,
    teamId: '1',
    userId: 11,
    postId: 1,
    parentId: null,
    content: '저는 마감 기한이 가까운 순서로 정리해요. 마음의 여유가 생깁니다.',
    likeCount: 0,
    isLiked: false,
    createdAt: '2025-05-22T14:00:00Z',
    updatedAt: '2025-05-22T14:00:00Z',
    writer: { id: 11, name: '강아지', image: null },
  },
];

export default function PostDetailPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <article className="mx-auto max-w-3xl rounded-lg bg-white p-10 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{POST.title}</h1>
          <PostMoreMenu className="shrink-0" onEdit={() => {}} onDelete={() => {}} />
        </div>

        {/* 작성자 */}
        <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
          <IcProfileYellow className="size-6" />
          <span className="text-sm text-slate-700">{POST.writer.name}</span>
        </div>

        {/* 본문 */}
        <div className="mb-6 text-base whitespace-pre-line text-slate-800">{POST.content}</div>

        {/* 이미지 (있을 때) */}
        {POST.image && <img src={POST.image} alt="" className="mb-6 max-w-sm rounded" />}

        {/* 메타 */}
        <div className="mb-8 text-xs text-slate-500">
          {POST.createdAt.slice(0, 10).replace(/-/g, '.')} · 조회 {POST.viewCount}
        </div>

        <CommentSection comments={COMMENTS} currentUserId={CURRENT_USER_ID} />
      </article>
    </main>
  );
}
