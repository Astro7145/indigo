/**
 * 노트 모아보기 레이아웃 — 병렬 라우트. children=리스트(또는 standalone 노트),
 * @detail=인터셉트 드로어 슬롯. 리스트에서 클릭 시 @detail에 드로어가 채워지고,
 * 새로고침/직접 진입 시 @detail은 default(null), children이 standalone 페이지를 렌더한다.
 */
export default function NotesLayout({ children, detail }: { children: React.ReactNode; detail: React.ReactNode }) {
  return (
    <>
      {children}
      {detail}
    </>
  );
}
