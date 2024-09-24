"use server";

import "server-only"; // server-only를 import하면 Client에서 이 함수를 호출하는 순간 에러를 발생시킴

export function fetchFromAPI() {
  fetch("......");
}
