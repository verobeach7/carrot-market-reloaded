import { ForwardedRef, InputHTMLAttributes, forwardRef } from "react";

interface InputProps {
  // name도 InputHTMLAttributes에 포함되어 있지만 남겨둠
  // name은 actions.ts의 formData를 사용하기 위해 필수적으로 적어야하는데 이곳에 남겨두면 Input 컴포넌트를 호출하는 곳에서 name을 적지 않았을 때 TypeScript 오류를 발생시킴
  name: string;
  errors?: string[];
}

const _Input = (
  {
    name,
    errors = [],
    // name과 errors를 제외한 나머저 input props를 한꺼번에 받아올 수 있음
    // Spread 연산자: 이름은 rest가 아닌 무엇이든지 상관없음
    ...rest
  }: InputProps & InputHTMLAttributes<HTMLInputElement>, // props
  ref: ForwardedRef<HTMLInputElement> // forwardedRef
) => {
  // console.log(rest);
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={ref}
        name={name}
        className="bg-transparent rounded-md w-full h-10 focus:outline-none ring-1 focus:ring-4 transition ring-neutral-200 focus:ring-orange-500 border-none placeholder:text-neutral-400"
        {...rest}
      />
      {errors.map((error, index) => (
        <span key={index} className="text-red-500">
          {error}
        </span>
      ))}
    </div>
  );
};

export default forwardRef(_Input);
