'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import Button from '@/src/components/common/buttons/Button';
import Modal from '@/src/components/common/modal/Modal';
import PostEditor from '@/src/components/post/PostEditor';
import PostImageAttachment from '@/src/components/post/PostImageAttachment';
import { useCreatePost, usePost, useUpdatePost } from '@/src/hooks/post';
import { useCreateImageUploadUrl } from '@/src/hooks/upload';

export type PostFormProps = { mode: 'create' } | { mode: 'edit'; postId: number };

function isHtmlEmpty(html: string) {
  return html.replace(/<[^>]*>/g, '').trim() === '';
}

export default function PostForm(props: PostFormProps) {
  const router = useRouter();
  const editId = props.mode === 'edit' ? props.postId : undefined;
  const { data: initialPost } = usePost(editId);
  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: updatePost } = useUpdatePost();
  const { mutateAsync: createImageUploadUrl } = useCreateImageUploadUrl();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 서버 데이터로 폼을 한 번만 채운다. mutation 응답이나 refetch가 사용자의 편집을 덮어쓰지 않도록 일회성 hydration 사용
  const hydrated = useRef(false);

  useEffect(() => {
    if (!initialPost || hydrated.current) return;
    setTitle(initialPost.title);
    setContent(initialPost.content);
    setImage(initialPost.image);
    hydrated.current = true;
  }, [initialPost]);

  const initialTitle = initialPost?.title ?? '';
  const initialContent = initialPost?.content ?? '';
  const initialImage = initialPost?.image ?? null;
  const isDirty = title !== initialTitle || content !== initialContent || image !== initialImage;
  const isValid = title.trim().length > 0 && !isHtmlEmpty(content);

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    router.back();
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { uploadUrl, url } = await createImageUploadUrl({ fileName: file.name });
    await fetch(uploadUrl, { method: 'PUT', body: file });
    setImage(url);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    const body = { title, content, ...(image ? { image } : {}) };
    if (props.mode === 'edit') {
      await updatePost({ postId: props.postId, body });
      router.push(`/posts/${props.postId}`);
      return;
    }
    const post = await createPost(body);
    router.push(`/posts/${post.id}`);
  };

  const headingText = props.mode === 'edit' ? '게시물 수정하기' : '게시물 작성하기';
  const submitText = props.mode === 'edit' ? '수정' : '등록';

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">{headingText}</h1>
        <div className="flex gap-2">
          <Button variant="tertiary" size="medium" onClick={handleCancel}>
            취소
          </Button>
          <Button variant="primary" size="medium" disabled={!isValid} onClick={handleSubmit}>
            {submitText}
          </Button>
        </div>
      </header>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={30}
        placeholder="게시물의 제목을 입력해주세요"
        aria-label="제목"
      />
      <PostEditor
        value={content}
        onChange={setContent}
        onImageClick={handleImageClick}
        placeholder="이 곳을 통해 내용을 작성해주세요"
      />
      {image && <PostImageAttachment src={image} onDelete={() => setImage(null)} />}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="이미지 파일 선택"
        onChange={handleFileChange}
      />

      <Modal open={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}>
        <Modal.Title>작성 중인 내용이 사라져요. 그래도 나가시겠어요?</Modal.Title>
        <Modal.Actions>
          <Modal.Cancel>계속 작성</Modal.Cancel>
          <Modal.Confirm onClick={() => router.back()}>나가기</Modal.Confirm>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
