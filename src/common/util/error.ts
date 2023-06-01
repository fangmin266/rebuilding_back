import { HttpException } from '@nestjs/common';

export function handleSocialLoginError(res, mainPageUrl, error) {
  let errorMessage = '';

  if (error instanceof HttpException) {
    errorMessage = '이미 가입된 이메일 혹은 소셜이 있습니다.';
  } else {
    errorMessage = '로그인에 문제가 있습니다.';
  }

  res.redirect(
    `${mainPageUrl}/login?error=${encodeURIComponent(errorMessage)}`,
  );
}
