import type { Metadata } from "next";
import { Roboto, Rubik_Scribble } from "next/font/google";
// 앱 내에 파일로 포함시킨 font를 사용하기 위해 다음과 같이 import
import localFont from "next/font/local";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  // font definition을 css변수로 선언하기도 함. 변수명은 -- 로 시작해야 함
  variable: "--roboto-text",
});

const rubik = Rubik_Scribble({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--rubik-text",
});

const metallica = localFont({
  src: "./metallica.ttf",
  variable: "--metallica-text",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Carrot Market",
    default: "Carrot Market",
  },
  description: "Sell and buy all the things",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // console.log(roboto);
  // console.log(metallica);
  return (
    <html lang="en">
      {/* <body
        className={`${roboto.className} bg-neutral-900 text-white max-w-screen-md mx-auto`}
      > */}
      {/* <body
        className={`bg-neutral-900 text-white max-w-screen-md mx-auto`}
        style={roboto.style}
        > */}
      <body
        className={`${roboto.variable} ${rubik.variable} ${metallica.variable} bg-neutral-900 text-white max-w-screen-md mx-auto`}
      >
        {children}
      </body>
    </html>
  );
}
