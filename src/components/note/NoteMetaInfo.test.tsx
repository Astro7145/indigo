import { render, screen } from '@testing-library/react';

import NoteMetaInfo from './NoteMetaInfo';

it('목표·작성일·할일·태그를 모두 렌더한다', () => {
  render(
    <NoteMetaInfo
      goalTitle="자바스크립트로 웹 서비스 만들기"
      todoTitle="기초 챕터1 듣기"
      todoDone={false}
      tags={[
        { id: 1, name: '코딩' },
        { id: 2, name: '공부' },
      ]}
      createdAt="2024-03-25T00:00:00.000Z"
    />,
  );

  expect(screen.getByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
  expect(screen.getByText('기초 챕터1 듣기')).toBeInTheDocument();
  expect(screen.getByText('TO DO')).toBeInTheDocument();
  expect(screen.getByText('2024. 03. 25')).toBeInTheDocument();
  expect(screen.getByText('코딩')).toBeInTheDocument();
  expect(screen.getByText('공부')).toBeInTheDocument();
});

it('todoDone=true 이면 DONE 라벨이 표시된다', () => {
  render(<NoteMetaInfo goalTitle="g" todoTitle="t" todoDone={true} createdAt="2024-01-01T00:00:00.000Z" />);

  expect(screen.getByText('DONE')).toBeInTheDocument();
});

it('태그가 없으면 태그 행을 렌더하지 않는다', () => {
  render(<NoteMetaInfo goalTitle="g" todoTitle="t" todoDone={false} createdAt="2024-01-01T00:00:00.000Z" />);

  expect(screen.queryByText('태그')).not.toBeInTheDocument();
});

it('할일 제목이 길어도 상태 칩이 줄어들지 않아 한 줄로 유지된다', () => {
  render(
    <NoteMetaInfo
      goalTitle="g"
      todoTitle="아주 길고 긴 할일 제목이 들어와서 칩을 밀어내려 하는 상황"
      todoDone={false}
      createdAt="2024-01-01T00:00:00.000Z"
    />,
  );

  expect(screen.getByText('TO DO')).toHaveClass('shrink-0');
});
