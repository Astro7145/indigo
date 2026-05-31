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
  const submitText = props.mode === 'edit' ? '수정하기' : '등록하기';

  const contentText = content.replace(/<[^>]*>/g, '');
  const contentCharCount = contentText.length;
  const contentNoSpaceCount = contentText.replace(/\s/g, '').length;

  return (
    <div className="mx-auto w-full max-w-[343px] md:max-w-[636px] xl:max-w-[768px]">
      <header className="mb-4 flex h-10 items-center justify-between gap-3 md:mb-3">
        <h1 className="truncate text-base font-semibold tracking-[-0.03em] text-slate-800 md:text-2xl">
          {headingText}
        </h1>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="tertiary"
            size="small"
            onClick={handleCancel}
            className="md:h-10 md:w-[106px] md:px-0 md:py-0 md:text-base"
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="small"
            disabled={!isValid}
            onClick={handleSubmit}
            className="md:h-10 md:w-[106px] md:px-0 md:py-0 md:text-base"
          >
            {submitText}
          </Button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-156px)] flex-col rounded-lg bg-white px-4 py-4 md:min-h-[calc(100vh-100px)] md:px-[30px] md:py-8 lg:min-h-[calc(100vh-212px)] xl:px-[34px]">
        <PostEditor
          value={content}
          onChange={setContent}
          onImageClick={handleImageClick}
          placeholder="이 곳을 통해 내용을 작성해주세요"
          contentClassName="prose max-w-none min-h-[552px] pt-6 text-sm text-slate-800 md:min-h-[600px] md:pt-5 md:text-base xl:min-h-[635px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
          titleSlot={
            <div className="pt-[29px]">
              <div className="flex items-end justify-between gap-3 pb-4 md:gap-4 md:pb-6 xl:pb-7">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={30}
                  placeholder="게시물의 제목을 입력해주세요"
                  aria-label="제목"
                  className="min-w-0 flex-1 text-base font-semibold tracking-[-0.03em] text-slate-800 outline-none placeholder:text-slate-400 md:text-2xl"
                />
                <span className="shrink-0 text-xs text-slate-400 md:text-sm">{title.length}/30</span>
              </div>
              <div className="border-b border-slate-200" />
            </div>
          }
        />

        {image && (
          <div className="pt-4 md:pt-6">
            <PostImageAttachment src={image} onDelete={() => setImage(null)} />
          </div>
        )}

        <div className="mt-auto pt-4 text-right text-xs text-slate-400 md:text-sm">
          공백포함 {contentCharCount}자 | 공백제외 {contentNoSpaceCount}자
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="이미지 파일 선택"
        onChange={handleFileChange}
      />

      <Modal open={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} className="h-[178px] sm:h-[250px]">
        <Modal.Title className="text-center text-base sm:text-xl">게시물 작성을 취소하시겠어요?</Modal.Title>
        <p className="mt-1 mb-6 flex items-center justify-center gap-1 text-xs font-medium text-red-500 sm:mb-10 sm:text-base">
          <span
            aria-hidden
            className="inline-flex size-4 items-center justify-center rounded-full border border-red-500 text-[10px] sm:size-5 sm:text-xs"
          >
            !
          </span>
          작성하신 모든 내용이 사라집니다.
        </p>
        <Modal.Actions>
          <Modal.Cancel className="h-10 w-[151.5px] sm:h-14 sm:w-[190px]">취소</Modal.Cancel>
          <Modal.Confirm className="h-10 w-[151.5px] sm:h-14 sm:w-[190px]" onClick={() => router.back()}>
            확인
          </Modal.Confirm>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
