import { ScanIcon } from '@/components/icons/scan.icon';
import { ComponentProps } from 'react';
import { UserSquareIcon } from '@/components/icons/user-square.icon';
import { useAuth } from '@/hooks/auth.hook';
import { EditOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'next-i18next';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

export const ProfileAccount = ({ }: ComponentProps<any>) => {
  const { t } = useTranslation('common');
  const [auth, updateAuth] = useAuth();

  const handleUpdateAuth = () => {
    updateAuth({ userName: 'JohnDoe', email: 'johndoe@example.com' });
  };

  if (auth && auth.email) {
    if (auth.kyc) {
      return (
        <div className="my-profile-page-wrapper__account__content--has-account--verified">
          <div className="my-profile-page-wrapper__account__content--has-account--verified__content">
            <div className="my-profile-page-wrapper__account__content--has-account--verified__content__title">
              {t('MY_PROFILE_ACCOUNT_DETAIL')}
            </div>
            <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body">
              <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item">
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__title">
                  {t('MY_PROFILE_ACCOUNT_USERNAME')}
                </span>
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__value">
                  username01
                </span>
              </div>
              <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item">
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__title">
                  {t('MY_PROFILE_ACCOUNT_EMAIL')}
                </span>
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__value">
                  mail@mail.com
                </span>
              </div>
              <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item">
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__title">
                  {t('MY_PROFILE_ACCOUNT_PASSWORD')}
                </span>
                <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__value">
                  ********{' '}
                  <Button icon={<EditOutlined />} type="text">
                    {t('MY_PROFILE_ACCOUNT_PASSWORD_CHANGE')}
                  </Button>
                </div>
              </div>
            </div>
            <div className="my-profile-page-wrapper__account__content--has-account--verified__content__title">
              {t('MY_PROFILE_ACCOUNT_PERSONAL_DETAIL')}
            </div>
            <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body">
              <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item">
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__title">
                  {t('MY_PROFILE_ACCOUNT_PERSONAL_FULL_NAME')}
                </span>
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__value">
                  James E. Hart
                </span>
              </div>
              <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item">
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__title">
                  {t('MY_PROFILE_ACCOUNT_PERSONAL_DATE_BIRTH')}
                </span>
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__value">
                  12/12/2001
                </span>
              </div>
              <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item">
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__title">
                  {t('MY_PROFILE_ACCOUNT_PERSONAL_SSN')}
                </span>
                <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__value">
                  84753293465
                </div>
              </div>
              <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item">
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__title">
                  {t('MY_PROFILE_ACCOUNT_PERSONAL_PHONE_NUMBER')}
                </span>
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__value">
                  303-956-4577
                </span>
              </div>
              <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item">
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__title">
                  {t('MY_PROFILE_ACCOUNT_PERSONAL_ADDRESS')}
                </span>
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__value">
                  1023 Roy Alley, Empire, Colorado, 80438
                </span>
              </div>
              <div className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item">
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__title">
                  {t('MY_PROFILE_ACCOUNT_PERSONAL_EMAIL_ADDRESS')}
                </span>
                <span className="my-profile-page-wrapper__account__content--has-account--verified__content__body__item__value">
                  mail@mail.com
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="my-profile-page-wrapper__account__content--has-account--no-verified">
        <div className="my-profile-page-wrapper__account__content--has-account--no-verified__content">
          <div className="my-profile-page-wrapper__account__content--has-account--no-verified__content__title">
            {t('MY_PROFILE_ACCOUNT_DETAIL')}
          </div>
          <div className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body">
            <div className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body__item">
              <span className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body__item__title">
                {t('MY_PROFILE_ACCOUNT_USERNAME')}
              </span>
              <span className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body__item__value">
                username01
              </span>
            </div>
            <div className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body__item">
              <span className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body__item__title">
                {t('MY_PROFILE_ACCOUNT_EMAIL')}
              </span>
              <span className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body__item__value">
                mail@mail.com
              </span>
            </div>
            <div className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body__item">
              <span className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body__item__title">
                {t('MY_PROFILE_ACCOUNT_PASSWORD')}
              </span>
              <div className="my-profile-page-wrapper__account__content--has-account--no-verified__content__body__item__value">
                ********{' '}
                <Button icon={<EditOutlined />} type="text">
                  {t('MY_PROFILE_ACCOUNT_PASSWORD_CHANGE')}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer">
          <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__left">
            <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__left__item">
              <UserSquareIcon className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__left__item__icon" />
              <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__left__item__wrapper">
                <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__left__item__title">
                  {t('MY_PROFILE_ACCOUNT_STEP', {
                    number: 1
                  })}
                </div>
                {t('MY_PROFILE_ACCOUNT_IDENTITY_DOCUMENT')}
              </div>
            </div>
            <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__left__item">
              <ScanIcon className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__left__item__icon" />
              <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__left__item__wrapper">
                <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__left__item__title">
                  {t('MY_PROFILE_ACCOUNT_STEP', {
                    number: 2
                  })}
                </div>
                {t('MY_PROFILE_ACCOUNT_FACE_SCAN')}
              </div>
            </div>
          </div>

          <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__right">
            <Button
              type="primary"
              onClick={() => updateAuth({ kyc: true })}
              className={twMerge('btn-primary-custom')}>
              {t('MY_PROFILE_ACCOUNT_CONTINUE')}
            </Button>
            <div className="my-profile-page-wrapper__account__content--has-account--no-verified__footer__right__powered">
              {t('MY_PROFILE_ACCOUNT_POWERED_BY')} <Image src="/images/sumsub.png" alt="Sumsub" width={84} height={34} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-profile-page-wrapper__account__content--no-account">
      <Button
        type="primary"
        className={twMerge(
          'btn-primary-custom',
          'my-profile-page-wrapper__account__content--no-account__signup',
        )}>
        {t('MY_PROFILE_ACCOUNT_SIGNUP')}
      </Button>
      <div className="my-profile-page-wrapper__account__content--no-account__signin">
        {t('MY_PROFILE_ACCOUNT_SIGNIN_MSG')}
        <Button onClick={handleUpdateAuth} type="link">
          {t('MY_PROFILE_ACCOUNT_SIGNIN')}
        </Button>
      </div>
    </div>
  );
};
