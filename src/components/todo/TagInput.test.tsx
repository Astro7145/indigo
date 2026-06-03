import { fireEvent, render, screen } from '@testing-library/react';

import TagInput, { type Tag } from '@/src/components/todo/TagInput';

const PLACEHOLDER = '입력 후 Enter';

describe('TagInput', () => {
  it('Enter 키로 입력값을 새 태그로 추가한다', () => {
    const onChange = jest.fn();
    render(<TagInput value={[]} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: '운동' } });
    fireEvent.keyDown(screen.getByPlaceholderText(PLACEHOLDER), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith([{ text: '운동', color: 'green' }]);
  });

  it('빈 값으로 Enter 시 태그가 추가되지 않는다', () => {
    const onChange = jest.fn();
    render(<TagInput value={[]} onChange={onChange} />);
    fireEvent.keyDown(screen.getByPlaceholderText(PLACEHOLDER), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('공백만 있는 값으로 Enter 시 태그가 추가되지 않는다', () => {
    const onChange = jest.fn();
    render(<TagInput value={[]} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: '   ' } });
    fireEvent.keyDown(screen.getByPlaceholderText(PLACEHOLDER), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('이미 존재하는 텍스트는 중복으로 추가되지 않는다', () => {
    const onChange = jest.fn();
    render(<TagInput value={[{ text: '운동', color: 'green' }]} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: '운동' } });
    fireEvent.keyDown(screen.getByPlaceholderText(PLACEHOLDER), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('기존 태그가 있을 때 새 태그는 기존 개수 다음 색상부터 부여된다', () => {
    const onChange = jest.fn();
    const initial: Tag[] = [
      { text: 'a', color: 'green' },
      { text: 'b', color: 'yellow' },
      { text: 'c', color: 'red' },
    ];
    render(<TagInput value={initial} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: '취미' } });
    fireEvent.keyDown(screen.getByPlaceholderText(PLACEHOLDER), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith([...initial, { text: '취미', color: 'purple' }]);
  });

  it('태그 삭제 버튼 클릭 시 해당 태그가 제거된 배열로 onChange가 호출된다', () => {
    const onChange = jest.fn();
    const initial: Tag[] = [
      { text: '운동', color: 'green' },
      { text: '공부', color: 'yellow' },
    ];
    render(<TagInput value={initial} onChange={onChange} />);
    fireEvent.click(screen.getAllByLabelText('태그 삭제')[0]);
    expect(onChange).toHaveBeenCalledWith([{ text: '공부', color: 'yellow' }]);
  });

  it('Enter 외의 키 입력으로는 태그가 추가되지 않는다', () => {
    const onChange = jest.fn();
    render(<TagInput value={[]} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: '운동' } });
    fireEvent.keyDown(screen.getByPlaceholderText(PLACEHOLDER), { key: 'Tab' });
    fireEvent.keyDown(screen.getByPlaceholderText(PLACEHOLDER), { key: ' ' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
