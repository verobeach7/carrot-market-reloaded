export default function PotatoDefault() {
  // url이 매치되지 않는 경우에 Root의 layout.tsx에서 parallel route에 해당하는 페이지 컴포넌트를 찾을 수가 없어 404 에러 발생
  // 이를 막기 위해서 null을 반환
  return null;
}
