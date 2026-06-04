export interface UploadUrlBody {
  fileName: string;
}

export interface UploadUrlResponse {
  /** 이 URL로 PUT 요청하여 실제 파일을 업로드한다 (호출자 책임). */
  uploadUrl: string;
  /** 업로드 완료 후 다른 API에서 사용할 최종 파일 URL. */
  url: string;
}
