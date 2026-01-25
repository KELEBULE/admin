import { computed } from 'vue';
import { useCountDown, useLoading } from '@sa/hooks';
import { REG_EMAIL } from '@/constants/reg';
import { fetchLoginCode } from '@/service/api/manage/email';
import { $t } from '@/locales';
export function useCaptcha() {
  const { loading, startLoading, endLoading } = useLoading();
  const { count, start, stop, isCounting } = useCountDown(10);

  const label = computed(() => {
    let text = $t('page.login.codeLogin.getCode');

    const countingLabel = $t('page.login.codeLogin.reGetCode', { time: count.value });

    if (loading.value) {
      text = '';
    }

    if (isCounting.value) {
      text = countingLabel;
    }

    return text;
  });

  function isEmailValid(email: string) {
    if (email.trim() === '') {
      window.$message?.error?.($t('form.email.required'));

      return false;
    }

    if (!REG_EMAIL.test(email)) {
      window.$message?.error?.('邮箱格式错误');

      return false;
    }

    return true;
  }

  async function getCaptcha(email: string) {
    const valid = isEmailValid(email);

    if (!valid || loading.value) {
      return;
    }

    startLoading();

    // request
    await new Promise(resolve => {
      fetchLoginCode(email).then(resolve);
    });

    window.$message?.success?.($t('page.login.codeLogin.sendCodeSuccess'));

    start();

    endLoading();
  }

  return {
    label,
    start,
    stop,
    isCounting,
    loading,
    getCaptcha
  };
}
